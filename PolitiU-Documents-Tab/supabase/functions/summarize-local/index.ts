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
    const { fileName, textContent, userProfile } = await req.json();

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

    let content = textContent || "";
    if (content.length > 15000) {
      content = content.substring(0, 15000) + "\n...[truncated]";
    }

    if (!content.trim()) {
      content = `[Document titled "${fileName}". Please provide a best-effort civic/political summary based on the title.]`;
    }

    const county = userProfile?.county || "your area";
    const interests = userProfile?.interests?.join(", ") || "civic engagement";

    const systemPrompt = `You are a civic document analyst for PolitiU, a voter education app for young adults (18-25).
Your job is to read uploaded documents (bills, ordinances, voter guides, policy briefs) and produce a personalized summary.

The user lives in ${county} and cares about: ${interests}.

Respond in this exact JSON format:
{
  "summary": "A 2-3 sentence plain-language summary of what this document is about and why it matters.",
  "keyPoints": ["Point 1 about how this affects the user personally", "Point 2", "Point 3", "Point 4"]
}

Rules:
- Make key points PERSONAL — explain how each point affects someone in ${county} who cares about ${interests}.
- Use plain language a college student would understand.
- If the document content is unclear, infer what you can from the file name and provide a best-effort summary.
- Always return valid JSON.`;

    const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please analyze this document titled "${fileName}":\n\n${content}` },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("OpenRouter error:", aiResponse.status, errText);
      if (aiResponse.status === 429) {
        return new Response(JSON.stringify({ error: "Rate limited. Please try again in a moment." }), {
          status: 429,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    const rawContent = aiData.choices?.[0]?.message?.content || "";

    const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
    let summary = "Unable to generate summary.";
    let keyPoints: string[] = [];

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        summary = parsed.summary || summary;
        keyPoints = parsed.keyPoints || [];
      } catch {
        summary = rawContent.substring(0, 500);
      }
    }

    return new Response(JSON.stringify({ summary, keyPoints }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("summarize-local error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
