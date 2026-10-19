// Matching and AI types

import { FoundItem, ItemCategory } from './item';

export interface EmbeddingResult {
  embedding: number[];
  dimension: number;
  model: string;
  version: string;
  imageHash?: string;
}

export type MatchingMethod = 
  | 'cosine_similarity_direct'
  | 'composite_multi_signal'
  | 'deterministic_demo';

export interface RankingWeights {
  visual: number;    // e.g. 0.65 (65%)
  category: number;  // e.g. 0.15 (15%)
  location: number;  // e.g. 0.10 (10%)
  date: number;      // e.g. 0.10 (10%)
}

export interface MatchSignals {
  visual: number;    // 0 to 100
  category: number;  // 0 or 100
  location: number;  // 0 to 100
  date: number;      // 0 to 100
}

export type UserFeedbackStatus = 'pending' | 'potential_match' | 'not_a_match' | 'contact_requested';

export interface MatchCandidate {
  foundItem: FoundItem;
  similarityScore: number; // raw cosine similarity (0.0 to 1.0)
  compositeScore: number;  // weighted composite score (0.0 to 1.0)
  similarityPercentage: number; // e.g. 88%
  signals: MatchSignals;
  sharedAttributes: string[];
  userFeedback?: UserFeedbackStatus;
  matchingMethod: MatchingMethod;
  explanation: string;
}

export interface MatchSearchParams {
  lostItemId?: string;
  category?: ItemCategory;
  location?: string;
  dateLost?: string;
  threshold?: number;
  weights?: RankingWeights;
  limit?: number;
}
