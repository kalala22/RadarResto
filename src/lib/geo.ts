export type LatLng = { latitude: number; longitude: number };

/**
 * Position simulée de l'utilisateur (Gombe), en attendant expo-location.
 * La vraie position sera branchée avec la carte (phase 5).
 */
export const DEFAULT_USER_POSITION: LatLng = { latitude: -4.3065, longitude: 15.3045 };

/** Distance à vol d'oiseau en km (formule de haversine). */
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(b.latitude - a.latitude);
  const dLon = toRad(b.longitude - a.longitude);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.latitude)) * Math.cos(toRad(b.latitude)) * Math.sin(dLon / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Temps de trajet approximatif en voiture dans Kinshasa (≈ 8 km/h de moyenne en ville + 3 min). */
export function driveMinutes(km: number): number {
  return Math.max(3, Math.round(km * 7.5 + 3));
}
