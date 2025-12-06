import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface EmailRequest {
  lead_id: string;
  campaign_id?: string;
  template_id?: string;
  user_id: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!sendgridApiKey) {
      throw new Error("SENDGRID_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl!, supabaseKey!);
    const { lead_id, campaign_id, template_id, user_id }: EmailRequest = await req.json();

    // Get lead details
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single();

    if (leadError || !lead) {
      throw new Error("Lead not found");
    }

    if (!lead.email) {
      throw new Error("Lead has no email address");
    }

    // Check if email is unsubscribed
    const { data: unsubscribe } = await supabase
      .from("unsubscribes")
      .select("id")
      .eq("email", lead.email)
      .single();

    if (unsubscribe) {
      throw new Error("Email is unsubscribed");
    }

    // Check daily limit
    const today = new Date().toISOString().split('T')[0];
    const { data: limitData } = await supabase
      .from("daily_send_limits")
      .select("*")
      .eq("user_id", user_id)
      .single();

    let currentSent = 0;
    let dailyLimit = 100;

    if (limitData) {
      if (limitData.last_reset_date !== today) {
        // Reset counter for new day
        await supabase
          .from("daily_send_limits")
          .update({ sent_today: 0, last_reset_date: today })
          .eq("user_id", user_id);
        currentSent = 0;
      } else {
        currentSent = limitData.sent_today;
        dailyLimit = limitData.daily_limit;
      }
    } else {
      // Create limit record
      await supabase
        .from("daily_send_limits")
        .insert({ user_id, daily_limit: 100, sent_today: 0, last_reset_date: today });
    }

    if (currentSent >= dailyLimit) {
      throw new Error(`Daily sending limit of ${dailyLimit} emails reached`);
    }

    // Get template if specified
    let subject = "Grow Your Business with a Professional Website";
    let content = `Hi ${lead.business_name},

I noticed your business online and saw you don't yet have a website.
I help businesses like yours get professional websites that bring customers.

Would you like me to set one up for you?

Best regards`;

    if (template_id) {
      const { data: template } = await supabase
        .from("templates")
        .select("*")
        .eq("id", template_id)
        .single();

      if (template) {
        subject = template.subject;
        content = template.content;
      }
    }

    // Personalize content
    const personalizedContent = content
      .replace(/{{business_name}}/g, lead.business_name || "Business Owner")
      .replace(/{{category}}/g, lead.category || "")
      .replace(/{{city}}/g, lead.city || "")
      .replace(/{{state}}/g, lead.state || "");

    const personalizedSubject = subject
      .replace(/{{business_name}}/g, lead.business_name || "Business Owner")
      .replace(/{{category}}/g, lead.category || "");

    // Generate tracking pixel and unsubscribe link
    const trackingId = crypto.randomUUID();
    const unsubscribeUrl = `${supabaseUrl}/functions/v1/handle-unsubscribe?email=${encodeURIComponent(lead.email)}`;
    
    // CAN-SPAM compliant footer
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        ${personalizedContent.replace(/\n/g, '<br>')}
        <br><br>
        <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
        <p style="font-size: 12px; color: #666;">
          You received this email because your business was identified as potentially benefiting from our services.<br>
          <a href="${unsubscribeUrl}" style="color: #666;">Unsubscribe from future emails</a>
        </p>
      </div>
    `;

    console.log(`Sending email to: ${lead.email}`);

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: lead.email, name: lead.business_name }],
            subject: personalizedSubject,
          },
        ],
        from: {
          email: "outreach@yourdomain.com",
          name: "Website Services",
        },
        content: [
          {
            type: "text/html",
            value: htmlContent,
          },
        ],
        tracking_settings: {
          click_tracking: { enable: true },
          open_tracking: { enable: true },
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("SendGrid API error:", errorText);
      throw new Error(`SendGrid error: ${response.status}`);
    }

    // Log the email
    await supabase.from("email_logs").insert({
      user_id,
      lead_id,
      campaign_id,
      template_id,
      to_email: lead.email,
      subject: personalizedSubject,
      status: "sent",
    });

    // Update daily count
    await supabase
      .from("daily_send_limits")
      .update({ sent_today: currentSent + 1 })
      .eq("user_id", user_id);

    // Update lead status
    await supabase
      .from("leads")
      .update({ status: "contacted" })
      .eq("id", lead_id);

    // Update template usage if applicable
    if (template_id) {
      await supabase.rpc("increment_template_usage", { template_id_param: template_id });
    }

    console.log("Email sent successfully to:", lead.email);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-campaign-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
