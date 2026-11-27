import { useMemo, useState } from 'react';
import { Pressable, Text as RNText, View, type LayoutChangeEvent } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Svg, { Path, Rect, Text as SvgText } from 'react-native-svg';

import { Icon } from '@/components/ui/icon';
import { Button, Chip, Text, Thumbnail, cx } from '@/components/ui/primitives';
import { useRanking } from '@/data/store';
import type { RankedRestaurant } from '@/data/types';
import { formatDistance, formatOpening, formatScore, isOpenAt } from '@/lib/format';
import { DEFAULT_USER_POSITION, driveMinutes } from '@/lib/geo';
import { openDirections } from '@/lib/links';
import { router } from 'expo-router';
import { colors } from '@/theme/colors';

const KM_PER_DEGREE = 111;

/**
 * Carte simplifiée : fond dessiné et repères placés selon leurs vraies coordonnées.
 * Elle sera remplacée par une vraie carte (react-native-maps) en phase 5,
 * qui demande un build de développement.
 */
function MapBackground({ width, height }: { width: number; height: number }) {
  return (
    <Svg width={width} height={height} style={{ position: 'absolute', left: 0, top: 0 }}>
      <Rect width={width} height={height} fill={colors.carteSol} />
      <Path
        d={`M-20 ${height * 0.18} C ${width * 0.23} ${height * 0.14}, ${width * 0.41} ${height * 0.23}, ${width * 0.67} ${height * 0.17} S ${width} ${height * 0.11}, ${width + 30} ${height * 0.14} L ${width + 30} 0 L -20 0 Z`}
        fill={colors.carteEau}
      />
      <Path d={`M-10 ${height * 0.39} L ${width + 10} ${height * 0.3}`} stroke={colors.surface} strokeWidth={14} />
      <Path d={`M${width * 0.15} ${height * 0.21} L ${width * 0.36} ${height + 20}`} stroke={colors.surface} strokeWidth={10} />
      <Path d={`M${width * 0.64} ${height * 0.19} L ${width * 0.77} ${height + 20}`} stroke={colors.surface} strokeWidth={10} />
      <Path d={`M-10 ${height * 0.66} L ${width + 10} ${height * 0.59}`} stroke={colors.surface} strokeWidth={8} />
      <Rect x={width * 0.41} y={height * 0.45} width={70} height={60} rx={6} fill={colors.carteParc} />
      <SvgText x={40} y={height * 0.12} fontSize={12} fill="#4A6672" fontStyle="italic">
        Fleuve Congo
      </SvgText>
      <SvgText x={20} y={height * 0.56} fontSize={13} fill={colors.texteSecondaire} fontWeight="700" letterSpacing={2}>
        GOMBE
      </SvgText>
    </Svg>
  );
}

export default function Carte() {
  const insets = useSafeAreaInsets();
  const ranking = useRanking();
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [radius, setRadius] = useState(3);
  const [minScore, setMinScore] = useState<number | null>(null);
  const [openOnly, setOpenOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const now = new Date();

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

  const selected: RankedRestaurant | undefined =
    visible.find((r) => r.id === selectedId) ?? [...visible].sort((a, b) => a.cityRank - b.cityRank)[0];
  const bestCityRank = ranking?.[0]?.id;

  // Projection simple autour de la position de l'utilisateur
  const center = { x: size.width / 2, y: size.height * 0.55 };
  // Échelle ajustée pour que tous les repères visibles tiennent à l'écran
  const farthest = Math.max(0.6, ...visible.map((r) => r.distanceKm));
  const pxPerKm = (Math.min(size.width, size.height) / 2 - 40) / farthest;
  const project = (r: RankedRestaurant) => ({
    x: center.x + (r.longitude - DEFAULT_USER_POSITION.longitude) * KM_PER_DEGREE * pxPerKm,
    y: center.y - (r.latitude - DEFAULT_USER_POSITION.latitude) * KM_PER_DEGREE * pxPerKm,
  });

  const onLayout = (e: LayoutChangeEvent) => {
    const { width, height } = e.nativeEvent.layout;
    setSize({ width, height });
  };

  return (
    <View className="flex-1 bg-carte-sol">
      <View className="flex-1" onLayout={onLayout}>
        {size.width > 0 ? <MapBackground width={size.width} height={size.height} /> : null}

        {size.width > 0
          ? visible.map((r) => {
              const p = project(r);
              const isBest = r.id === bestCityRank;
              const isSelected = r.id === selected?.id;
              return (
                <Pressable
                  key={r.id}
                  accessibilityRole="button"
                  accessibilityLabel={`${r.name}, ${formatScore(r.score.total)}`}
                  onPress={() => setSelectedId(r.id)}
                  style={{ position: 'absolute', left: p.x - 24, top: p.y - 16 }}
                  className={cx(
                    'h-8 min-w-12 flex-row items-center justify-center rounded-full border-2 border-surface px-[10px]',
                    isBest ? 'bg-safran' : r.score.total >= 8 ? 'bg-vert-radar' : 'bg-surface',
                    isSelected && 'scale-110',
                  )}>
                  <RNText
                    className={cx(
                      'font-chiffres text-[13px]',
                      isBest ? 'text-sur-safran' : r.score.total >= 8 ? 'text-sur-vert' : 'text-encre',
                    )}>
                    {isBest ? `N°1 · ${formatScore(r.score.total)}` : formatScore(r.score.total)}
                  </RNText>
                </Pressable>
              );
            })
          : null}

        {size.width > 0 ? (
          <View
            accessibilityLabel="Ma position"
            style={{ position: 'absolute', left: center.x - 22, top: center.y - 22 }}
            className="h-11 w-11 items-center justify-center rounded-full bg-vert-radar/20">
            <View className="h-4 w-4 rounded-full border-[3px] border-surface bg-vert-radar" />
          </View>
        ) : null}

        <View className="absolute left-4 right-4 gap-[10px]" style={{ top: insets.top + 12 }}>
          <View className="flex-row gap-2">
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Rechercher sur la carte"
              onPress={() => router.navigate('/classement')}
              className="h-12 flex-1 flex-row items-center gap-[10px] rounded-m bg-surface px-[14px] shadow-sm">
              <Icon name="search" size={18} color={colors.texteSecondaire} />
              <RNText className="font-texte text-[15px] text-texte-secondaire">Chercher sur la carte</RNText>
            </Pressable>
          </View>
          <View className="flex-row gap-2">
            <Chip
              tone="carte"
              label={`Rayon ${radius} km`}
              active
              onPress={() => setRadius(radius === 3 ? 5 : radius === 5 ? 10 : 3)}
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
          accessibilityLabel="Recentrer sur ma position"
          onPress={() => setSelectedId(null)}
          className="absolute bottom-4 right-4 h-12 w-12 items-center justify-center rounded-full bg-surface shadow-sm">
          <Icon name="locate" size={22} color={colors.vertRadar} />
        </Pressable>
      </View>

      <View className="rounded-t-[20px] bg-surface px-5 pb-4 pt-[10px] shadow-md">
        <View className="mx-auto mb-3 h-1 w-10 rounded-full bg-bordure" />
        <Text variant="legende" className="text-texte-secondaire">
          {visible.length} restaurant{visible.length > 1 ? 's' : ''} à moins de {radius} km
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
              <RNText className="font-chiffres text-[20px] text-vert-radar">
                {formatScore(selected.score.total)}
              </RNText>
            </Pressable>
            <Button
              label="Itinéraire"
              icon="navigate"
              size="m"
              className="mt-[14px]"
              onPress={() => openDirections(selected)}
            />
          </>
        ) : (
          <Text className="mt-3 text-texte-secondaire">Élargissez le rayon ou retirez un filtre.</Text>
        )}
      </View>
    </View>
  );
}
