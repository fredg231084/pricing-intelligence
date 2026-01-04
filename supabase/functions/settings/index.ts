import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2.57.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface AppSettings {
  serpapi_key: string;
  llm_api_key: string;
  llm_provider: string;
  default_currency: string;
  default_region: string;
  use_ai_filtering: boolean;
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

    if (req.method === "GET") {
      const { data, error } = await supabase
        .from("app_settings")
        .select("*")
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        const { data: newSettings, error: insertError } = await supabase
          .from("app_settings")
          .insert({
            serpapi_key: "",
            llm_api_key: "",
            llm_provider: "claude",
            default_currency: "CAD",
            default_region: "canada",
            use_ai_filtering: true,
          })
          .select()
          .single();

        if (insertError) throw insertError;

        return new Response(
          JSON.stringify({
            ...newSettings,
            serpapi_key: maskApiKey(newSettings.serpapi_key),
            llm_api_key: maskApiKey(newSettings.llm_api_key),
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }

      return new Response(
        JSON.stringify({
          ...data,
          serpapi_key: maskApiKey(data.serpapi_key),
          llm_api_key: maskApiKey(data.llm_api_key),
        }),
        {
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        }
      );
    }

    if (req.method === "POST") {
      const body: AppSettings = await req.json();

      const { data: existingSettings } = await supabase
        .from("app_settings")
        .select("*")
        .maybeSingle();

      if (existingSettings) {
        const updateData: any = {
          llm_provider: body.llm_provider,
          default_currency: body.default_currency,
          default_region: body.default_region,
          use_ai_filtering: body.use_ai_filtering,
          updated_at: new Date().toISOString(),
        };

        if (body.serpapi_key && body.serpapi_key.trim() !== '') {
          updateData.serpapi_key = body.serpapi_key;
        }

        if (body.llm_api_key && body.llm_api_key.trim() !== '') {
          updateData.llm_api_key = body.llm_api_key;
        }

        const { data, error } = await supabase
          .from("app_settings")
          .update(updateData)
          .eq("id", existingSettings.id)
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({
            ...data,
            serpapi_key: maskApiKey(data.serpapi_key),
            llm_api_key: maskApiKey(data.llm_api_key),
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      } else {
        const { data, error } = await supabase
          .from("app_settings")
          .insert({
            serpapi_key: body.serpapi_key,
            llm_api_key: body.llm_api_key,
            llm_provider: body.llm_provider,
            default_currency: body.default_currency,
            default_region: body.default_region,
            use_ai_filtering: body.use_ai_filtering,
          })
          .select()
          .single();

        if (error) throw error;

        return new Response(
          JSON.stringify({
            ...data,
            serpapi_key: maskApiKey(data.serpapi_key),
            llm_api_key: maskApiKey(data.llm_api_key),
          }),
          {
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          }
        );
      }
    }

    return new Response(
      JSON.stringify({ error: "Method not allowed" }),
      {
        status: 405,
        headers: {
          ...corsHeaders,
          "Content-Type": "application/json",
        },
      }
    );
  } catch (error) {
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

function maskApiKey(key: string): string {
  if (!key || key.length < 8) return "";
  return key.substring(0, 4) + "..." + key.substring(key.length - 4);
}
