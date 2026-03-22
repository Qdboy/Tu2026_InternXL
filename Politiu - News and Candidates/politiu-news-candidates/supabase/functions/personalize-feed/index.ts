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
    const { feedItem, profile } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const systemPrompt = `You are a civic education assistant for young voters (ages 18-25). Your job is to explain how a political issue personally affects someone based on their profile. Be conversational, direct, and avoid jargon. Keep responses to 2-3 sentences max.`;

    const userPrompt = `Here is a political issue:
Title: ${feedItem.title}
Summary: ${feedItem.summary}
Level: ${feedItem.level}
Relevant Office: ${feedItem.relevantOffice}

Here is the user's profile:
Name: ${profile.name}
Occupation: ${profile.occupation}
County: ${profile.county || "Unknown"}
Interests: ${(profile.interests || []).join(", ")}
Transportation: ${(profile.transport || []).join(", ")}

Write a short, personalized explanation (2-3 sentences) of how this issue specifically affects this person based on their occupation, interests, county, and transportation habits. Start with "Here's how this affects you:" and be specific. IMPORTANT: Always refer to the user's location by their county name (e.g. "Fulton County"), NEVER use zip codes or numeric codes.`;

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
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
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limited, please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add funds." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      throw new Error("AI gateway error");
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || "Unable to generate summary.";

    return new Response(JSON.stringify({ summary: content }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("personalize-feed error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
