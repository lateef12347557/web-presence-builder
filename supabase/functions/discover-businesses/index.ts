import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface DiscoveryRequest {
  location: string;
  categories: string[];
  limit?: number;
}

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
    if (!yelpApiKey) {
      throw new Error("YELP_API_KEY not configured");
    }

    const { location, categories, limit = 50 }: DiscoveryRequest = await req.json();
    
    if (!location) {
      throw new Error("Location is required");
    }

    console.log(`Discovering businesses in ${location} for categories: ${categories.join(", ")}`);

    const discoveredBusinesses: any[] = [];

    for (const category of categories) {
      const searchParams = new URLSearchParams({
        location: location,
        term: category,
        limit: String(Math.min(limit, 50)),
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
        const errorText = await response.text();
        console.error(`Yelp API error for ${category}:`, errorText);
        continue;
      }

      const data = await response.json();
      const businesses: YelpBusiness[] = data.businesses || [];

      console.log(`Found ${businesses.length} businesses for category: ${category}`);

      for (const business of businesses) {
        // Filter businesses without websites (Yelp doesn't always have this info)
        // We'll mark them for further verification
        const hasNoWebsite = !business.url || business.url.includes("yelp.com");
        
        discoveredBusinesses.push({
          business_name: business.name,
          category: business.categories?.[0]?.title || category,
          city: business.location?.city || "",
          state: business.location?.state || "",
          phone: business.display_phone || business.phone || null,
          source: "yelp",
          website_status: hasNoWebsite ? "none" : "outdated",
          score: hasNoWebsite ? 80 : 50,
        });
      }
    }

    // Remove duplicates by business name + city
    const uniqueBusinesses = discoveredBusinesses.reduce((acc, business) => {
      const key = `${business.business_name}-${business.city}`.toLowerCase();
      if (!acc.has(key)) {
        acc.set(key, business);
      }
      return acc;
    }, new Map());

    const results = Array.from(uniqueBusinesses.values());

    console.log(`Total unique businesses discovered: ${results.length}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        businesses: results,
        count: results.length 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in discover-businesses function:", error);
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
