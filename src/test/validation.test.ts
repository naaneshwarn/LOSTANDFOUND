import { describe, it, expect } from 'vitest';
import { ITEM_CATEGORIES, DEFAULT_RANKING_WEIGHTS } from '../lib/constants';

describe('Validation and Architectural Invariants', () => {
  it('contains all 10 required item categories', () => {
    expect(ITEM_CATEGORIES).toContain('Electronics');
    expect(ITEM_CATEGORIES).toContain('Bags');
    expect(ITEM_CATEGORIES).toContain('Wallets');
    expect(ITEM_CATEGORIES).toContain('Keys');
    expect(ITEM_CATEGORIES).toContain('Documents');
    expect(ITEM_CATEGORIES).toContain('Clothing');
    expect(ITEM_CATEGORIES).toContain('Accessories');
    expect(ITEM_CATEGORIES).toContain('Books');
    expect(ITEM_CATEGORIES).toContain('ID Cards');
    expect(ITEM_CATEGORIES).toContain('Other');
  });

  it('ensures default ranking weights sum to 1.0', () => {
    const sum =
      DEFAULT_RANKING_WEIGHTS.visual +
      DEFAULT_RANKING_WEIGHTS.category +
      DEFAULT_RANKING_WEIGHTS.location +
      DEFAULT_RANKING_WEIGHTS.date;

    expect(sum).toBeCloseTo(1.0, 5);
  });
});
