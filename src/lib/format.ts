import type { Currency, OpeningHours, PriceLevel } from '@/data/types';

/** 9.2 → « 9,2 » : une cote s'écrit toujours avec une virgule et une décimale. */
export function formatScore(value: number): string {
  return value.toFixed(1).replace('.', ',');
}

/** 0.83 → « 0,8 km », 12.4 → « 12 km ». */
export function formatDistance(km: number): string {
  if (km < 10) return `${km.toFixed(1).replace('.', ',')} km`;
  return `${Math.round(km)} km`;
}

/** Sépare les milliers avec une espace fine insécable : 45000 → « 45 000 ». */
function groupThousands(n: number): string {
  return Math.round(n)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

/** Fourchette de prix dans la devise du restaurant : « 25–40 $ » ou « 45 000–80 000 FC ». */
export function formatPriceRange(min: number, max: number, currency: Currency): string {
  const unit = currency === 'USD' ? '$' : 'FC';
  return `${groupThousands(min)}–${groupThousands(max)} ${unit}`;
}

export function formatPriceLevel(level: PriceLevel): string {
  return '$'.repeat(level);
}

function formatHour(h: number): string {
  const hour = h % 24;
  return `${hour} h`;
}

/** Ouvert à l'heure donnée ? Gère les fermetures après minuit (closes > 24). */
export function isOpenAt(hours: OpeningHours, date: Date): boolean {
  const h = date.getHours() + date.getMinutes() / 60;
  if (h >= hours.opens && h < hours.closes) return true;
  // Après minuit pour un restaurant qui ferme tard
  return hours.closes > 24 && h + 24 < hours.closes;
}

export function formatOpening(hours: OpeningHours, date: Date): string {
  return isOpenAt(hours, date)
    ? `Ouvert jusqu’à ${formatHour(hours.closes)}`
    : `Fermé · ouvre à ${formatHour(hours.opens)}`;
}

/** « 11 h – 23 h », ou « 16 h – 2 h » pour une fermeture après minuit. */
export function formatHours(hours: OpeningHours): string {
  return `${formatHour(hours.opens)} – ${formatHour(hours.closes)}`;
}

const MONTHS = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
];

/** « Novembre 2026 » */
export function formatMonth(date: Date): string {
  const m = MONTHS[date.getMonth()];
  return `${m.charAt(0).toUpperCase()}${m.slice(1)} ${date.getFullYear()}`;
}

/** « il y a 3 jours », « il y a 2 semaines » */
export function formatRelative(iso: string, now: Date): string {
  const diffMs = now.getTime() - new Date(iso).getTime();
  const minutes = Math.max(0, Math.round(diffMs / 60000));
  if (minutes < 60) return minutes <= 1 ? 'à l’instant' : `il y a ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `il y a ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 7) return days === 1 ? 'hier' : `il y a ${days} jours`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return weeks === 1 ? 'il y a 1 semaine' : `il y a ${weeks} semaines`;
  const months = Math.round(days / 30);
  return months <= 1 ? 'il y a 1 mois' : `il y a ${months} mois`;
}

/** « Bonjour » avant 18 h, « Bonsoir » ensuite. */
export function greeting(date: Date): string {
  return date.getHours() < 18 ? 'Bonjour' : 'Bonsoir';
}

/** +243810000012 → « +243 81 000 00 12 » ; masque optionnel des chiffres du milieu. */
export function formatPhone(e164: string, masked = false): string {
  const local = e164.replace(/^\+243/, '');
  if (local.length !== 9) return e164;
  const parts = [local.slice(0, 2), local.slice(2, 5), local.slice(5, 7), local.slice(7, 9)];
  if (masked) return `+243 ${parts[0]} ••• •• ${parts[3]}`;
  return `+243 ${parts.join(' ')}`;
}

/** Normalise une saisie « 81 234 5678 » en « +243812345678 », ou null si invalide. */
export function normalizePhone(input: string): string | null {
  const digits = input.replace(/\D/g, '').replace(/^243/, '').replace(/^0/, '');
  return digits.length === 9 ? `+243${digits}` : null;
}

/** Initiales pour les vignettes : « Maison Mboka » → « MM ». */
export function initials(name: string): string {
  return name
    .replace(/^(Le|La|Les|L’|Chez)\s+/i, '')
    .split(/[\s&’'-]+/)
    .filter((w) => w.length > 0 && w[0] === w[0].toUpperCase())
    .slice(0, 2)
    .map((w) => w[0])
    .join('');
}
