import { describe, it, expect } from 'vitest';
import {
  vectorMagnitude,
  normalizeVector,
  cosineSimilarity,
  euclideanDistance,
  similarityToPercentage,
} from '../services/ai/similarity';

describe('Vector Mathematics & Cosine Similarity Engine', () => {
  it('correctly calculates vector magnitude (L2 norm)', () => {
    // 3-4-5 right triangle
    const v = [3, 4];
    expect(vectorMagnitude(v)).toBe(5);

    // Zero vector
    expect(vectorMagnitude([0, 0, 0])).toBe(0);

    // Single dimension
    expect(vectorMagnitude([7])).toBe(7);
  });

  it('normalizes vector to unit length (magnitude = 1.0)', () => {
    const v = [10, 20, 30, 40];
    const norm = normalizeVector(v);
    const mag = vectorMagnitude(norm);
    expect(mag).toBeCloseTo(1.0, 5);
  });

  it('handles zero vector normalization gracefully', () => {
    const v = [0, 0, 0];
    const norm = normalizeVector(v);
    expect(norm).toEqual([0, 0, 0]);
  });

  it('calculates exact cosine similarity for identical vectors as 1.0', () => {
    const u = [0.2, 0.5, 0.8, -0.1];
    const v = [0.2, 0.5, 0.8, -0.1];
    const sim = cosineSimilarity(u, v);
    expect(sim).toBeCloseTo(1.0, 5);
  });

  it('calculates exact cosine similarity for orthogonal vectors as 0.0', () => {
    const u = [1, 0, 0];
    const v = [0, 1, 0];
    const sim = cosineSimilarity(u, v);
    expect(sim).toBeCloseTo(0.0, 5);
  });

  it('calculates exact cosine similarity for opposite vectors as -1.0', () => {
    const u = [1, 2, 3];
    const v = [-1, -2, -3];
    const sim = cosineSimilarity(u, v);
    expect(sim).toBeCloseTo(-1.0, 5);
  });

  it('throws error when vector dimensions mismatch', () => {
    const u = [1, 2, 3];
    const v = [1, 2];
    expect(() => cosineSimilarity(u, v)).toThrowError(/Vector dimension mismatch/);
  });

  it('correctly maps cosine similarity to standardized percentage [0, 100]', () => {
    expect(similarityToPercentage(1.0)).toBe(100);
    expect(similarityToPercentage(0.5)).toBe(50);
    expect(similarityToPercentage(0.854)).toBe(85);
    expect(similarityToPercentage(-0.5)).toBe(0); // negative clamped to 0
  });

  it('calculates euclidean distance accurately', () => {
    const u = [1, 2];
    const v = [4, 6];
    // dx = 3, dy = 4, dist = 5
    expect(euclideanDistance(u, v)).toBe(5);
  });
});
