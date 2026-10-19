import { ImageEmbeddingProvider } from './types';
import { EmbeddingResult } from '../../types/matching';
import { normalizeVector } from './similarity';
import { simpleHash, fileToBase64 } from '../../lib/utils';
import { getCachedEmbedding, setCachedEmbedding } from './cache';

const VECTOR_DIMENSION = 512;

/**
 * Creates a deterministic pseudo-random number generator from a seed string
 */
function pseudoRandom(seedStr: string): () => number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < seedStr.length; i++) {
    h = Math.imul(h ^ seedStr.charCodeAt(i), 16777619);
  }
  return function () {
    h += h << 13;
    h ^= h >>> 7;
    h += h << 3;
    h ^= h >>> 17;
    return (h >>> 0) / 4294967296;
  };
}

/**
 * Generates a stable, reproducible normalized 512-dimension vector from a semantic cluster and seed.
 */
export function generateDeterministicVector(clusterKey: string, seed: string): number[] {
  const prng = pseudoRandom(`${clusterKey}_${seed}`);
  const vector: number[] = new Array(VECTOR_DIMENSION);

  // Define semantic region bands
  const clusterHash = simpleHash(clusterKey);
  const clusterPrng = pseudoRandom(clusterHash);

  // Generate a stable base centroid for this object class
  const baseCentroid: number[] = new Array(VECTOR_DIMENSION);
  for (let i = 0; i < VECTOR_DIMENSION; i++) {
    baseCentroid[i] = clusterPrng() * 2 - 1;
  }
  const normCentroid = normalizeVector(baseCentroid);

  // Blend base centroid with instance variation
  for (let i = 0; i < VECTOR_DIMENSION; i++) {
    const variation = prng() * 2 - 1;
    // 80% category & visual trait cluster, 20% instance variation
    vector[i] = normCentroid[i] * 0.80 + variation * 0.20;
  }

  return normalizeVector(vector);
}

export class DeterministicDemoEmbeddingProvider implements ImageEmbeddingProvider {
  readonly name = 'Deterministic Demo Vision Provider';
  readonly isDemo = true;

  isConfigured(): boolean {
    return true; // Always available as fallback
  }

  async generateEmbedding(imageFileOrBase64: string | File): Promise<EmbeddingResult> {
    let contentString = '';
    if (typeof imageFileOrBase64 === 'string') {
      contentString = imageFileOrBase64;
    } else {
      contentString = await fileToBase64(imageFileOrBase64);
    }

    // Generate hash of image content
    const imageHash = simpleHash(contentString.slice(0, 1000) + contentString.length);

    // Check cache first
    const cached = getCachedEmbedding(imageHash);
    if (cached) {
      return cached;
    }

    // Determine semantic cluster based on content signatures or preset matching
    let clusterKey = 'general_object';
    const lowerContent = contentString.toLowerCase();

    if (lowerContent.includes('backpack') || lowerContent.includes('borealis') || lowerContent.includes('553062407')) {
      clusterKey = 'backpack_black';
    } else if (lowerContent.includes('waterbottle') || lowerContent.includes('hydro') || lowerContent.includes('602143407')) {
      clusterKey = 'bottle_blue';
    } else if (lowerContent.includes('airpod') || lowerContent.includes('earbud') || lowerContent.includes('600294037')) {
      clusterKey = 'audio_white';
    } else if (lowerContent.includes('key') || lowerContent.includes('carabiner') || lowerContent.includes('582139329')) {
      clusterKey = 'keys_brass';
    } else if (lowerContent.includes('wallet') || lowerContent.includes('bifold') || lowerContent.includes('627123424')) {
      clusterKey = 'wallet_leather';
    } else if (lowerContent.includes('charger') || lowerContent.includes('adapter') || lowerContent.includes('583863788')) {
      clusterKey = 'electronics_white';
    } else if (lowerContent.includes('jacket') || lowerContent.includes('patagonia') || lowerContent.includes('544441893')) {
      clusterKey = 'clothing_black';
    } else if (lowerContent.includes('sunglasses') || lowerContent.includes('wayfarer') || lowerContent.includes('511499767')) {
      clusterKey = 'eyewear_black';
    } else if (lowerContent.includes('card') || lowerContent.includes('lanyard') || lowerContent.includes('589829545')) {
      clusterKey = 'card_id';
    } else if (lowerContent.includes('book') || lowerContent.includes('textbook') || lowerContent.includes('544716278')) {
      clusterKey = 'book_hardcover';
    }

    const vector = generateDeterministicVector(clusterKey, imageHash);

    const result: EmbeddingResult = {
      embedding: vector,
      dimension: VECTOR_DIMENSION,
      model: 'deterministic-visual-feature-v1',
      version: '1.0.0',
      imageHash,
    };

    setCachedEmbedding(imageHash, result);
    return result;
  }
}
