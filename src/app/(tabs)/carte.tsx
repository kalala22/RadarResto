import { router } from 'expo-router';
import { useMemo, useRef, useState } from 'react';
import { Pressable, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DirectionsSheet } from '@/components/directions-sheet';
import { LocationPrompt } from '@/components/location-prompt';
import { RestaurantMap } from '@/components/map/restaurant-map';
import type { RestaurantMapHandle } from '@/components/map/types';
import { Icon } from '@/components/ui/icon';
import { Button, Chip, Text, Thumbnail } from '@/components/ui/primitives';
import { useApp, useRanking } from '@/data/store';
import { formatDistance, formatOpening, formatScore, isOpenAt } from '@/lib/format';
import { driveMinutes } from '@/lib/geo';
import { colors } from '@/theme/colors';

const RADII = [3, 5, 10];

export default function Carte() {
  const insets = useSafeAreaInsets();
  const ranking = useRanking();
  const { userPosition, location, requestLocation } = useApp();
  const mapRef = useRef<RestaurantMapHandle>(null);
  const [radius, setRadius] = useState(3);
  const [minScore, setMinScore] = useState<number | null>(null);
  const [openOnly, setOpenOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [directionsOpen, setDirectionsOpen] = useState(false);
  const now = new Date();
  const located = location.status === 'accordee' && !location.outsideKinshasa;

  const visible = useMemo(
    () =>
      (ranking ?? []).filter(
        (r) =>
          r.distanceKm <= radius &&
          (minScore === null || r.score.total >= minScore) &&
          (!openOnly || isOpenAt(r.hours, now)),
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ranking, radius, minScore, openOnly],
  );

  // Sans choix, le panneau montre le mieux classé du rayon.
  const selected = visible.find((r) => r.id === selectedId) ?? [...visible].sort((a, b) => a.cityRank - b.cityRank)[0];
  const bestId = ranking?.[0]?.id;

  const recenter = async () => {
    setSelectedId(null);
    // La permission n'est demandée qu'ici ou depuis l'encart explicatif, jamais au lancement.
    if (location.status === 'inconnu' || location.status === 'refusee') await requestLocation();
    mapRef.current?.recenter();
  };

  return (
    <View className="flex-1 bg-carte-sol">
      <View className="flex-1">
        <RestaurantMap
          ref={mapRef}
          restaurants={visible}
          center={userPosition}
          radiusKm={radius}
          selectedId={selected?.id ?? null}
          bestId={bestId}
          showsUserLocation={located}
          onSelect={setSelectedId}
        />

        <View className="absolute left-4 right-4 gap-[10px]" style={{ top: insets.top + 12 }}>
          <Pressable
            accessibilityRole="search"
            accessibilityLabel="Rechercher un restaurant"
            onPress={() => router.navigate({ pathname: '/classement', params: { recherche: '1' } })}
            className="h-12 flex-row items-center gap-[10px] rounded-m bg-surface px-[14px] shadow-sm">
            <Icon name="search" size={18} color={colors.texteSecondaire} />
            <RNText className="font-texte text-[15px] text-texte-secondaire">Restaurant, plat, quartier…</RNText>
          </Pressable>
          <View className="flex-row gap-2">
            <Chip
              tone="carte"
              label={`Rayon ${radius} km`}
              accessibilityLabel={`Rayon ${radius} km, toucher pour changer`}
              active
              onPress={() => setRadius(RADII[(RADII.indexOf(radius) + 1) % RADII.length])}
            />
            <Chip
              tone="carte"
              label="Cote 8+"
              active={minScore !== null}
              onPress={() => setMinScore(minScore === null ? 8 : null)}
            />
            <Chip tone="carte" label="Ouvert" active={openOnly} onPress={() => setOpenOnly(!openOnly)} />
          </View>
        </View>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={located ? 'Recentrer sur ma position' : 'Me localiser'}
          onPress={recenter}
          className="absolute bottom-4 right-4 h-12 w-12 items-center justify-center rounded-full bg-surface shadow-sm">
          <Icon name="locate" size={22} color={colors.vertRadar} />
        </Pressable>
      </View>

      <View className="rounded-t-[20px] bg-surface px-5 pb-4 pt-[10px] shadow-md">
        <View className="mx-auto mb-3 h-1 w-10 rounded-full bg-bordure" />
        <LocationPrompt compact className="mb-3" />
        <Text variant="legende" className="text-texte-secondaire">
          {visible.length} restaurant{visible.length > 1 ? 's' : ''} à moins de {radius} km
          {located ? '' : ' de la Gombe'}
        </Text>
        {selected ? (
          <>
            <Pressable
              accessibilityRole="link"
              onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: selected.id } })}
              className="mt-[10px] flex-row items-center gap-3">
              <Thumbnail name={selected.name} size={64} />
              <View className="min-w-0 flex-1">
                <RNText className="font-chiffres text-surtitre text-safran-texte">
                  N° {selected.cityRank} DE LA VILLE
                </RNText>
                <Text className="font-texte-bold text-[17px]" numberOfLines={1}>
                  {selected.name}
                </Text>
                <Text variant="legende" className="text-texte-secondaire" numberOfLines={1}>
                  {formatDistance(selected.distanceKm)} · {driveMinutes(selected.distanceKm)} min en voiture ·{' '}
                  {formatOpening(selected.hours, now)}
                </Text>
              </View>
              <RNText className="font-chiffres text-[20px] text-vert-radar">{formatScore(selected.score.total)}</RNText>
            </Pressable>
            <Button
              label="Itinéraire"
              icon="navigate"
              size="m"
              className="mt-[14px]"
              onPress={() => setDirectionsOpen(true)}
            />
            <DirectionsSheet restaurant={selected} open={directionsOpen} onClose={() => setDirectionsOpen(false)} />
          </>
        ) : (
          <Text className="mt-3 text-texte-secondaire">Élargissez le rayon ou retirez un filtre.</Text>
        )}
      </View>
    </View>
  );
}
