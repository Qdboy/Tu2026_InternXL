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
    const { profile } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const currentDate = new Date().toISOString().split("T")[0];
    const systemPrompt = `You are a civic education advisor for PolitiU, a voter education app for young adults (18-25). Today's date is ${currentDate}.

CRITICAL RULES:
- Only recommend candidates for UPCOMING or CURRENT elections (2025 and beyond). Do NOT recommend candidates from past elections (e.g. 2024 presidential race is OVER).
- Show candidates who are CURRENTLY in office or ACTIVELY running for office in upcoming races.
- Each candidate name must be a single person's full name (e.g. "Donald Trump", NOT "Donald Trump / JD Vance"). Never combine running mates.
- Do not append labels like "(Incumbent)" or "(Legacy)" to names — use the position field for that.
- Focus on the OFFICE first (the role matters more than the person)
- Be non-partisan and educational
- Use actual, verifiable candidate names, parties, and policy positions
- Only include candidates relevant to the user's location (zip code / state)

Never invent fictional candidates. Never recommend races that have already concluded.`;

     const userPrompt = `Generate candidate/office recommendations for UPCOMING elections (2025 and beyond) for this user:
- Name: ${profile.name || "Young Voter"}
- Occupation: ${profile.occupation || "Student"}
- County: ${profile.county || "Fulton County"}
- Location (zip): ${profile.zipCode || "30309"}
- Interests: ${(profile.interests || []).join(", ") || "General"}
- Transportation: ${(profile.transport || []).join(", ") || "Car"}

Focus on races happening in 2025-2026. Do NOT include the 2024 presidential election or any completed races.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
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
              name: "recommend_candidates",
              description: "Return personalized candidate and office recommendations",
              parameters: {
                type: "object",
                properties: {
                  recommendations: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        office: { type: "string", description: "The office title, e.g. U.S. Senate · Georgia" },
                        level: { type: "string", enum: ["local", "state", "federal"] },
                        why_it_matters: { type: "string", description: "1-2 sentences on why this office matters to the user based on their interests" },
                        candidates: {
                          type: "array",
                          items: {
                            type: "object",
                            properties: {
                              name: { type: "string" },
                              party: { type: "string", enum: ["Democrat", "Republican", "Independent"] },
                              position: { type: "string", description: "Their running position label" },
                              policies: { type: "array", items: { type: "string" }, description: "3-5 key policies" },
                              relevance_score: { type: "number", description: "0-100 how aligned with user interests" },
                              relevance_reason: { type: "string", description: "Brief reason for score based on user interests" },
                            },
                            required: ["name", "party", "position", "policies", "relevance_score", "relevance_reason"],
                            additionalProperties: false,
                          },
                        },
                      },
                      required: ["office", "level", "why_it_matters", "candidates"],
                      additionalProperties: false,
                    },
                  },
                },
                required: ["recommendations"],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: "function", function: { name: "recommend_candidates" } },
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

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("recommend-candidates error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
