import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { profile, existingTitles } = await req.json();

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    const currentDate = new Date().toISOString().split("T")[0];
    const systemPrompt = `You are a civic news editor for PolitiU, a voter education app for young adults (18-25). Today's date is ${currentDate}.

CRITICAL RULES:
- All articles MUST be about CURRENT events, legislation, or political developments happening in ${currentDate.slice(0, 4)}.
- Do NOT reference past events, expired legislation, or outdated information.
- Reference real, verifiable current bills, policies, executive orders, or political developments.
- Be non-partisan and educational.
- Make articles specific to the user's location, occupation, and interests.
- Vary the government levels (local, state, federal).

Return a JSON array of exactly 3 news items. Each item must have:
- "title": string (headline, 5-12 words)
- "summary": string (2-3 sentence summary explaining the issue)
- "level": "local" | "state" | "federal"
- "relevant_office": string (the government office most relevant)
- "source": string (a realistic news source name)
- "tags": string[] (1-3 topic tags from: Housing, Education, Healthcare, Climate, Economy, Immigration, Criminal Justice, Transportation, Technology, Civil Rights, Environment)`;

    const userPrompt = `Generate 3 new civic news articles personalized for this user:
- Name: ${profile.name || "Young Voter"}
- Occupation: ${profile.occupation || "Student"}
- County: ${profile.county || "Fulton County"}
- Location (zip): ${profile.zipCode || "30309"}
- Interests: ${(profile.interests || []).join(", ") || "General"}
- Transportation: ${(profile.transport || []).join(", ") || "Car"}

${existingTitles?.length ? `Avoid duplicating these existing titles:\n${existingTitles.join("\n")}` : ""}

Return ONLY the JSON array, no markdown or extra text.`;

    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://politiu.app",
      },
      body: JSON.stringify({
        model: "google/gemini-3-flash-preview",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        tools: [
          {
            type: "function",
            function: {
              name: "create_feed_items",
              description: "Create news feed items for the civic education app",
              parameters: {
                type: "object",
                properties: {
                  items: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        title: { type: "string" },
                        summary: { type: "string" },
                        level: { type: "string", enum: ["local", "state", "federal"] },
                        relevant_office: { type: "string" },
                        source: { type: "string" },
                        tags: { type: "array", items: { type: "string" } },
                      },
                      required: ["title", "summary", "level", "relevant_office", "source", "tags"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["items"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "create_feed_items" } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "AI credits exhausted. Please add funds." }), {
          status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const toolCall = data.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall) throw new Error("No tool call in response");

    const parsed = JSON.parse(toolCall.function.arguments);
    const items = parsed.items;

    if (!items || !Array.isArray(items)) throw new Error("Invalid items format");

    // Insert into database
    const insertRes = await fetch(`${SUPABASE_URL}/rest/v1/feed_items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: SUPABASE_SERVICE_ROLE_KEY!,
        Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
        Prefer: "return=representation",
      },
      body: JSON.stringify(items),
    });

    if (!insertRes.ok) {
      const err = await insertRes.text();
      console.error("DB insert error:", err);
      throw new Error("Failed to save articles");
    }

    const savedItems = await insertRes.json();

    return new Response(JSON.stringify({ items: savedItems }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("generate-feed error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
