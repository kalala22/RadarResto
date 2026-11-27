import type { Ref } from 'react';

import type { RankedRestaurant } from '@/data/types';
import type { LatLng } from '@/lib/geo';

export type RestaurantMapHandle = {
  /** Revient sur la position de départ avec le rayon choisi. */
  recenter: () => void;
};

export type RestaurantMapProps = {
  restaurants: RankedRestaurant[];
  /** Position de l'utilisateur (ou la Gombe), centre du rayon. */
  center: LatLng;
  radiusKm: number;
  selectedId: string | null;
  /** N° 1 de la ville : seul repère en safran. */
  bestId?: string;
  /** Vrai quand la vraie position est connue : le point bleu du système est affiché. */
  showsUserLocation: boolean;
  onSelect: (id: string) => void;
  ref?: Ref<RestaurantMapHandle>;
};

/** Région qui montre tout le rayon autour du centre, avec un peu de marge. */
export function regionFor(center: LatLng, radiusKm: number) {
  const latitudeDelta = (radiusKm * 2.4) / 111;
  const longitudeDelta = latitudeDelta / Math.cos((center.latitude * Math.PI) / 180);
  return { ...center, latitudeDelta, longitudeDelta };
}
