// Supabase Edge Function: embed-image
// Generates normalized image embeddings using Gemini Multimodal / Vision Embedding API
// Keeps API keys strictly on the server side.

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { imageBase64, mimeType = "image/jpeg" } = await req.json();

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "Missing imageBase64 in request body" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const geminiApiKey = Deno.env.get("GEMINI_API_KEY");
    if (!geminiApiKey) {
      return new Response(
        JSON.stringify({
          error: "GEMINI_API_KEY is not configured on the server. Please configure it in your Supabase Edge Function secrets.",
          code: "PROVIDER_NOT_CONFIGURED"
        }),
        { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Call Gemini Multimodal Embedding model
    // Model: text-embedding-004 or multimodal-embedding
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/multimodal-embedding:generateEmbedding?key=${geminiApiKey}`;

    const response = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        image: {
          inlineData: {
            mimeType: mimeType,
            data: imageBase64.replace(/^data:image\/\w+;base64,/, ""),
          },
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawValues: number[] = data.embedding?.values || [];

    // Normalize embedding vector to unit length ||v|| = 1.0 for cosine similarity via dot product
    const norm = Math.sqrt(rawValues.reduce((sum, val) => sum + val * val, 0));
    const normalizedEmbedding = norm > 0 ? rawValues.map((v) => v / norm) : rawValues;

    return new Response(
      JSON.stringify({
        embedding: normalizedEmbedding,
        dimension: normalizedEmbedding.length,
        model: "gemini-multimodal-embedding",
        version: "1.0",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
