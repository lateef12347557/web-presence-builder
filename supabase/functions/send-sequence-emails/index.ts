import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Email templates for the sequence
const emailTemplates = {
  first_contact: {
    subject: "Professional Website for {{business_name}}?",
    content: `Hi {{business_name}},

I noticed your business in {{city}} and saw you don't yet have a website.

I help local businesses like yours get professional websites that bring in more customers. A modern website can help you:
• Show up in Google searches
• Build trust with new customers
• Get more calls and bookings

Would you like me to set one up for you? I'd be happy to show you some examples.

Best regards`
  },
  followup_1: {
    subject: "Quick follow-up: Website for {{business_name}}",
    content: `Hi {{business_name}},

I reached out a couple of days ago about creating a website for your business.

I know you're busy running things, so I wanted to make this easy: I can have a custom design ready for you to review within 48 hours, completely free with no obligation.

Would that be helpful?

Best regards`
  },
  followup_2: {
    subject: "Last chance: Free website mockup for {{business_name}}",
    content: `Hi {{business_name}},

I wanted to follow up one more time about your business website.

Many businesses in {{category}} are seeing great results from having an online presence - more calls, more customers, more growth.

If timing isn't right now, no worries at all. But if you'd like to see what a professional website could look like for {{business_name}}, just reply and I'll put something together.

Best regards`
  },
  final_close: {
    subject: "Closing the loop - {{business_name}} website",
    content: `Hi {{business_name}},

This will be my last email about this.

If you ever decide you'd like a professional website for your business, feel free to reach out. I'd be happy to help whenever you're ready.

Wishing you continued success with your business!

Best regards`
  }
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    
    if (!sendgridApiKey) {
      throw new Error("SENDGRID_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Find all pending sequences that are due
    const now = new Date().toISOString();
    const { data: pendingSequences, error: seqError } = await supabase
      .from("email_sequences")
      .select(`
        *,
        leads!inner(*)
      `)
      .eq("status", "pending")
      .lte("scheduled_at", now)
      .limit(50);

    if (seqError) {
      console.error("Error fetching sequences:", seqError);
      throw new Error("Failed to fetch pending sequences");
    }

    console.log(`Found ${pendingSequences?.length || 0} pending sequences to process`);

    let sent = 0;
    let skipped = 0;
    let errors = 0;

    for (const sequence of pendingSequences || []) {
      const lead = sequence.leads;
      
      if (!lead || !lead.email) {
        // Skip if no email
        await supabase
          .from("email_sequences")
          .update({ status: "skipped" })
          .eq("id", sequence.id);
        skipped++;
        continue;
      }

      // Check if unsubscribed
      const { data: unsubscribe } = await supabase
        .from("unsubscribes")
        .select("id")
        .eq("email", lead.email)
        .maybeSingle();

      if (unsubscribe) {
        await supabase
          .from("email_sequences")
          .update({ status: "skipped" })
          .eq("id", sequence.id);
        skipped++;
        continue;
      }

      // Check if lead responded (skip follow-ups)
      if (lead.status === "converted" || lead.status === "qualified") {
        await supabase
          .from("email_sequences")
          .update({ status: "skipped" })
          .eq("id", sequence.id);
        
        // Cancel remaining sequences for this lead
        await supabase
          .from("email_sequences")
          .update({ status: "cancelled" })
          .eq("lead_id", lead.id)
          .eq("status", "pending");
        
        skipped++;
        continue;
      }

      // Get template for this step
      const template = emailTemplates[sequence.template_type as keyof typeof emailTemplates];
      if (!template) {
        console.error(`Unknown template type: ${sequence.template_type}`);
        errors++;
        continue;
      }

      // Personalize content
      const personalizedSubject = template.subject
        .replace(/{{business_name}}/g, lead.business_name || "Business Owner")
        .replace(/{{category}}/g, lead.category || "")
        .replace(/{{city}}/g, lead.city || "");

      const personalizedContent = template.content
        .replace(/{{business_name}}/g, lead.business_name || "Business Owner")
        .replace(/{{category}}/g, lead.category || "")
        .replace(/{{city}}/g, lead.city || "")
        .replace(/{{state}}/g, lead.state || "");

      // Unsubscribe link
      const unsubscribeUrl = `${supabaseUrl}/functions/v1/handle-unsubscribe?email=${encodeURIComponent(lead.email)}`;

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

      try {
        // Send via SendGrid
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
            content: [{ type: "text/html", value: htmlContent }],
            tracking_settings: {
              click_tracking: { enable: true },
              open_tracking: { enable: true },
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`SendGrid error for ${lead.email}:`, errorText);
          errors++;
          continue;
        }

        // Update sequence status
        await supabase
          .from("email_sequences")
          .update({ status: "sent", sent_at: new Date().toISOString() })
          .eq("id", sequence.id);

        // Log the email
        await supabase.from("email_logs").insert({
          user_id: sequence.user_id,
          lead_id: lead.id,
          campaign_id: sequence.campaign_id,
          to_email: lead.email,
          subject: personalizedSubject,
          status: "sent",
        });

        // Update lead status if first contact
        if (sequence.template_type === "first_contact") {
          await supabase
            .from("leads")
            .update({ status: "contacted" })
            .eq("id", lead.id);
        }

        sent++;
        console.log(`Sent ${sequence.template_type} to ${lead.email}`);

        // Add small delay between sends to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 200));

      } catch (sendError) {
        console.error(`Failed to send to ${lead.email}:`, sendError);
        errors++;
      }
    }

    console.log(`Sequence processing complete: sent=${sent}, skipped=${skipped}, errors=${errors}`);

    return new Response(
      JSON.stringify({
        success: true,
        processed: pendingSequences?.length || 0,
        sent,
        skipped,
        errors,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-sequence-emails function:", error);
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
