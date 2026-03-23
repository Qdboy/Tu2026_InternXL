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
    const currentYear = parseInt(currentDate.slice(0, 4));

    const systemPrompt = `You are a civic education advisor for Politi-U, a voter education app for young adults (18-25). Today's date is ${currentDate}.

CRITICAL RULES:
- Only recommend candidates for UPCOMING or CURRENT elections (${currentYear} and beyond). Do NOT recommend candidates from past elections.
- Show candidates who are CURRENTLY in office or ACTIVELY running for office in upcoming races.
- Each candidate name must be a single person's full name (e.g. "Jane Smith", NOT "Jane Smith / John Doe"). Never combine running mates.
- Do not append labels like "(Incumbent)" or "(Legacy)" to names — use the position field for that.
- Focus on the OFFICE first (the role matters more than the person)
- Be non-partisan and educational
- Use actual, verifiable candidate names, parties, and policy positions
- Only include candidates relevant to the user's location (zip code / state)
- Each office MUST have at least 2 candidates from different parties for balanced representation

Never invent fictional candidates. Never recommend races that have already concluded.

Return a JSON object with a "recommendations" array. Each recommendation has: office (string), level ("local"|"state"|"federal"), why_it_matters (string), and candidates (array of objects with: name, party, position, policies (array of 3-5 strings), relevance_score (0-100), relevance_reason).`;

    const userPrompt = `Generate candidate/office recommendations for UPCOMING elections (${currentYear} and beyond) for this user:
- Name: ${profile.name || "Young Voter"}
- Occupation: ${profile.occupation || "Student"}
- County: ${profile.county || "Unknown County"}
- Location (zip): ${profile.zipCode || "00000"}
- Interests: ${(profile.interests || []).join(", ") || "General"}
- Transportation: ${(profile.transport || []).join(", ") || "Car"}

Focus on races happening in ${currentYear}-${currentYear + 1}. Include at least 2 candidates per office. Return ONLY the JSON object.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Lovable AI error:", response.status, text);
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited, please try again later." }), {
          status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI gateway error: ${response.status}`);
    }

    const data = await response.json();
    let content: string = data.choices?.[0]?.message?.content ?? "";
    if (!content) throw new Error("No content in AI response");

    // Strip markdown code fences if present
    content = content.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "").trim();

    // Fix common JSON issues from LLMs: trailing commas before } or ]
    content = content.replace(/,\s*([\]}])/g, "$1");

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (parseErr) {
      console.error("JSON parse failed, raw content (first 500 chars):", content.slice(0, 500));
      // Try extracting the first valid JSON object
      const match = content.match(/\{[\s\S]*\}/);
      if (match) {
        const cleaned = match[0].replace(/,\s*([\]}])/g, "$1");
        parsed = JSON.parse(cleaned);
      } else {
        throw parseErr;
      }
    }

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
