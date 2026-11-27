import { describe, expect, it } from '@jest/globals';

import { MOCK_RESTAURANTS } from '../mock/restaurants';
import { MOCK_REVIEWS } from '../mock/reviews';
import { rankRestaurants } from '../repository';
import { EMPTY_FILTERS, activeFilterCount, applyFilters, normalize, searchRestaurants } from '../search';

const ranking = rankRestaurants(MOCK_RESTAURANTS, MOCK_REVIEWS);
const ids = (results: { restaurant: { id: string } }[]) => results.map((r) => r.restaurant.id);

describe('recherche', () => {
  it('ignore les accents, la casse et les apostrophes', () => {
    expect(normalize('Poulet à la MOAMBE')).toBe('poulet a la moambe');
    expect(normalize('L’Étoile d’Or')).toBe('l etoile d or');
  });

  it('trouve un plat et dit pourquoi', () => {
    const results = searchRestaurants(ranking, 'moambe');
    expect(ids(results)).toEqual(['maison-mboka']);
    expect(results[0].match).toEqual({ field: 'plat', text: 'Poulet à la moambe' });
  });

  it('trouve par quartier et garde l’ordre du classement', () => {
    const results = searchRestaurants(ranking, 'ngaliema');
    expect(results.length).toBeGreaterThan(0);
    expect(results.every((r) => r.restaurant.commune === 'Ngaliema')).toBe(true);
    const ranks = results.map((r) => r.restaurant.cityRank);
    expect(ranks).toEqual([...ranks].sort((a, b) => a - b));
  });

  it('demande que chaque mot soit trouvé', () => {
    expect(ids(searchRestaurants(ranking, 'liboke poisson'))).toEqual(
      expect.arrayContaining(['terrasse-du-fleuve', 'le-poisson-d-or']),
    );
    expect(searchRestaurants(ranking, 'liboke pizza')).toEqual([]);
  });

  it('met les noms devant', () => {
    const results = searchRestaurants(ranking, 'poisson');
    expect(results[0].restaurant.id).toBe('le-poisson-d-or');
    expect(results[0].match?.field).toBe('nom');
  });

  it('renvoie tout le classement quand la recherche est vide', () => {
    expect(searchRestaurants(ranking, '   ')).toHaveLength(ranking.length);
  });
});

describe('filtres', () => {
  const all = searchRestaurants(ranking, '');
  const noon = new Date(2026, 10, 27, 12, 0);

  it('filtre par commune, prix et équipement', () => {
    const out = applyFilters(all, { ...EMPTY_FILTERS, commune: 'Gombe', maxPrice: 2 }, noon);
    expect(out.every((r) => r.restaurant.commune === 'Gombe' && r.restaurant.priceLevel <= 2)).toBe(true);
    const terrasse = applyFilters(all, { ...EMPTY_FILTERS, amenities: ['terrasse'] }, noon);
    expect(terrasse.every((r) => r.restaurant.amenities.includes('terrasse'))).toBe(true);
  });

  it('trie par distance pour « Près de moi »', () => {
    const out = applyFilters(all, { ...EMPTY_FILTERS, near: true }, noon);
    const d = out.map((r) => r.restaurant.distanceKm);
    expect(d).toEqual([...d].sort((a, b) => a - b));
    expect(d.every((km) => km <= 3)).toBe(true);
  });

  it('compte les filtres actifs', () => {
    expect(activeFilterCount(EMPTY_FILTERS)).toBe(0);
    expect(activeFilterCount({ ...EMPTY_FILTERS, openNow: true, amenities: ['wifi', 'terrasse'], sort: 'distance' })).toBe(3);
  });
});
