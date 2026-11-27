/**
 * Recherche et filtres du classement. Fonctions pures, testées, partagées par
 * l'accueil et la carte. Le backend pourra reprendre les mêmes règles plus tard.
 */
import { isOpenAt } from '@/lib/format';

import type { Amenity, Commune, PriceLevel, RankedRestaurant } from './types';

/** Minuscules, sans accents ni apostrophes, pour comparer « Mbóka » et « mboka ». */
export function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[’'`-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export type MatchField = 'nom' | 'plat' | 'cuisine' | 'quartier' | 'adresse';

export type SearchResult = {
  restaurant: RankedRestaurant;
  /** Ce qui a fait correspondre le restaurant, pour l'afficher sous le nom. */
  match: { field: MatchField; text: string } | null;
};

const FIELD_WEIGHT: Record<MatchField, number> = { nom: 4, plat: 3, cuisine: 2, quartier: 2, adresse: 1 };

function fieldsOf(r: RankedRestaurant): { field: MatchField; text: string }[] {
  return [
    { field: 'nom', text: r.name },
    ...r.dishes.map((d) => ({ field: 'plat' as const, text: d })),
    { field: 'cuisine', text: r.cuisine },
    { field: 'quartier', text: r.commune },
    { field: 'adresse', text: `${r.address}, ${r.landmark}` },
  ];
}

/**
 * Recherche par nom, plat, cuisine ou quartier. Chaque mot tapé doit se retrouver
 * quelque part dans la fiche. Les résultats gardent l'ordre du classement, sauf
 * que les correspondances sur le nom passent devant.
 */
export function searchRestaurants(list: RankedRestaurant[], query: string): SearchResult[] {
  const words = normalize(query).split(' ').filter(Boolean);
  if (words.length === 0) return list.map((restaurant) => ({ restaurant, match: null }));

  const results: (SearchResult & { weight: number; index: number })[] = [];
  list.forEach((restaurant, index) => {
    const fields = fieldsOf(restaurant).map((f) => ({ ...f, norm: normalize(f.text) }));
    const everyWordFound = words.every((w) => fields.some((f) => f.norm.includes(w)));
    if (!everyWordFound) return;
    // Le champ qui contient le plus de mots tapés explique le résultat.
    let best = fields[0];
    let bestScore = -1;
    for (const f of fields) {
      const hits = words.filter((w) => f.norm.includes(w)).length;
      const score = hits * 10 + (hits > 0 ? FIELD_WEIGHT[f.field] : 0);
      if (score > bestScore) {
        best = f;
        bestScore = score;
      }
    }
    results.push({
      restaurant,
      match: { field: best.field, text: best.text },
      weight: best.field === 'nom' ? 1 : 0,
      index,
    });
  });
  return results
    .sort((a, b) => b.weight - a.weight || a.index - b.index)
    .map(({ restaurant, match }) => ({ restaurant, match }));
}

export const MATCH_LABELS: Record<MatchField, string> = {
  nom: 'Nom',
  plat: 'Plat',
  cuisine: 'Cuisine',
  quartier: 'Quartier',
  adresse: 'Adresse',
};

export type SortOrder = 'cote' | 'distance';

export type Filters = {
  /** Seulement à moins de `NEAR_KM`, triés par distance. */
  near: boolean;
  commune: Commune | null;
  openNow: boolean;
  /** Niveau de prix maximum ($, $$, $$$). */
  maxPrice: PriceLevel | null;
  minScore: number | null;
  amenities: Amenity[];
  sort: SortOrder;
};

export const NEAR_KM = 3;

export const EMPTY_FILTERS: Filters = {
  near: false,
  commune: null,
  openNow: false,
  maxPrice: null,
  minScore: null,
  amenities: [],
  sort: 'cote',
};

/** Nombre de filtres actifs (le tri n'en est pas un). */
export function activeFilterCount(f: Filters): number {
  return (
    Number(f.near) +
    Number(f.commune !== null) +
    Number(f.openNow) +
    Number(f.maxPrice !== null) +
    Number(f.minScore !== null) +
    f.amenities.length
  );
}

export function applyFilters<T extends { restaurant: RankedRestaurant }>(items: T[], f: Filters, now: Date): T[] {
  const out = items.filter(({ restaurant: r }) => {
    if (f.near && r.distanceKm > NEAR_KM) return false;
    if (f.commune && r.commune !== f.commune) return false;
    if (f.openNow && !isOpenAt(r.hours, now)) return false;
    if (f.maxPrice !== null && r.priceLevel > f.maxPrice) return false;
    if (f.minScore !== null && r.score.total < f.minScore) return false;
    if (f.amenities.some((a) => !r.amenities.includes(a))) return false;
    return true;
  });
  if (f.near || f.sort === 'distance') {
    return [...out].sort((a, b) => a.restaurant.distanceKm - b.restaurant.distanceKm);
  }
  return out;
}

/** Suggestions affichées quand le champ de recherche est vide. */
export const SEARCH_SUGGESTIONS = ['Liboke', 'Moambe', 'Brochettes', 'Poisson braisé', 'Pizza', 'Ngaliema'];
