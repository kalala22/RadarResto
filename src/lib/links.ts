import { Linking, Platform } from 'react-native';

import type { Restaurant } from '@/data/types';

/** Ouvre l'itinéraire dans l'application de cartes du téléphone. */
export function openDirections(r: Pick<Restaurant, 'latitude' | 'longitude' | 'name'>) {
  const dest = `${r.latitude},${r.longitude}`;
  const url =
    Platform.OS === 'ios'
      ? `http://maps.apple.com/?daddr=${dest}&q=${encodeURIComponent(r.name)}`
      : `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
  return Linking.openURL(url);
}

export function callRestaurant(phone: string) {
  return Linking.openURL(`tel:${phone}`);
}
