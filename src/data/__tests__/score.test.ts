import { describe, expect, it } from '@jest/globals';

import { MOCK_RESTAURANTS } from '../mock/restaurants';
import { MOCK_REVIEWS } from '../mock/reviews';
import { canReview, rankRestaurants } from '../repository';
import { computeScore } from '../score';
import type { Restaurant, Review } from '../types';

const base: Restaurant = {
  ...MOCK_RESTAURANTS[0],
  id: 'test',
  team: { cuisine: 8, service: 8, ambiance: 8, prix: 8 },
  trend: 6,
};

const review = (overrides: Partial<Review> = {}): Review => ({
  id: 'x',
  restaurantId: 'test',
  authorName: 'Test',
  ratings: { cuisine: 5, service: 5, ambiance: 5, prix: 5 },
  comment: '',
  verified: true,
  createdAt: '2026-11-01T12:00:00Z',
  ...overrides,
});

describe('computeScore', () => {
  it('pondère équipe 60 %, avis 20 %, tendance 20 %', () => {
    // 8 × 0,6 + 10 × 0,2 + 6 × 0,2 = 8,0
    expect(computeScore(base, [review()]).total).toBe(8);
  });

  it('sans avis vérifié, la part avis reprend la note de l’équipe', () => {
    // 8 × 0,6 + 8 × 0,2 + 6 × 0,2 = 7,6
    expect(computeScore(base, [review({ verified: false })]).total).toBe(7.6);
    expect(computeScore(base, []).total).toBe(7.6);
  });

  it('compte tous les avis mais ne note qu’avec les vérifiés', () => {
    const s = computeScore(base, [review(), review({ id: 'y', verified: false })]);
    expect(s.reviewCount).toBe(2);
    expect(s.reviews).toBe(10);
  });
});

describe('rankRestaurants', () => {
  it('classe par cote et numérote ville et commune', () => {
    const ranking = rankRestaurants(MOCK_RESTAURANTS, MOCK_REVIEWS);
    expect(ranking).toHaveLength(MOCK_RESTAURANTS.length);
    for (let i = 1; i < ranking.length; i++) {
      expect(ranking[i - 1].score.total).toBeGreaterThanOrEqual(ranking[i].score.total);
    }
    expect(ranking.map((r) => r.cityRank)).toEqual(ranking.map((_, i) => i + 1));
    const gombe = ranking.filter((r) => r.commune === 'Gombe');
    expect(gombe.map((r) => r.communeRank)).toEqual(gombe.map((_, i) => i + 1));
  });
});

describe('canReview', () => {
  const now = new Date('2026-11-27T12:00:00Z');
  it('refuse un second avis avant 30 jours', () => {
    expect(canReview('test', [review({ createdAt: '2026-11-10T12:00:00Z' })], now)).toBe(false);
  });
  it('accepte après 30 jours ou sans avis', () => {
    expect(canReview('test', [review({ createdAt: '2026-10-20T12:00:00Z' })], now)).toBe(true);
    expect(canReview('test', [], now)).toBe(true);
  });
});
