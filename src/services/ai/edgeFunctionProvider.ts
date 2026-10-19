import { ImageEmbeddingProvider } from './types';
import { EmbeddingResult } from '../../types/matching';
import { supabase, isSupabaseConfigured } from '../../lib/supabase';
import { fileToBase64, simpleHash } from '../../lib/utils';
import { getCachedEmbedding, setCachedEmbedding } from './cache';

export class EdgeFunctionEmbeddingProvider implements ImageEmbeddingProvider {
  readonly name = 'Supabase Edge Function AI Matching';
  readonly isDemo = false;

  isConfigured(): boolean {
    return isSupabaseConfigured;
  }

  async generateEmbedding(imageFileOrBase64: string | File): Promise<EmbeddingResult> {
    if (!this.isConfigured()) {
      throw new Error(
        'Supabase is not configured. Please supply VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.'
      );
    }

    let base64Data = '';
    let mimeType = 'image/jpeg';

    if (typeof imageFileOrBase64 === 'string') {
      base64Data = imageFileOrBase64;
      const match = imageFileOrBase64.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/);
      if (match) {
        mimeType = match[1];
      }
    } else {
      mimeType = imageFileOrBase64.type || 'image/jpeg';
      base64Data = await fileToBase64(imageFileOrBase64);
    }

    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const imageHash = simpleHash(cleanBase64.slice(0, 1000) + cleanBase64.length);

    const cached = getCachedEmbedding(imageHash);
    if (cached) {
      return cached;
    }

    // Call Supabase Edge Function
    const { data, error } = await supabase.functions.invoke('embed-image', {
      body: {
        imageBase64: cleanBase64,
        mimeType,
      },
    });

    if (error) {
      throw new Error(`Edge Function error: ${error.message}`);
    }

    if (!data || !data.embedding) {
      throw new Error('Edge Function did not return an embedding vector.');
    }

    const result: EmbeddingResult = {
      embedding: data.embedding,
      dimension: data.dimension || data.embedding.length,
      model: data.model || 'edge-function-embedding',
      version: data.version || '1.0.0',
      imageHash,
    };

    setCachedEmbedding(imageHash, result);
    return result;
  }
}
