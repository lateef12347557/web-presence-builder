import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface YelpBusiness {
  id: string;
  name: string;
  url: string;
  phone: string;
  display_phone: string;
  location: {
    address1: string;
    city: string;
    state: string;
    zip_code: string;
    country: string;
  };
  categories: Array<{ alias: string; title: string }>;
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const yelpApiKey = Deno.env.get("YELP_API_KEY");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!yelpApiKey) {
      throw new Error("YELP_API_KEY not configured");
    }

    const supabase = createClient(supabaseUrl!, supabaseKey!);

    // Get pending discovery jobs
    const { data: jobs, error: jobsError } = await supabase
      .from("discovery_jobs")
      .select("*")
      .or("status.eq.pending,and(is_recurring.eq.true,next_run_at.lte.now())")
      .limit(5);

    if (jobsError) {
      throw jobsError;
    }

    if (!jobs || jobs.length === 0) {
      console.log("No pending discovery jobs");
      return new Response(
        JSON.stringify({ success: true, message: "No pending jobs", processed: 0 }),
        {
          status: 200,
          headers: { "Content-Type": "application/json", ...corsHeaders },
        }
      );
    }

    console.log(`Processing ${jobs.length} discovery jobs`);

    let totalLeadsFound = 0;
    let totalLeadsSaved = 0;

    for (const job of jobs) {
      try {
        // Update job status to running
        await supabase
          .from("discovery_jobs")
          .update({ status: "running" })
          .eq("id", job.id);

        const discoveredBusinesses: any[] = [];

        for (const category of job.categories) {
          const searchParams = new URLSearchParams({
            location: job.location,
            term: category,
            limit: "50",
            sort_by: "best_match",
          });

          const response = await fetch(
            `https://api.yelp.com/v3/businesses/search?${searchParams}`,
            {
              headers: {
                Authorization: `Bearer ${yelpApiKey}`,
                "Content-Type": "application/json",
              },
            }
          );

          if (!response.ok) {
            console.error(`Yelp API error for ${category}:`, await response.text());
            continue;
          }

          const data = await response.json();
          const businesses: YelpBusiness[] = data.businesses || [];

          console.log(`Found ${businesses.length} businesses for category: ${category}`);

          for (const business of businesses) {
            // Only USA businesses
            if (business.location?.country !== "US") continue;

            // Check if website field is empty or just Yelp URL
            const hasNoWebsite = !business.url || business.url.includes("yelp.com");

            discoveredBusinesses.push({
              business_name: business.name,
              category: business.categories?.[0]?.title || category,
              city: business.location?.city || "",
              state: business.location?.state || "",
              phone: business.display_phone || business.phone || null,
              source: "yelp",
              website_status: hasNoWebsite ? "none" : "outdated",
              score: hasNoWebsite ? 85 : 50,
              user_id: job.user_id,
            });
          }
        }

        // Deduplicate by business name + city
        const uniqueBusinesses = discoveredBusinesses.reduce((acc, business) => {
          const key = `${business.business_name}-${business.city}`.toLowerCase();
          if (!acc.has(key)) {
            acc.set(key, business);
          }
          return acc;
        }, new Map());

        const results = Array.from(uniqueBusinesses.values());
        totalLeadsFound += results.length;

        // Save to leads table (with conflict handling)
        let savedCount = 0;
        for (const lead of results) {
          try {
            const { error } = await supabase.from("leads").insert(lead);
            if (!error) {
              savedCount++;
            }
          } catch (e) {
            // Duplicate, skip
          }
        }
        totalLeadsSaved += savedCount;

        // Update job status
        const nextRun = job.is_recurring
          ? new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Next day
          : null;

        await supabase
          .from("discovery_jobs")
          .update({
            status: "completed",
            leads_found: results.length,
            leads_saved: savedCount,
            last_run_at: new Date().toISOString(),
            next_run_at: nextRun,
          })
          .eq("id", job.id);

        console.log(`Job ${job.id} completed: ${savedCount} leads saved`);
      } catch (jobError: any) {
        console.error(`Error processing job ${job.id}:`, jobError);
        await supabase
          .from("discovery_jobs")
          .update({ status: "failed" })
          .eq("id", job.id);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Processed ${jobs.length} jobs`,
        totalLeadsFound,
        totalLeadsSaved,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in scheduled-discovery function:", error);
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
