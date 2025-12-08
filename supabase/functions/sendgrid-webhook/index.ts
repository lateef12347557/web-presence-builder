import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface SendGridEvent {
  email: string;
  event: string;
  timestamp: number;
  sg_message_id?: string;
  reason?: string;
  url?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Supabase configuration missing");
    }

    const supabase = createClient(supabaseUrl, supabaseKey);
    const events: SendGridEvent[] = await req.json();

    console.log(`Processing ${events.length} SendGrid events`);

    for (const event of events) {
      const email = event.email;
      const eventType = event.event;
      const timestamp = new Date(event.timestamp * 1000).toISOString();

      console.log(`Processing event: ${eventType} for ${email}`);

      // Find the most recent email log for this email address
      const { data: emailLog, error: findError } = await supabase
        .from("email_logs")
        .select("id")
        .eq("to_email", email)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (findError || !emailLog) {
        console.log(`No email log found for ${email}`);
        continue;
      }

      // Update email log based on event type
      const updateData: Record<string, any> = {};

      switch (eventType) {
        case "open":
          updateData.opened_at = timestamp;
          updateData.status = "opened";
          console.log(`Email opened: ${email}`);
          break;

        case "click":
          updateData.clicked_at = timestamp;
          updateData.status = "clicked";
          console.log(`Email clicked: ${email}, URL: ${event.url}`);
          break;

        case "bounce":
        case "dropped":
          updateData.bounced_at = timestamp;
          updateData.status = "bounced";
          console.log(`Email bounced: ${email}, Reason: ${event.reason}`);
          break;

        case "spamreport":
          updateData.status = "spam";
          // Auto-unsubscribe spam reporters
          await supabase.from("unsubscribes").upsert({
            email: email,
            reason: "Marked as spam",
          }, { onConflict: "email" });
          console.log(`Email marked as spam: ${email}`);
          break;

        case "unsubscribe":
          // Handle unsubscribe via SendGrid's built-in link
          await supabase.from("unsubscribes").upsert({
            email: email,
            reason: "Unsubscribed via email link",
          }, { onConflict: "email" });
          console.log(`Email unsubscribed via SendGrid: ${email}`);
          break;

        default:
          console.log(`Unhandled event type: ${eventType}`);
          continue;
      }

      if (Object.keys(updateData).length > 0) {
        const { error: updateError } = await supabase
          .from("email_logs")
          .update(updateData)
          .eq("id", emailLog.id);

        if (updateError) {
          console.error(`Failed to update email log: ${updateError.message}`);
        } else {
          console.log(`Updated email log ${emailLog.id} with ${eventType} event`);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, processed: events.length }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error processing SendGrid webhook:", error);
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
