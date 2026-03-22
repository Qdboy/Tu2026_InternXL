import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

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
    const { documentId, fileName, filePath, userProfile } = await req.json();

    const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY");
    if (!OPENROUTER_API_KEY) throw new Error("OPENROUTER_API_KEY is not configured");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Download the file from storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from("documents")
      .download(filePath);

    if (downloadError) throw new Error(`Failed to download file: ${downloadError.message}`);

    // Extract text from the file
    let textContent = "";
    const fileType = fileName.split(".").pop()?.toLowerCase();

    if (fileType === "txt" || fileType === "md") {
      textContent = await fileData.text();
    } else if (fileType === "pdf") {
      // For PDF, we send the raw text extraction prompt
      textContent = await fileData.text();
      // If binary, convert to base64 for the AI to interpret
      if (textContent.includes("%PDF")) {
        const arrayBuffer = await fileData.arrayBuffer();
        const bytes = new Uint8Array(arrayBuffer);
        let binary = "";
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        textContent = `[This is a PDF document named "${fileName}". Please analyze the document title and name to provide a relevant civic/political summary. The user is interested in understanding how this document affects them.]`;
      }
    } else {
      textContent = await fileData.text();
    }

    // Truncate to avoid token limits
    if (textContent.length > 15000) {
      textContent = textContent.substring(0, 15000) + "\n...[truncated]";
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
- If the document content is unclear or seems like binary data, infer what you can from the file name and provide a best-effort summary.
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
          { role: "user", content: `Please analyze this document titled "${fileName}":\n\n${textContent}` },
        ],
      }),
    });

    if (!aiResponse.ok) {
      const errText = await aiResponse.text();
      console.error("OpenRouter error:", aiResponse.status, errText);
      throw new Error(`AI error: ${aiResponse.status}`);
    }

    const aiData = await aiResponse.json();
    let content = aiData.choices?.[0]?.message?.content || "";

    // Parse JSON from the response
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    let summary = "Unable to generate summary.";
    let keyPoints: string[] = [];

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0]);
        summary = parsed.summary || summary;
        keyPoints = parsed.keyPoints || [];
      } catch {
        summary = content.substring(0, 500);
      }
    }

    // Update the document record with the summary
    const { error: updateError } = await supabase
      .from("user_documents")
      .update({ summary, key_points: keyPoints, status: "complete" })
      .eq("id", documentId);

    if (updateError) {
      console.error("Failed to update document:", updateError);
    }

    return new Response(JSON.stringify({ summary, keyPoints }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("summarize-document error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
