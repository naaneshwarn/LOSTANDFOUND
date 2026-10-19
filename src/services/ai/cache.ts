// In-memory and LocalStorage cache for image embeddings
import { EmbeddingResult } from '../../types/matching';

const CACHE_PREFIX = 'lostfound_embed_cache_';
const memoryCache = new Map<string, EmbeddingResult>();

export function getCachedEmbedding(imageHash: string): EmbeddingResult | null {
  if (!imageHash) return null;

  // 1. Check in-memory cache
  if (memoryCache.has(imageHash)) {
    return memoryCache.get(imageHash)!;
  }

  // 2. Check LocalStorage
  try {
    const raw = localStorage.getItem(`${CACHE_PREFIX}${imageHash}`);
    if (raw) {
      const parsed = JSON.parse(raw) as EmbeddingResult;
      memoryCache.set(imageHash, parsed);
      return parsed;
    }
  } catch {
    // Ignore storage quota or access errors
  }

  return null;
}

export function setCachedEmbedding(imageHash: string, result: EmbeddingResult): void {
  if (!imageHash || !result) return;

  // 1. Save to in-memory cache
  memoryCache.set(imageHash, result);

  // 2. Persist to LocalStorage
  try {
    localStorage.setItem(`${CACHE_PREFIX}${imageHash}`, JSON.stringify(result));
  } catch {
    // Storage might be full or private browsing active
  }
}

export function clearEmbeddingCache(): void {
  memoryCache.clear();
  try {
    const keys = Object.keys(localStorage);
    for (const key of keys) {
      if (key.startsWith(CACHE_PREFIX)) {
        localStorage.removeItem(key);
      }
    }
  } catch {
    // Ignore
  }
}
