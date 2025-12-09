import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

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

interface HunterEmailResult {
  data: {
    email: string;
    score: number;
    domain: string;
  };
}

interface HunterDomainResult {
  data: {
    emails: Array<{
      value: string;
      type: string;
      confidence: number;
    }>;
  };
}

// Find email using Hunter.io Domain Search API
async function findEmailWithHunter(businessName: string, domain?: string): Promise<string | null> {
  const hunterApiKey = Deno.env.get("HUNTER_API_KEY");
  if (!hunterApiKey) {
    console.log("Hunter API key not configured");
    return null;
  }

  try {
    // If we have a domain, use domain search
    if (domain) {
      const cleanDomain = domain.replace(/^https?:\/\//, "").replace(/\/.*$/, "").replace(/^www\./, "");
      
      const response = await fetch(
        `https://api.hunter.io/v2/domain-search?domain=${encodeURIComponent(cleanDomain)}&api_key=${hunterApiKey}`,
        { headers: { "Accept": "application/json" } }
      );

      if (response.ok) {
        const data: HunterDomainResult = await response.json();
        if (data.data?.emails && data.data.emails.length > 0) {
          // Get the email with highest confidence, prefer generic emails (info@, contact@, hello@)
          const genericEmails = data.data.emails.filter(e => 
            e.value.startsWith("info@") || 
            e.value.startsWith("contact@") || 
            e.value.startsWith("hello@") ||
            e.value.startsWith("sales@")
          );
          
          if (genericEmails.length > 0) {
            return genericEmails[0].value.toLowerCase();
          }
          
          // Otherwise return the highest confidence email
          const sortedEmails = data.data.emails.sort((a, b) => b.confidence - a.confidence);
          return sortedEmails[0].value.toLowerCase();
        }
      }
    }

    // Try email finder with company name
    const cleanName = businessName.toLowerCase().replace(/[^a-z0-9\s]/g, "").replace(/\s+/g, "");
    const guessedDomain = `${cleanName}.com`;
    
    const finderResponse = await fetch(
      `https://api.hunter.io/v2/email-finder?domain=${encodeURIComponent(guessedDomain)}&first_name=info&api_key=${hunterApiKey}`,
      { headers: { "Accept": "application/json" } }
    );

    if (finderResponse.ok) {
      const data: HunterEmailResult = await finderResponse.json();
      if (data.data?.email && data.data.score > 50) {
        return data.data.email.toLowerCase();
      }
    }

    return null;
  } catch (error) {
    console.error("Error finding email with Hunter:", error);
    return null;
  }
}

// Fallback: Generate business email guesses based on common patterns
function generateEmailGuess(businessName: string): string {
  const cleanName = businessName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, "")
    .substring(0, 20);
  
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

    const hunterApiKey = Deno.env.get("HUNTER_API_KEY");
    const hunterEnabled = !!hunterApiKey;
    console.log(`Hunter.io integration: ${hunterEnabled ? "enabled" : "disabled (will use email guesses)"}`);

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
        const hasNoWebsite = !business.url || business.url.includes("yelp.com");
        
        let email: string | null = null;
        let emailSource = "none";

        // Try to find email using Hunter.io
        if (hunterEnabled) {
          // If business has its own website, search that domain
          const businessDomain = !hasNoWebsite ? business.url : undefined;
          email = await findEmailWithHunter(business.name, businessDomain);
          
          if (email) {
            emailSource = "hunter";
            console.log(`Found email via Hunter.io for ${business.name}: ${email}`);
          }
        }
        
        // Fallback to generated email guess if Hunter didn't find anything
        if (!email && business.display_phone) {
          email = generateEmailGuess(business.name);
          emailSource = "generated";
          console.log(`Generated email guess for ${business.name}: ${email}`);
        }
        
        discoveredBusinesses.push({
          business_name: business.name,
          category: business.categories?.[0]?.title || category,
          city: business.location?.city || "",
          state: business.location?.state || "",
          phone: business.display_phone || business.phone || null,
          email: email,
          email_source: emailSource,
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

    const results = Array.from(uniqueBusinesses.values()) as any[];
    const hunterEmails = results.filter((b: any) => b.email_source === "hunter").length;
    const generatedEmails = results.filter((b: any) => b.email_source === "generated").length;

    console.log(`Total unique businesses discovered: ${results.length}`);
    console.log(`Emails found via Hunter.io: ${hunterEmails}`);
    console.log(`Generated email guesses: ${generatedEmails}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        businesses: results,
        count: results.length,
        emailStats: {
          hunterFound: hunterEmails,
          generated: generatedEmails,
          noEmail: results.length - hunterEmails - generatedEmails
        }
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
