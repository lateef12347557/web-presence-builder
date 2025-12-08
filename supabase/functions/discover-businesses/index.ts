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

// Function to extract email from business Yelp page
async function extractEmailFromYelp(yelpUrl: string): Promise<string | null> {
  try {
    const response = await fetch(yelpUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      },
    });
    
    if (!response.ok) return null;
    
    const html = await response.text();
    
    // Look for email patterns in the page
    const emailPatterns = [
      /href="mailto:([^"]+)"/gi,
      /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/gi,
    ];
    
    for (const pattern of emailPatterns) {
      const matches = html.match(pattern);
      if (matches && matches.length > 0) {
        let email = matches[0];
        if (email.includes("mailto:")) {
          email = email.replace(/href="mailto:/i, "").replace(/"$/, "");
        }
        // Filter out common non-business emails
        if (!email.includes("yelp.com") && 
            !email.includes("example.com") &&
            !email.includes("@email.com")) {
          return email.toLowerCase();
        }
      }
    }
    return null;
  } catch (error) {
    console.error("Error extracting email:", error);
    return null;
  }
}

// Generate business email guesses based on common patterns
function generateEmailGuesses(businessName: string, city: string): string {
  // Clean business name for email generation
  const cleanName = businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "")
    .substring(0, 20);
  
  // Common patterns - we'll just generate a likely contact email format
  // In production, you'd want to verify these
  const domain = `${cleanName}.com`;
  return `info@${domain}`;
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
        
        // Try to extract email from Yelp page or generate a guess
        let email: string | null = null;
        
        // Attempt to extract email from Yelp business page
        if (business.url && !business.url.includes("yelp.com")) {
          // If they have their own website, we'll try to find email during analysis
          email = null;
        } else if (business.url) {
          // Try to extract from Yelp page
          email = await extractEmailFromYelp(business.url);
        }
        
        // If no email found and business has a phone, generate a guess
        if (!email && business.display_phone) {
          email = generateEmailGuesses(business.name, business.location?.city || "");
        }
        
        discoveredBusinesses.push({
          business_name: business.name,
          category: business.categories?.[0]?.title || category,
          city: business.location?.city || "",
          state: business.location?.state || "",
          phone: business.display_phone || business.phone || null,
          email: email,
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
