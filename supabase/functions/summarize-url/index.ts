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
    const { url, userProfile } = await req.json();

    if (!url || typeof url !== "string") {
      return new Response(JSON.stringify({ error: "URL is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let formattedUrl = url.trim();
    if (formattedUrl.startsWith("file://") || /^[A-Z]:\\/i.test(formattedUrl)) {
      return new Response(JSON.stringify({ error: "Please paste a web URL (https://...), not a local file path." }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!formattedUrl.startsWith("http://") && !formattedUrl.startsWith("https://")) {
      formattedUrl = `https://${formattedUrl}`;
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    console.log("Fetching URL:", formattedUrl);

    const pageResponse = await fetch(formattedUrl, {
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; PolitiU/1.0; +https://politiu.app)",
        "Accept": "text/html,application/xhtml+xml,text/plain,*/*",
      },
    });

    if (!pageResponse.ok) {
      return new Response(JSON.stringify({ error: `Could not fetch URL (${pageResponse.status})` }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    let rawText = await pageResponse.text();
    rawText = rawText
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/g, " ")
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/\s+/g, " ")
      .trim();

    if (rawText.length > 15000) {
      rawText = rawText.substring(0, 15000) + "\n...[truncated]";
    }

    if (!rawText) {
      rawText = `[Web page at "${formattedUrl}". Provide a best-effort civic/political summary based on the URL.]`;
    }

    const county = userProfile?.county || "your area";
    const interests = userProfile?.interests?.join(", ") || "civic engagement";

    const systemPrompt = `You are a civic document analyst for PolitiU, a voter education app for young adults (18-25).
Your job is to read web pages (bills, ordinances, voter guides, news articles, policy briefs) and produce a personalized summary.

The user lives in ${county} and cares about: ${interests}.

Respond in this exact JSON format:
{
  "summary": "A 2-3 sentence plain-language summary of what this page is about and why it matters.",
  "keyPoints": ["Point 1 about how this affects the user personally", "Point 2", "Point 3", "Point 4"]
}

Rules:
- Make key points PERSONAL — explain how each point affects someone in ${county} who cares about ${interests}.
- Use plain language a college student would understand.
- If the content is unclear, infer what you can and provide a best-effort summary.
- Always return valid JSON.`;

    const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: `Please analyze this web page from "${formattedUrl}":\n\n${rawText}` },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("AI gateway error:", aiResponse.status, errText);
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
    console.error("summarize-url error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
