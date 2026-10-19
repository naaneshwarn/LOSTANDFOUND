import { ImageEmbeddingProvider } from './types';
import { EmbeddingResult } from '../../types/matching';
import { normalizeVector } from './similarity';
import { fileToBase64, simpleHash } from '../../lib/utils';
import { getCachedEmbedding, setCachedEmbedding } from './cache';

export class GeminiMultimodalEmbeddingProvider implements ImageEmbeddingProvider {
  readonly name = 'Google Gemini Vision Embedding';
  readonly isDemo = false;

  private apiKey: string;

  constructor() {
    this.apiKey = import.meta.env.VITE_GEMINI_API_KEY || '';
  }

  isConfigured(): boolean {
    return Boolean(
      this.apiKey &&
      this.apiKey !== 'your_gemini_api_key_here' &&
      !this.apiKey.includes('placeholder')
    );
  }

  async generateEmbedding(imageFileOrBase64: string | File): Promise<EmbeddingResult> {
    if (!this.isConfigured()) {
      throw new Error(
        'Gemini API Key is not configured. Please supply VITE_GEMINI_API_KEY in .env or run in Demo Mode.'
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

    // Clean base64 prefix
    const cleanBase64 = base64Data.replace(/^data:image\/\w+;base64,/, '');
    const imageHash = simpleHash(cleanBase64.slice(0, 1000) + cleanBase64.length);

    // Check cache
    const cached = getCachedEmbedding(imageHash);
    if (cached) {
      return cached;
    }

    // Call Gemini Embedding API
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/multimodal-embedding:generateEmbedding?key=${this.apiKey}`;

    const response = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        image: {
          inlineData: {
            mimeType,
            data: cleanBase64,
          },
        },
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`Gemini Multimodal API error (${response.status}): ${errText}`);
    }

    const data = await response.json();
    const rawValues: number[] = data.embedding?.values || [];

    if (rawValues.length === 0) {
      throw new Error('Gemini Multimodal API returned an empty embedding vector.');
    }

    const normalizedVector = normalizeVector(rawValues);

    const result: EmbeddingResult = {
      embedding: normalizedVector,
      dimension: normalizedVector.length,
      model: 'gemini-multimodal-embedding',
      version: '1.0.0',
      imageHash,
    };

    setCachedEmbedding(imageHash, result);
    return result;
  }
}
