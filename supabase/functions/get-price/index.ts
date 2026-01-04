import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface PriceRequest {
  query: string;
  type: "hockey_card" | "macbook";
  forceRefresh?: boolean;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body: PriceRequest = await req.json();
    const { query, type, forceRefresh = false } = body;

    if (!query || !type) {
      throw new Error("Missing required fields: query and type");
    }

    const { data: settings } = await supabase
      .from("app_settings")
      .select("*")
      .maybeSingle();

    if (!settings || !settings.serpapi_key || !settings.llm_api_key) {
      throw new Error("API keys not configured. Please visit Settings page.");
    }

    if (!forceRefresh) {
      const { data: cachedResult } = await supabase
        .from("search_cache")
        .select("analyzed_results")
        .eq("search_type", type)
        .eq("search_query", query)
        .gt("expires_at", new Date().toISOString())
        .maybeSingle();

      if (cachedResult && cachedResult.analyzed_results) {
        return new Response(
          JSON.stringify(cachedResult.analyzed_results),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    console.log("Fetching eBay sold listings from SerpApi...");
    const serpApiResults = await fetchEbaySoldListings(
      query,
      settings.serpapi_key,
      settings.default_region
    );

    if (!serpApiResults || serpApiResults.length === 0) {
      throw new Error("No sold listings found on eBay for this query.");
    }

    console.log(`Found ${serpApiResults.length} raw listings`);

    console.log("Analyzing comps with LLM...");
    const analyzedResults = await analyzWithLLM(
      serpApiResults,
      type,
      settings.llm_provider,
      settings.llm_api_key,
      settings.default_currency,
      settings.default_region,
      settings.use_ai_filtering
    );

    await supabase.from("search_cache").insert({
      search_type: type,
      search_query: query,
      raw_results: serpApiResults,
      analyzed_results: analyzedResults,
      expires_at: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    });

    await supabase.from("search_history").insert({
      search_type: type,
      search_query: query,
      median_price: analyzedResults.summary?.median_price || 0,
      currency: analyzedResults.summary?.currency || settings.default_currency,
      comps_used: analyzedResults.summary?.comps_used || 0,
      comps_excluded: analyzedResults.summary?.comps_excluded || 0,
      confidence_score: analyzedResults.summary?.confidence_score || 0,
    });

    return new Response(JSON.stringify(analyzedResults), {
      headers: {
        ...corsHeaders,
        "Content-Type": "application/json",
      },
    });
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  }
});

async function fetchEbaySoldListings(
  query: string,
  apiKey: string,
  region: string
): Promise<any[]> {
  const siteId = region === "canada" ? "ebay.ca" : "ebay.com";
  
  const url = new URL("https://serpapi.com/search");
  url.searchParams.append("engine", "ebay");
  url.searchParams.append("ebay_domain", siteId);
  url.searchParams.append("_nkw", query);
  url.searchParams.append("LH_Sold", "1");
  url.searchParams.append("LH_Complete", "1");
  url.searchParams.append("api_key", apiKey);

  const response = await fetch(url.toString());
  
  if (!response.ok) {
    throw new Error(`SerpApi error: ${response.statusText}`);
  }

  const data = await response.json();
  return data.organic_results || [];
}

async function analyzWithLLM(
  listings: any[],
  type: string,
  provider: string,
  apiKey: string,
  currency: string,
  region: string,
  useAiFiltering: boolean
): Promise<any> {
  const systemPrompt = buildSystemPrompt(type, currency, region);
  const userPrompt = buildUserPrompt(listings, type);

  if (provider === "claude") {
    return await callClaude(systemPrompt, userPrompt, apiKey);
  } else {
    return await callGPT(systemPrompt, userPrompt, apiKey);
  }
}

function buildSystemPrompt(type: string, currency: string, region: string): string {
  const basePrompt = `You are an expert pricing analyst for ${type === "hockey_card" ? "hockey cards" : "MacBooks"}. 

Your job is to:
1. Carefully read each eBay sold listing
2. Extract structured data
3. Determine if the listing is a valid comparable
4. Exclude invalid listings with clear reasons
5. Compute a realistic median market price

Pricing Rules:
- Target currency: ${currency}
- Target region: ${region}
- For USA listings: Use item price only (ignore shipping)
- For Canada listings: Include shipping in total price (item + shipping)
- NEVER include customs, duties, or taxes

You MUST return valid JSON in this exact format:
{
  "summary": {
    "median_price": number,
    "p25_price": number,
    "p75_price": number,
    "currency": "${currency}",
    "confidence_score": number (0-100),
    "confidence_label": "Low" | "Medium" | "High",
    "comps_used": number,
    "comps_excluded": number,
    "notes": ["note1", "note2"]
  },
  "comps": [
    {
      "title": string,
      "url": string,
      "image_url": string,
      "sold_price": number,
      "shipping": number,
      "location": string,
      "total_used": number,
      "sold_date": string,
      "included": boolean,
      "exclusion_reason": string (if excluded),
      "match_score": number (0-100),
      "extracted_fields": object
    }
  ]
}`;

  if (type === "hockey_card") {
    return basePrompt + `

Hockey Card Specific Rules:

Title Structure (most common):
YEAR/SEASON → BRAND/SET → INSERT/SUBSET → PLAYER NAME → CARD TYPE → ROOKIE (RC) → SERIAL (/XX) → CARD NUMBER (#XX) → GRADE

Extract these fields:
- year/season (e.g., 2016-17)
- brand/set (Upper Deck, The Cup, SP Authentic, OPC, etc.)
- insert/subset (Young Guns, FWA, Exquisite, etc.)
- player_name
- card_type (Auto, Patch, RPA, etc.)
- rookie_indicator (RC or implied like Young Guns)
- serial_number (/99, /25, 1/1)
- card_number (#201)
- grading_company (PSA, BGS, SGC)
- grade (10, 9.5, etc.)

Exclusion Rules:
- Lots/bundles
- Reprints
- Digital cards
- Empty boxes/cases
- Wrong player
- Wrong set/insert
- Wrong grade
- "Custom", "Fan made", "Read description"
- Misleading listings

Match Scoring (0-100):
- Same player: +25
- Same set/insert: +25
- Same grade & grader: +30
- Same serial/parallel: +15
- Same year: +5

Only use listings with match score ≥ 70.`;
  } else {
    return basePrompt + `

MacBook Specific Rules:

Extract these fields:
- product_line (MacBook Air / Pro)
- screen_size (13 / 14 / 15 / 16)
- chip (M1 / M1 Pro / M1 Max / M2 / M3, etc.)
- ram (8 / 16 / 32 / 64 / 96 GB)
- storage (256 / 512 / 1TB / 2TB, etc.)
- year
- condition
- battery_health (if mentioned)
- applecare (yes/no)

Exclusion Rules:
- "For parts"
- "Broken"
- "No power"
- MDM, iCloud locked, Activation lock
- Logic board only
- Empty box
- Lot/bundle
- Wrong size, chip, RAM, or storage

Match Requirements:
- MUST match: product line, screen size, chip, RAM, storage
- Listings missing critical specs should be excluded`;
  }
}

function buildUserPrompt(listings: any[], type: string): string {
  const listingsText = listings.map((listing, idx) => {
    return `Listing ${idx + 1}:
Title: ${listing.title || "N/A"}
Price: ${listing.price?.raw || listing.price?.value || "N/A"}
Shipping: ${listing.shipping?.raw || listing.shipping?.value || "N/A"}
Location: ${listing.location || "N/A"}
Date: ${listing.date || "N/A"}
Link: ${listing.link || "N/A"}
Thumbnail: ${listing.thumbnail || "N/A"}
`;
  }).join("\n---\n\n");

  return `Analyze these ${listings.length} sold listings and return the pricing analysis in the required JSON format:\n\n${listingsText}`;
}

async function callClaude(systemPrompt: string, userPrompt: string, apiKey: string): Promise<any> {
  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 4096,
      system: systemPrompt,
      messages: [
        {
          role: "user",
          content: userPrompt,
        },
      ],
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Claude API error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.content?.[0]?.text || "";
  
  try {
    return JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse Claude response:", content);
    throw new Error("LLM returned invalid JSON");
  }
}

async function callGPT(systemPrompt: string, userPrompt: string, apiKey: string): Promise<any> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: systemPrompt,
        },
        {
          role: "user",
          content: userPrompt,
        },
      ],
      response_format: { type: "json_object" },
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`GPT API error: ${response.statusText} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.choices?.[0]?.message?.content || "";
  
  try {
    return JSON.parse(content);
  } catch (e) {
    console.error("Failed to parse GPT response:", content);
    throw new Error("LLM returned invalid JSON");
  }
}
