import { describe, expect, it } from '@jest/globals';

import {
  formatDistance,
  formatPhone,
  formatPriceRange,
  formatScore,
  initials,
  isOpenAt,
  normalizePhone,
} from '../format';

describe('format', () => {
  it('écrit les cotes avec une virgule', () => {
    expect(formatScore(9.2)).toBe('9,2');
    expect(formatScore(8)).toBe('8,0');
  });

  it('affiche les prix dans la devise du restaurant', () => {
    expect(formatPriceRange(25, 40, 'USD')).toBe('25–40 $');
    expect(formatPriceRange(45000, 80000, 'CDF')).toBe('45 000–80 000 FC');
  });

  it('formate les distances', () => {
    expect(formatDistance(0.83)).toBe('0,8 km');
    expect(formatDistance(12.4)).toBe('12 km');
  });

  it('normalise et masque les numéros congolais', () => {
    expect(normalizePhone('81 234 5678')).toBe('+243812345678');
    expect(normalizePhone('0812345678')).toBe('+243812345678');
    expect(normalizePhone('+243 81 234 5678')).toBe('+243812345678');
    expect(normalizePhone('1234')).toBeNull();
    expect(formatPhone('+243812345678', true)).toBe('+243 81 ••• •• 78');
  });

  it('gère les fermetures après minuit', () => {
    const hours = { opens: 16, closes: 26 };
    expect(isOpenAt(hours, new Date(2026, 10, 27, 23, 0))).toBe(true);
    expect(isOpenAt(hours, new Date(2026, 10, 27, 1, 30))).toBe(true);
    expect(isOpenAt(hours, new Date(2026, 10, 27, 3, 0))).toBe(false);
    expect(isOpenAt(hours, new Date(2026, 10, 27, 12, 0))).toBe(false);
  });

  it('tire les initiales du nom', () => {
    expect(initials('Maison Mboka')).toBe('MM');
    expect(initials('La Terrasse du Fleuve')).toBe('TF');
    expect(initials('Cèdre & Braise')).toBe('CB');
  });
});
