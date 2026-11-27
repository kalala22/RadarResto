import { Text as RNText, View } from 'react-native';

import { cx } from '@/components/ui/primitives';
import type { RankedRestaurant } from '@/data/types';
import { formatScore } from '@/lib/format';

/** Repère de la carte : la cote, en vert à partir de 8, en safran pour le N° 1. */
export function ScorePin({
  restaurant,
  best,
  selected,
}: {
  restaurant: RankedRestaurant;
  best: boolean;
  selected: boolean;
}) {
  const strong = restaurant.score.total >= 8;
  return (
    <View
      className={cx(
        'h-8 min-w-12 flex-row items-center justify-center rounded-full border-2 px-[10px]',
        selected ? 'border-nuit' : 'border-surface',
        best ? 'bg-safran' : strong ? 'bg-vert-radar' : 'bg-surface',
      )}
      style={selected ? { transform: [{ scale: 1.12 }] } : undefined}>
      <RNText
        className={cx('font-chiffres text-[13px]', best ? 'text-sur-safran' : strong ? 'text-sur-vert' : 'text-encre')}>
        {best ? `N°1 · ${formatScore(restaurant.score.total)}` : formatScore(restaurant.score.total)}
      </RNText>
    </View>
  );
}

/** Ma position quand le point du système n'est pas affiché (position par défaut). */
export function UserDot() {
  return (
    <View className="h-11 w-11 items-center justify-center rounded-full bg-vert-radar/20">
      <View className="h-4 w-4 rounded-full border-[3px] border-surface bg-vert-radar" />
    </View>
  );
}
