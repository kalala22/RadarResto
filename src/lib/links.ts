import { Linking, Platform, Share } from 'react-native';

import type { RankedRestaurant, Restaurant } from '@/data/types';

import { formatScore } from './format';

type Place = Pick<Restaurant, 'latitude' | 'longitude' | 'name'>;

export type DirectionsApp = 'google' | 'waze' | 'apple';

/** Applications proposées pour l'itinéraire. Plans (Apple) seulement sur iPhone. */
export const DIRECTIONS_APPS: { id: DirectionsApp; label: string }[] = [
  { id: 'google', label: 'Google Maps' },
  { id: 'waze', label: 'Waze' },
  ...(Platform.OS === 'ios' ? [{ id: 'apple' as const, label: 'Plans' }] : []),
];

/**
 * Liens universels : ils ouvrent l'application si elle est installée, sinon le site.
 * Pas besoin de déclarer les schémas d'URL dans la configuration iOS.
 */
export function directionsUrl(r: Place, app: DirectionsApp): string {
  const dest = `${r.latitude},${r.longitude}`;
  switch (app) {
    case 'waze':
      return `https://waze.com/ul?ll=${dest}&navigate=yes`;
    case 'apple':
      return `https://maps.apple.com/?daddr=${dest}&q=${encodeURIComponent(r.name)}`;
    case 'google':
      return `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
  }
}

/** Ouvre l'itinéraire dans l'application de cartes choisie (par défaut celle du téléphone). */
export function openDirections(r: Place, app: DirectionsApp = Platform.OS === 'ios' ? 'apple' : 'google') {
  return Linking.openURL(directionsUrl(r, app)).catch(() => {});
}

export function callRestaurant(phone: string) {
  return Linking.openURL(`tel:${phone}`).catch(() => {});
}

export function shareMessage(r: RankedRestaurant): string {
  return (
    `${r.name} : N° ${r.cityRank} de Kinshasa sur Radar Resto Kin, cote ${formatScore(r.score.total)}/10. ` +
    `${r.cuisine} · ${r.address}, ${r.commune} (${r.landmark}).`
  );
}

export function shareRestaurant(r: RankedRestaurant) {
  return Share.share({ message: shareMessage(r), title: r.name }).catch(() => {});
}
