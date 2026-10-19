// ==============================================================================
// Vector Mathematics & Cosine Similarity Engine
// ==============================================================================

/**
 * Calculates Euclidean L2 norm (magnitude) of a vector:
 * ||v||_2 = sqrt(sum(v_i^2))
 */
export function vectorMagnitude(vector: number[]): number {
  if (!vector || vector.length === 0) return 0;
  let sumSq = 0;
  for (let i = 0; i < vector.length; i++) {
    sumSq += vector[i] * vector[i];
  }
  return Math.sqrt(sumSq);
}

/**
 * Normalizes a vector to unit length (L2 norm = 1.0):
 * v_hat = v / ||v||_2
 */
export function normalizeVector(vector: number[]): number[] {
  const mag = vectorMagnitude(vector);
  if (mag === 0) {
    return new Array(vector.length).fill(0);
  }
  return vector.map((val) => val / mag);
}

/**
 * Calculates exact Cosine Similarity between two vectors:
 * S_C(u, v) = (u . v) / (||u||_2 * ||v||_2)
 *
 * For unit-normalized vectors (||u|| = 1, ||v|| = 1),
 * S_C(u, v) simplifies strictly to the dot product: u . v
 *
 * Returns a value in [-1.0, 1.0].
 * For image embeddings, negative values represent orthogonal/unrelated features.
 */
export function cosineSimilarity(u: number[], v: number[]): number {
  if (!u || !v || u.length === 0 || v.length === 0) {
    return 0;
  }
  if (u.length !== v.length) {
    throw new Error(
      `Vector dimension mismatch in cosineSimilarity: vector A has ${u.length} dimensions, vector B has ${v.length} dimensions.`
    );
  }

  let dotProduct = 0;
  let magU = 0;
  let magV = 0;

  for (let i = 0; i < u.length; i++) {
    dotProduct += u[i] * v[i];
    magU += u[i] * u[i];
    magV += v[i] * v[i];
  }

  magU = Math.sqrt(magU);
  magV = Math.sqrt(magV);

  if (magU === 0 || magV === 0) {
    return 0;
  }

  const rawSim = dotProduct / (magU * magV);
  // Guard against floating point rounding errors outside [-1, 1]
  return Math.max(-1.0, Math.min(1.0, rawSim));
}

/**
 * Computes Euclidean Distance between two vectors:
 * d(u, v) = sqrt(sum((u_i - v_i)^2))
 */
export function euclideanDistance(u: number[], v: number[]): number {
  if (!u || !v || u.length !== v.length) {
    throw new Error('Vector dimension mismatch in euclideanDistance');
  }
  let sumSqDiff = 0;
  for (let i = 0; i < u.length; i++) {
    const diff = u[i] - v[i];
    sumSqDiff += diff * diff;
  }
  return Math.sqrt(sumSqDiff);
}

/**
 * Converts a raw cosine similarity [-1.0, 1.0] to a standardized similarity percentage [0, 100].
 * Image embeddings in models like CLIP/Vision encoders typically range from 0.0 to 1.0.
 */
export function similarityToPercentage(sim: number): number {
  // Normalize cosine similarity to [0, 100]%
  // Values below 0 represent unrelated visual concepts and are clamped to 0.
  const clamped = Math.max(0, Math.min(1, sim));
  return Math.round(clamped * 100);
}
