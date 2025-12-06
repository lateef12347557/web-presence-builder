import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    
    const supabase = createClient(supabaseUrl!, supabaseKey!);

    const url = new URL(req.url);
    const email = url.searchParams.get("email");

    if (!email) {
      return new Response(
        `<!DOCTYPE html>
        <html>
        <head>
          <title>Unsubscribe Error</title>
          <style>
            body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
            .error { color: #e53e3e; }
          </style>
        </head>
        <body>
          <h1 class="error">Invalid Request</h1>
          <p>No email address provided.</p>
        </body>
        </html>`,
        {
          status: 400,
          headers: { "Content-Type": "text/html", ...corsHeaders },
        }
      );
    }

    // Add to unsubscribes table
    const { error } = await supabase
      .from("unsubscribes")
      .upsert({ email, reason: "user_requested" }, { onConflict: "email" });

    if (error) {
      console.error("Error unsubscribing:", error);
      throw error;
    }

    // Update any leads with this email to unsubscribed status
    await supabase
      .from("leads")
      .update({ status: "unsubscribed" })
      .eq("email", email);

    console.log(`Email unsubscribed: ${email}`);

    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribed Successfully</title>
        <style>
          body { 
            font-family: Arial, sans-serif; 
            max-width: 600px; 
            margin: 50px auto; 
            padding: 20px; 
            text-align: center;
            background: #f7fafc;
          }
          .card {
            background: white;
            padding: 40px;
            border-radius: 12px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          }
          .success { color: #38a169; }
          h1 { margin-bottom: 16px; }
          p { color: #718096; line-height: 1.6; }
        </style>
      </head>
      <body>
        <div class="card">
          <h1 class="success">✓ Unsubscribed Successfully</h1>
          <p>You have been removed from our mailing list and will no longer receive emails from us.</p>
          <p><strong>Email:</strong> ${email}</p>
        </div>
      </body>
      </html>`,
      {
        status: 200,
        headers: { "Content-Type": "text/html", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in handle-unsubscribe function:", error);
    return new Response(
      `<!DOCTYPE html>
      <html>
      <head>
        <title>Unsubscribe Error</title>
        <style>
          body { font-family: Arial, sans-serif; max-width: 600px; margin: 50px auto; padding: 20px; text-align: center; }
          .error { color: #e53e3e; }
        </style>
      </head>
      <body>
        <h1 class="error">Something went wrong</h1>
        <p>Please try again later or contact support.</p>
      </body>
      </html>`,
      {
        status: 500,
        headers: { "Content-Type": "text/html", ...corsHeaders },
      }
    );
  }
};

serve(handler);
