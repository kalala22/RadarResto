/**
 * Position de l'utilisateur, au premier plan seulement (jamais en arrière-plan).
 * Sans permission, ou hors de Kinshasa, l'app calcule les distances depuis la Gombe.
 */
import * as Location from 'expo-location';

import { DEFAULT_USER_POSITION, distanceKm, type LatLng } from './geo';

/**
 * - `inconnu` : on n'a pas encore demandé.
 * - `accordee` : position disponible.
 * - `refusee` : refusée, on peut redemander.
 * - `bloquee` : refusée définitivement, il faut passer par les réglages du téléphone.
 * - `desactivee` : l'utilisateur a coupé la position dans les paramètres de l'app.
 */
export type LocationStatus = 'inconnu' | 'accordee' | 'refusee' | 'bloquee' | 'desactivee';

/** Au-delà de cette distance de la Gombe, on considère que l'utilisateur n'est pas à Kinshasa. */
export const KINSHASA_RADIUS_KM = 40;

export function isInKinshasa(p: LatLng): boolean {
  return distanceKm(DEFAULT_USER_POSITION, p) <= KINSHASA_RADIUS_KM;
}

function statusOf(res: Location.LocationPermissionResponse): LocationStatus {
  if (res.granted) return 'accordee';
  if (res.status === Location.PermissionStatus.UNDETERMINED) return 'inconnu';
  return res.canAskAgain ? 'refusee' : 'bloquee';
}

/** Lit l'état de la permission sans afficher la demande du système. */
export async function readPermission(): Promise<LocationStatus> {
  try {
    return statusOf(await Location.getForegroundPermissionsAsync());
  } catch {
    return 'inconnu';
  }
}

/** Affiche la demande du système. À n'appeler qu'après avoir expliqué pourquoi. */
export async function askPermission(): Promise<LocationStatus> {
  try {
    return statusOf(await Location.requestForegroundPermissionsAsync());
  } catch {
    return 'refusee';
  }
}

/** Position actuelle : la dernière connue si elle est récente, sinon une nouvelle mesure. */
export async function readPosition(): Promise<LatLng | null> {
  try {
    const last = await Location.getLastKnownPositionAsync({ maxAge: 5 * 60 * 1000 });
    const fix = last ?? (await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced }));
    return { latitude: fix.coords.latitude, longitude: fix.coords.longitude };
  } catch {
    return null;
  }
}
