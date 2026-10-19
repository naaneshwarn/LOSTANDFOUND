import { describe, it, expect } from 'vitest';
import {
  calculateLocationScore,
  calculateDateScore,
  rankCandidate,
} from '../services/ai/ranker';
import { FoundItem } from '../types/item';

const mockFoundItem: FoundItem = {
  id: 'test-found-1',
  finderId: 'finder-1',
  title: 'Black North Face Backpack',
  category: 'Bags',
  description: 'Black backpack found under desk in Science Building Room 302',
  brand: 'The North Face',
  color: 'Black',
  locationFound: 'Science Building, Room 302',
  dateFound: '2026-10-18',
  imageUrl: 'https://example.com/test.jpg',
  safeContactMethod: 'in_app',
  status: 'available',
  isApproved: true,
  createdAt: '2026-10-18T12:00:00Z',
  updatedAt: '2026-10-18T12:00:00Z',
};

describe('Multi-Signal Candidate Ranker', () => {
  it('awards 100% location score for exact match', () => {
    expect(
      calculateLocationScore('Science Building, Room 302', 'Science Building, Room 302')
    ).toBe(100);
  });

  it('awards high proximity score for substring containment', () => {
    expect(
      calculateLocationScore('Science Building', 'Science Building, Room 302')
    ).toBe(85);
  });

  it('penalizes completely different locations', () => {
    expect(
      calculateLocationScore('Athletic Center Bleachers', 'North Dining Commons')
    ).toBeLessThanOrEqual(20);
  });

  it('applies exponential decay based on temporal distance in days', () => {
    // Same day
    const sameDay = calculateDateScore('2026-10-18', '2026-10-18');
    expect(sameDay).toBe(100);

    // 14 days later (half-life of exp decay is approx 36.8%)
    const twoWeeksLater = calculateDateScore('2026-10-04', '2026-10-18');
    expect(twoWeeksLater).toBeLessThan(50);
    expect(twoWeeksLater).toBeGreaterThan(25);
  });

  it('combines signals into a normalized composite score based on weights', () => {
    const candidate = rankCandidate(
      mockFoundItem,
      0.90, // 90% visual cosine similarity
      {
        category: 'Bags', // matches
        location: 'Science Building, Room 302', // matches
        dateLost: '2026-10-18', // matches
      },
      { visual: 0.65, category: 0.15, location: 0.10, date: 0.10 }
    );

    expect(candidate.signals.visual).toBe(90);
    expect(candidate.signals.category).toBe(100);
    expect(candidate.signals.location).toBe(100);
    expect(candidate.signals.date).toBe(100);

    // Weighted: 90 * 0.65 + 100 * 0.15 + 100 * 0.10 + 100 * 0.10 = 58.5 + 15 + 10 + 10 = 93.5%
    expect(candidate.similarityPercentage).toBe(94);
    expect(candidate.compositeScore).toBeCloseTo(0.935, 2);
    expect(candidate.sharedAttributes).toContain('Same category: Bags');
  });
});
