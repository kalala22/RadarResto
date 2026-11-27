/**
 * Couche d'accès aux données. Tout l'écran passe par ces fonctions asynchrones :
 * aujourd'hui elles lisent les données fictives, demain elles appelleront l'API
 * (AdonisJS) sans que les écrans changent.
 */
import { DEFAULT_USER_POSITION, distanceKm, type LatLng } from '@/lib/geo';

import { MOCK_RESTAURANTS } from './mock/restaurants';
import { MOCK_REVIEWS } from './mock/reviews';
import { computeScore } from './score';
import type { RankedRestaurant, Restaurant, Review } from './types';

/** Classe les restaurants par cote, et calcule le rang dans la ville et dans la commune. */
export function rankRestaurants(
  restaurants: Restaurant[],
  reviews: Review[],
  position: LatLng = DEFAULT_USER_POSITION,
): RankedRestaurant[] {
  const scored = restaurants
    .map((r) => ({ ...r, score: computeScore(r, reviews), distanceKm: distanceKm(position, r) }))
    .sort((a, b) => b.score.total - a.score.total || a.name.localeCompare(b.name));

  const communeCounters = new Map<string, number>();
  return scored.map((r, index) => {
    const communeRank = (communeCounters.get(r.commune) ?? 0) + 1;
    communeCounters.set(r.commune, communeRank);
    return { ...r, cityRank: index + 1, communeRank };
  });
}

/** Les avis enregistrés sur l'appareil s'ajoutent aux avis fictifs. */
export async function getRanking(localReviews: Review[] = []): Promise<RankedRestaurant[]> {
  return rankRestaurants(MOCK_RESTAURANTS, [...MOCK_REVIEWS, ...localReviews]);
}

export async function getReviews(restaurantId: string, localReviews: Review[] = []): Promise<Review[]> {
  return [...localReviews, ...MOCK_REVIEWS]
    .filter((r) => r.restaurantId === restaurantId)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/** Code de vérification simulé : n'importe quel code à 6 chiffres est accepté. */
export async function sendOtp(_phone: string, _channel: 'whatsapp' | 'sms'): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, 300));
}

export async function verifyOtp(_phone: string, code: string): Promise<boolean> {
  await new Promise((resolve) => setTimeout(resolve, 300));
  return /^\d{6}$/.test(code);
}

/** Un avis par restaurant tous les 30 jours. */
export const REVIEW_COOLDOWN_DAYS = 30;

export function canReview(restaurantId: string, myReviews: Review[], now: Date): boolean {
  const last = myReviews
    .filter((r) => r.restaurantId === restaurantId)
    .map((r) => new Date(r.createdAt).getTime())
    .sort((a, b) => b - a)[0];
  if (last === undefined) return true;
  return now.getTime() - last >= REVIEW_COOLDOWN_DAYS * 24 * 3600 * 1000;
}
