import { ImageEmbeddingProvider } from './types';
import { GeminiMultimodalEmbeddingProvider } from './geminiProvider';
import { EdgeFunctionEmbeddingProvider } from './edgeFunctionProvider';
import { DeterministicDemoEmbeddingProvider } from './demoProvider';
import { cosineSimilarity } from './similarity';
import { rankCandidate } from './ranker';
import { FoundItem } from '../../types/item';
import { MatchCandidate, MatchSearchParams, RankingWeights } from '../../types/matching';
import { DEFAULT_RANKING_WEIGHTS } from '../../lib/constants';

let currentProvider: ImageEmbeddingProvider | null = null;

export function getActiveEmbeddingProvider(): ImageEmbeddingProvider {
  if (currentProvider) return currentProvider;

  const configProvider = import.meta.env.VITE_AI_PROVIDER?.toLowerCase();

  if (configProvider === 'gemini') {
    const gemini = new GeminiMultimodalEmbeddingProvider();
    if (gemini.isConfigured()) {
      currentProvider = gemini;
      return currentProvider;
    }
  }

  if (configProvider === 'edge-function') {
    const edge = new EdgeFunctionEmbeddingProvider();
    if (edge.isConfigured()) {
      currentProvider = edge;
      return currentProvider;
    }
  }

  // Fallback to deterministic demo provider
  currentProvider = new DeterministicDemoEmbeddingProvider();
  return currentProvider;
}

export function setActiveEmbeddingProvider(provider: ImageEmbeddingProvider): void {
  currentProvider = provider;
}

/**
 * Executes visual cosine matching and multi-signal ranking for a query image embedding
 * against an array of candidate found items with known embeddings.
 */
export async function matchImageWithCandidates(
  queryEmbedding: number[],
  candidatesWithEmbeddings: Array<{ item: FoundItem; embedding: number[] }>,
  params: MatchSearchParams,
  weights: RankingWeights = DEFAULT_RANKING_WEIGHTS
): Promise<MatchCandidate[]> {
  const threshold = params.threshold ?? 0.35; // Default minimum threshold for broad candidate inclusion

  const ranked: MatchCandidate[] = [];

  for (const { item, embedding } of candidatesWithEmbeddings) {
    if (!item.isApproved || item.status !== 'available') {
      continue;
    }

    // Pure mathematical cosine similarity
    const rawCosine = cosineSimilarity(queryEmbedding, embedding);

    // Multi-signal composite ranking
    const candidate = rankCandidate(item, rawCosine, params, weights);

    if (candidate.compositeScore >= threshold) {
      ranked.push(candidate);
    }
  }

  // Sort by composite score descending
  ranked.sort((a, b) => b.compositeScore - a.compositeScore);

  const limit = params.limit ?? 20;
  return ranked.slice(0, limit);
}
