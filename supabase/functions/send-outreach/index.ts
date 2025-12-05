import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface OutreachRequest {
  to_email: string;
  to_name: string;
  business_name: string;
  subject: string;
  content: string;
  from_email?: string;
  from_name?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const sendgridApiKey = Deno.env.get("SENDGRID_API_KEY");
    if (!sendgridApiKey) {
      throw new Error("SENDGRID_API_KEY not configured");
    }

    const { 
      to_email, 
      to_name, 
      business_name,
      subject, 
      content,
      from_email = "outreach@yourdomain.com",
      from_name = "Your Company"
    }: OutreachRequest = await req.json();

    if (!to_email || !subject || !content) {
      throw new Error("to_email, subject, and content are required");
    }

    // Personalize the email content
    const personalizedContent = content
      .replace(/{{business_name}}/g, business_name || "your business")
      .replace(/{{name}}/g, to_name || "Business Owner");

    // CAN-SPAM compliant footer
    const canSpamFooter = `
      <br><br>
      <hr style="border: none; border-top: 1px solid #ccc; margin: 20px 0;">
      <p style="font-size: 12px; color: #666;">
        ${from_name}<br>
        <a href="{{unsubscribe_url}}" style="color: #666;">Unsubscribe from future emails</a><br>
        This email was sent to ${to_email} because your business was identified as potentially benefiting from our services.
      </p>
    `;

    const fullContent = personalizedContent + canSpamFooter;

    console.log(`Sending outreach email to: ${to_email}`);

    const response = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${sendgridApiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [
          {
            to: [{ email: to_email, name: to_name || business_name }],
            subject: subject,
          },
        ],
        from: {
          email: from_email,
          name: from_name,
        },
        content: [
          {
            type: "text/html",
            value: fullContent,
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

    console.log("Email sent successfully to:", to_email);

    return new Response(
      JSON.stringify({ success: true, message: "Email sent successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-outreach function:", error);
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
