import { CRITERIA, type CriteriaScores, type Restaurant, type Review, type ScoreBreakdown } from './types';

/** Poids de chaque source dans la cote finale (voir l'onboarding). */
export const SCORE_WEIGHTS = { team: 0.6, reviews: 0.2, trend: 0.2 } as const;

const round1 = (n: number) => Math.round(n * 10) / 10;

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}

/**
 * Calcule la cote sur 10 d'un restaurant :
 * visites de l'équipe 60 %, avis clients vérifiés 20 %, tendance Instagram 20 %.
 * Seuls les avis vérifiés comptent dans la part « avis clients ». Sans avis vérifié,
 * cette part reprend la note de l'équipe pour ne pas pénaliser un nouveau restaurant.
 */
export function computeScore(restaurant: Restaurant, reviews: Review[]): ScoreBreakdown {
  const own = reviews.filter((r) => r.restaurantId === restaurant.id);
  const verified = own.filter((r) => r.verified);

  const teamScore = average(CRITERIA.map((c) => restaurant.team[c.key]));

  // Avis sur 5 ramenés sur 10
  const reviewCriteria = {} as CriteriaScores;
  for (const c of CRITERIA) {
    reviewCriteria[c.key] = average(verified.map((r) => r.ratings[c.key])) * 2;
  }
  const reviewsScore = verified.length > 0 ? average(Object.values(reviewCriteria)) : teamScore;

  const total =
    teamScore * SCORE_WEIGHTS.team +
    reviewsScore * SCORE_WEIGHTS.reviews +
    restaurant.trend * SCORE_WEIGHTS.trend;

  const criteria = {} as CriteriaScores;
  for (const c of CRITERIA) {
    criteria[c.key] = round1(
      verified.length > 0
        ? (restaurant.team[c.key] * SCORE_WEIGHTS.team + reviewCriteria[c.key] * SCORE_WEIGHTS.reviews) /
            (SCORE_WEIGHTS.team + SCORE_WEIGHTS.reviews)
        : restaurant.team[c.key],
    );
  }

  const allRatings = own.map((r) => average(CRITERIA.map((c) => r.ratings[c.key])));

  return {
    total: round1(total),
    team: round1(teamScore),
    reviews: round1(reviewsScore),
    trend: round1(restaurant.trend),
    criteria,
    reviewCount: own.length,
    reviewAverage: round1(average(allRatings)),
  };
}
