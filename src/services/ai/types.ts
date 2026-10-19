import { EmbeddingResult } from '../../types/matching';

export interface ImageEmbeddingProvider {
  readonly name: string;
  readonly isDemo: boolean;
  isConfigured(): boolean;
  generateEmbedding(imageFileOrBase64: string | File): Promise<EmbeddingResult>;
}
