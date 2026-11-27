/** Composants liés aux restaurants : encart du N° 1, ligne de classement, barre de critère, étoiles. */
import { router } from 'expo-router';
import { Pressable, Text as RNText, View } from 'react-native';

import type { RankedRestaurant } from '@/data/types';
import { formatDistance, formatPriceLevel, formatScore } from '@/lib/format';
import { colors } from '@/theme/colors';

import { Icon } from './ui/icon';
import { ScoreBadge, Text, Thumbnail } from './ui/primitives';

const openRestaurant = (id: string) => router.push({ pathname: '/restaurant/[id]', params: { id } });

/** Encart du N° 1 : fond nuit et pastille safran (le seul safran de l'écran). */
export function TopCard({
  restaurant,
  label,
  hint,
  onOpen,
}: {
  restaurant: RankedRestaurant;
  label: string;
  hint?: string;
  onOpen?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${label}, ${restaurant.name}, cote ${formatScore(restaurant.score.total)}`}
      onPress={() => {
        onOpen?.();
        openRestaurant(restaurant.id);
      }}
      className="flex-row items-center gap-[14px] rounded-l bg-nuit p-4 active:opacity-90">
      <Thumbnail name={restaurant.name} size={76} dark />
      <View className="min-w-0 flex-1">
        <RNText className="font-chiffres text-surtitre text-safran">{label}</RNText>
        <RNText className="font-titre text-titre-2 text-surface" numberOfLines={2}>
          {restaurant.name}
        </RNText>
        <RNText className="mt-[2px] font-texte text-legende text-texte-sur-nuit">
          {restaurant.cuisine} · {formatPriceLevel(restaurant.priceLevel)} · {formatDistance(restaurant.distanceKm)}
        </RNText>
        {hint ? (
          <RNText className="mt-[2px] font-texte-semi text-legende text-menthe" numberOfLines={1}>
            {hint}
          </RNText>
        ) : null}
      </View>
      <ScoreBadge value={restaurant.score.total} safran />
    </Pressable>
  );
}

/** Ligne du classement : rang, vignette, nom, méta, cote en vert. */
export function RestaurantRow({
  restaurant,
  rank,
  meta,
  hint,
  onOpen,
}: {
  restaurant: RankedRestaurant;
  rank?: number;
  meta?: string;
  /** Pourquoi ce résultat de recherche correspond (« Plat : Liboke de poisson »). */
  hint?: string;
  onOpen?: () => void;
}) {
  return (
    <Pressable
      accessibilityRole="link"
      accessibilityLabel={`${rank ? `N° ${rank}, ` : ''}${restaurant.name}, cote ${formatScore(restaurant.score.total)}`}
      onPress={() => {
        onOpen?.();
        openRestaurant(restaurant.id);
      }}
      className="flex-row items-center gap-3 border-b border-bordure py-[11px] active:opacity-70">
      {rank !== undefined ? (
        <RNText className="w-[22px] font-chiffres text-[15px] text-texte-secondaire">{rank}</RNText>
      ) : null}
      <Thumbnail name={restaurant.name} size={48} />
      <View className="min-w-0 flex-1">
        <Text variant="corps-bold" numberOfLines={1}>
          {restaurant.name}
        </Text>
        <Text variant="legende" className="text-texte-secondaire" numberOfLines={1}>
          {meta ??
            `${restaurant.cuisine} · ${restaurant.commune} · ${formatDistance(restaurant.distanceKm)}`}
        </Text>
        {hint ? (
          <Text variant="legende" className="text-vert-profond" numberOfLines={1}>
            {hint}
          </Text>
        ) : null}
      </View>
      <RNText className="font-chiffres text-[16px] text-vert-radar">{formatScore(restaurant.score.total)}</RNText>
    </Pressable>
  );
}

/** Barre horizontale d'un critère, note sur 10. */
export function CriteriaBar({ label, value }: { label: string; value: number }) {
  return (
    <View
      className="flex-row items-center gap-[10px]"
      accessible
      accessibilityLabel={`${label} : ${formatScore(value)} sur 10`}>
      <Text className="w-[110px] text-[14px]">{label}</Text>
      <View className="h-2 flex-1 overflow-hidden rounded-full bg-bordure">
        <View className="h-2 rounded-full bg-vert-radar" style={{ width: `${Math.min(100, value * 10)}%` }} />
      </View>
      <RNText className="w-[30px] text-right font-chiffres text-[14px] text-encre">{formatScore(value)}</RNText>
    </View>
  );
}

/** Rangée d'étoiles cliquables (note sur 5). */
export function StarRating({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <View className="flex-row items-center justify-between">
      <Text className="font-texte-semi text-[15px]">{label}</Text>
      <View className="flex-row" accessibilityRole="radiogroup" accessibilityLabel={label}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable
            key={n}
            accessibilityRole="radio"
            accessibilityState={{ selected: n === value }}
            accessibilityLabel={`${label} : ${n} sur 5`}
            onPress={() => onChange(n)}
            className="h-11 w-10 items-center justify-center">
            <Icon name="star" size={28} color={n <= value ? colors.safran : colors.bordure} />
          </Pressable>
        ))}
      </View>
    </View>
  );
}

/** Note d'un avis : « 4,5/5 ». */
export function ReviewScore({ value }: { value: number }) {
  return (
    <RNText className="font-chiffres text-surtitre text-vert-radar">
      {formatScore(value).replace(',0', '')}/5
    </RNText>
  );
}
