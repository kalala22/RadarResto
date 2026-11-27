import { useEffect, useImperativeHandle, useRef, useState } from 'react';
import { Platform } from 'react-native';
import MapView, { Circle, Marker, PROVIDER_GOOGLE, type MapStyleElement } from 'react-native-maps';

import { formatScore } from '@/lib/format';
import { colors } from '@/theme/colors';

import { ScorePin, UserDot } from './score-pin';
import { regionFor, type RestaurantMapProps } from './types';

/** Carte calme : on retire les commerces et les arrêts pour que les cotes ressortent. */
const MAP_STYLE: MapStyleElement[] = [
  { featureType: 'poi.business', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
  { featureType: 'poi', elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
];

/**
 * Vraie carte (Google Maps sur Android, Plans sur iPhone) avec react-native-maps.
 * La version web est dans restaurant-map.web.tsx.
 */
export function RestaurantMap({
  ref,
  restaurants,
  center,
  radiusKm,
  selectedId,
  bestId,
  showsUserLocation,
  onSelect,
}: RestaurantMapProps) {
  const mapRef = useRef<MapView>(null);

  // Les repères sont des vues React : on les laisse se dessiner, puis on fige leur image (plus fluide).
  const [tracking, setTracking] = useState(true);
  const [drawn, setDrawn] = useState({ restaurants, selectedId });
  if (drawn.restaurants !== restaurants || drawn.selectedId !== selectedId) {
    setDrawn({ restaurants, selectedId });
    setTracking(true);
  }
  useEffect(() => {
    if (!tracking) return;
    const t = setTimeout(() => setTracking(false), 600);
    return () => clearTimeout(t);
  }, [tracking, restaurants, selectedId]);

  useImperativeHandle(
    ref,
    () => ({ recenter: () => mapRef.current?.animateToRegion(regionFor(center, radiusKm), 400) }),
    [center, radiusKm],
  );

  // Suit les changements de position ou de rayon.
  useEffect(() => {
    mapRef.current?.animateToRegion(regionFor(center, radiusKm), 400);
  }, [center, radiusKm]);

  return (
    <MapView
      ref={mapRef}
      style={{ flex: 1 }}
      provider={Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined}
      initialRegion={regionFor(center, radiusKm)}
      customMapStyle={MAP_STYLE}
      showsUserLocation={showsUserLocation}
      showsMyLocationButton={false}
      showsPointsOfInterests={false}
      showsCompass={false}
      toolbarEnabled={false}
      rotateEnabled={false}
      pitchEnabled={false}>
      <Circle
        center={center}
        radius={radiusKm * 1000}
        strokeColor={colors.vertRadar}
        strokeWidth={1.5}
        fillColor="rgba(31, 122, 77, 0.06)"
      />
      {showsUserLocation ? null : (
        <Marker coordinate={center} anchor={{ x: 0.5, y: 0.5 }} tracksViewChanges={false} accessibilityLabel="Ma position">
          <UserDot />
        </Marker>
      )}
      {restaurants.map((r) => (
        <Marker
          key={r.id}
          identifier={r.id}
          coordinate={{ latitude: r.latitude, longitude: r.longitude }}
          anchor={{ x: 0.5, y: 0.5 }}
          zIndex={r.id === selectedId ? 3 : r.id === bestId ? 2 : 1}
          tracksViewChanges={tracking}
          accessibilityLabel={`${r.name}, ${formatScore(r.score.total)}`}
          onPress={() => onSelect(r.id)}>
          <ScorePin restaurant={r} best={r.id === bestId} selected={r.id === selectedId} />
        </Marker>
      ))}
    </MapView>
  );
}
