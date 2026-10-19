// Supabase Edge Function: match-image
// Performs secure server-side cosine similarity search & multi-signal candidate ranking

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface MatchRequest {
  queryEmbedding: number[];
  category?: string;
  location?: string;
  dateLost?: string;
  weights?: {
    visual?: number;
    category?: number;
    location?: number;
    date?: number;
  };
  threshold?: number;
  limit?: number;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const body: MatchRequest = await req.json();
    const {
      queryEmbedding,
      category,
      location,
      dateLost,
      weights = { visual: 0.65, category: 0.15, location: 0.10, date: 0.10 },
      threshold = 0.50,
      limit = 20,
    } = body;

    if (!queryEmbedding || !Array.isArray(queryEmbedding) || queryEmbedding.length === 0) {
      return new Response(
        JSON.stringify({ error: "queryEmbedding must be a non-empty array of numbers" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Call stored procedure RPC or query embeddings directly
    const { data: candidates, error } = await supabase.rpc("match_found_items", {
      query_embedding: queryEmbedding,
      match_threshold: 0.20, // get broad candidates, apply composite weighting
      max_results: 50,
    });

    if (error) {
      throw error;
    }

    // Apply Composite Multi-Signal Ranking
    const rankedResults = (candidates || []).map((item: any) => {
      const visualScore = Math.max(0, Math.min(1, item.similarity_score));

      // Category matching signal (1.0 if identical, 0.0 otherwise)
      const categoryScore = category && item.category
        ? item.category.toLowerCase() === category.toLowerCase() ? 1.0 : 0.0
        : 0.5;

      // Location match signal (simple normalized string overlap)
      let locationScore = 0.5;
      if (location && item.location_found) {
        const locA = location.toLowerCase();
        const locB = item.location_found.toLowerCase();
        if (locA === locB || locB.includes(locA) || locA.includes(locB)) {
          locationScore = 1.0;
        } else {
          locationScore = 0.2;
        }
      }

      // Date match signal (exponential decay based on days apart)
      let dateScore = 0.8;
      if (dateLost && item.date_found) {
        const diffDays = Math.abs(
          (new Date(dateLost).getTime() - new Date(item.date_found).getTime()) / (1000 * 60 * 60 * 24)
        );
        dateScore = Math.max(0.1, Math.exp(-diffDays / 14)); // 14-day half-life decay
      }

      const wVisual = weights.visual ?? 0.65;
      const wCat = weights.category ?? 0.15;
      const wLoc = weights.location ?? 0.10;
      const wDate = weights.date ?? 0.10;
      const totalWeight = wVisual + wCat + wLoc + wDate;

      const compositeScore = (
        (visualScore * wVisual) +
        (categoryScore * wCat) +
        (locationScore * wLoc) +
        (dateScore * wDate)
      ) / totalWeight;

      return {
        ...item,
        visualScore,
        compositeScore,
        signals: {
          visual: Math.round(visualScore * 100),
          category: Math.round(categoryScore * 100),
          location: Math.round(locationScore * 100),
          date: Math.round(dateScore * 100),
        },
      };
    })
    .filter((item: any) => item.compositeScore >= threshold)
    .sort((a: any, b: any) => b.compositeScore - a.compositeScore)
    .slice(0, limit);

    return new Response(
      JSON.stringify({
        matches: rankedResults,
        totalFound: rankedResults.length,
        method: "cosine_similarity_plus_composite_ranking",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: (err as Error).message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
