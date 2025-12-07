import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface AnalyzeRequest {
  lead_id: string;
  website_url?: string;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { lead_id, website_url }: AnalyzeRequest = await req.json();
    console.log(`Analyzing website for lead: ${lead_id}, URL: ${website_url}`);

    // Get lead details
    const { data: lead, error: leadError } = await supabase
      .from("leads")
      .select("*")
      .eq("id", lead_id)
      .single();

    if (leadError || !lead) {
      throw new Error("Lead not found");
    }

    let analysisResults = {
      has_ssl: null as boolean | null,
      is_mobile_friendly: null as boolean | null,
      website_speed_score: null as number | null,
      has_social_presence: false,
    };

    // If there's a website URL, analyze it
    if (website_url) {
      try {
        // Check SSL
        analysisResults.has_ssl = website_url.startsWith("https://");
        
        // Try to fetch the website to check if it's accessible
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        
        try {
          const startTime = Date.now();
          const response = await fetch(website_url, {
            signal: controller.signal,
            headers: { 
              "User-Agent": "Mozilla/5.0 (compatible; WebsiteAnalyzer/1.0)" 
            },
          });
          const loadTime = Date.now() - startTime;
          clearTimeout(timeoutId);
          
          if (response.ok) {
            const html = await response.text();
            
            // Check mobile friendliness (viewport meta tag)
            analysisResults.is_mobile_friendly = html.includes('viewport') && 
              (html.includes('width=device-width') || html.includes('initial-scale'));
            
            // Simple speed score based on load time and HTML size
            const htmlSize = html.length;
            let speedScore = 100;
            
            // Penalize slow load times
            if (loadTime > 3000) speedScore -= 30;
            else if (loadTime > 2000) speedScore -= 20;
            else if (loadTime > 1000) speedScore -= 10;
            
            // Penalize large HTML
            if (htmlSize > 500000) speedScore -= 20;
            else if (htmlSize > 200000) speedScore -= 10;
            
            analysisResults.website_speed_score = Math.max(0, speedScore);
            
            // Check for social presence
            analysisResults.has_social_presence = 
              html.includes("facebook.com") ||
              html.includes("twitter.com") ||
              html.includes("instagram.com") ||
              html.includes("linkedin.com") ||
              html.includes("youtube.com");
          } else {
            // Website returned error - mark as broken
            await supabase
              .from("leads")
              .update({ website_status: "broken" })
              .eq("id", lead_id);
          }
        } catch (fetchError) {
          clearTimeout(timeoutId);
          console.log("Website fetch failed:", fetchError);
          // Website is unreachable - mark as broken
          await supabase
            .from("leads")
            .update({ website_status: "broken" })
            .eq("id", lead_id);
        }
      } catch (analysisError) {
        console.error("Analysis error:", analysisError);
      }
    }

    // Calculate score using the database function approach
    const hasEmail = !!lead.email;
    const hasPhone = !!lead.phone;
    
    // Calculate score locally (matching the DB function logic)
    let score = 0;
    
    // Website status scoring
    if (lead.website_status === "none") score += 40;
    else if (lead.website_status === "broken") score += 30;
    else if (lead.website_status === "outdated") score += 20;
    
    // Contact info
    if (hasEmail) score += 15;
    if (hasPhone) score += 5;
    
    // Website quality factors
    if (analysisResults.has_ssl === false) score += 10;
    if (analysisResults.is_mobile_friendly === false) score += 10;
    if (analysisResults.website_speed_score !== null && analysisResults.website_speed_score < 50) score += 10;
    
    // Review/rating factors
    if (lead.google_rating !== null && lead.google_rating < 3.5) score += 5;
    if (lead.review_count !== null && lead.review_count < 10) score += 5;
    
    // Social presence
    if (analysisResults.has_social_presence === false) score += 5;
    
    score = Math.min(score, 100);
    
    // Determine tier
    let leadTier = "cold";
    if (score >= 70) leadTier = "hot";
    else if (score >= 40) leadTier = "warm";

    // Update lead with analysis results
    const { error: updateError } = await supabase
      .from("leads")
      .update({
        has_ssl: analysisResults.has_ssl,
        is_mobile_friendly: analysisResults.is_mobile_friendly,
        website_speed_score: analysisResults.website_speed_score,
        has_social_presence: analysisResults.has_social_presence,
        score,
        lead_tier: leadTier,
        last_analyzed_at: new Date().toISOString(),
      })
      .eq("id", lead_id);

    if (updateError) {
      console.error("Failed to update lead:", updateError);
      throw new Error("Failed to update lead analysis");
    }

    console.log(`Analysis complete for ${lead.business_name}: Score=${score}, Tier=${leadTier}`);

    return new Response(
      JSON.stringify({
        success: true,
        score,
        lead_tier: leadTier,
        analysis: analysisResults,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in analyze-website function:", error);
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
