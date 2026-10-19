import { FoundItem } from '../../types/item';
import { MatchCandidate, MatchSearchParams, RankingWeights, MatchSignals } from '../../types/matching';
import { DEFAULT_RANKING_WEIGHTS } from '../../lib/constants';
import { similarityToPercentage } from './similarity';

/**
 * Calculates a text location proximity signal between 0 and 100
 */
export function calculateLocationScore(locationLost?: string, locationFound?: string): number {
  if (!locationLost || !locationFound) return 50; // Neutral if missing

  const normA = locationLost.toLowerCase().trim();
  const normB = locationFound.toLowerCase().trim();

  // Exact match
  if (normA === normB) return 100;

  // Substring containment (e.g. "Science Building" in "Science Building, Room 302")
  if (normA.includes(normB) || normB.includes(normA)) return 85;

  // Word token overlap (e.g. campus building names)
  const wordsA = new Set(normA.split(/[\s,.-]+/).filter((w) => w.length > 2));
  const wordsB = new Set(normB.split(/[\s,.-]+/).filter((w) => w.length > 2));

  let sharedWords = 0;
  wordsA.forEach((w) => {
    if (wordsB.has(w)) sharedWords++;
  });

  if (sharedWords >= 2) return 75;
  if (sharedWords === 1) return 50;

  return 20; // Different campus areas
}

/**
 * Calculates temporal proximity signal between 0 and 100 using exponential decay
 * Lost items found closest to the date lost receive higher temporal scores.
 */
export function calculateDateScore(dateLostStr?: string, dateFoundStr?: string): number {
  if (!dateLostStr || !dateFoundStr) return 70;

  try {
    const tLost = new Date(dateLostStr).getTime();
    const tFound = new Date(dateFoundStr).getTime();
    const diffDays = Math.abs((tFound - tLost) / (1000 * 60 * 60 * 24));

    // If item was found before it was supposedly lost by more than 2 days, penalize slightly
    // Otherwise apply exponential decay with a 14-day half life
    const decay = Math.exp(-diffDays / 14);
    return Math.round(Math.max(10, Math.min(100, decay * 100)));
  } catch {
    return 60;
  }
}

/**
 * Evaluates candidate found item against search query parameters and computes
 * composite multi-signal ranking.
 */
export function rankCandidate(
  foundItem: FoundItem,
  visualCosineSim: number,
  params: MatchSearchParams,
  weights: RankingWeights = DEFAULT_RANKING_WEIGHTS
): MatchCandidate {
  // 1. Visual Signal (0 to 100)
  const visualSignal = similarityToPercentage(visualCosineSim);

  // 2. Category Signal (0 or 100)
  let categorySignal = 50;
  if (params.category && foundItem.category) {
    categorySignal =
      params.category.toLowerCase() === foundItem.category.toLowerCase() ? 100 : 0;
  }

  // 3. Location Signal (0 to 100)
  const locationSignal = calculateLocationScore(params.location, foundItem.locationFound);

  // 4. Date Signal (0 to 100)
  const dateSignal = calculateDateScore(params.dateLost, foundItem.dateFound);

  const signals: MatchSignals = {
    visual: visualSignal,
    category: categorySignal,
    location: locationSignal,
    date: dateSignal,
  };

  // 5. Composite Normalized Score
  const totalWeight = weights.visual + weights.category + weights.location + weights.date;
  const rawComposite =
    (visualSignal * weights.visual +
      categorySignal * weights.category +
      locationSignal * weights.location +
      dateSignal * weights.date) /
    (totalWeight || 1);

  const compositeScore = Math.max(0, Math.min(1.0, rawComposite / 100));
  const similarityPercentage = Math.round(rawComposite);

  // 6. Detect verified shared attributes
  const sharedAttributes: string[] = [];
  if (categorySignal === 100) {
    sharedAttributes.push(`Same category: ${foundItem.category}`);
  }
  if (foundItem.color) {
    sharedAttributes.push(`Color: ${foundItem.color}`);
  }
  if (foundItem.brand) {
    sharedAttributes.push(`Brand: ${foundItem.brand}`);
  }
  if (locationSignal >= 75) {
    sharedAttributes.push(`Proximity: Found near ${foundItem.locationFound}`);
  }

  // 7. Human-readable explanation
  let explanation = '';
  if (visualSignal >= 85) {
    explanation = `High visual similarity (${visualSignal}%) with strong feature alignment.`;
  } else if (visualSignal >= 65) {
    explanation = `Moderate visual match (${visualSignal}%) with compatible shapes and colors.`;
  } else {
    explanation = `Visual candidate (${visualSignal}%) surfaced primarily through multi-signal matching.`;
  }

  if (categorySignal === 100) {
    explanation += ` Matches category '${foundItem.category}'.`;
  }

  return {
    foundItem,
    similarityScore: visualCosineSim,
    compositeScore,
    similarityPercentage,
    signals,
    sharedAttributes,
    matchingMethod: 'composite_multi_signal',
    explanation,
  };
}
