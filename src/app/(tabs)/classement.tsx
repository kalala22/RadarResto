import { useMemo, useState } from 'react';
import { FlatList, ScrollView, Text as RNText, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/logo';
import { RestaurantRow, TopCard } from '@/components/restaurant';
import { Icon } from '@/components/ui/icon';
import { Chip, IconButton, Text } from '@/components/ui/primitives';
import { useApp, useRanking } from '@/data/store';
import type { RankedRestaurant } from '@/data/types';
import { formatMonth, greeting, isOpenAt } from '@/lib/format';
import { colors } from '@/theme/colors';

type Filter = 'proche' | 'gombe' | 'ngaliema' | 'ouvert' | 'budget' | 'terrasse';

const FILTERS: { id: Filter; label: string }[] = [
  { id: 'proche', label: 'Près de moi' },
  { id: 'gombe', label: 'Gombe' },
  { id: 'ngaliema', label: 'Ngaliema' },
  { id: 'ouvert', label: 'Ouvert' },
  { id: 'budget', label: '$$' },
  { id: 'terrasse', label: 'Terrasse' },
];

function normalize(s: string) {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '');
}

function applyFilters(list: RankedRestaurant[], active: Set<Filter>, query: string, now: Date) {
  const q = normalize(query.trim());
  let out = list.filter((r) => {
    if (q && !normalize(`${r.name} ${r.cuisine} ${r.commune}`).includes(q)) return false;
    if (active.has('gombe') && r.commune !== 'Gombe') return false;
    if (active.has('ngaliema') && r.commune !== 'Ngaliema') return false;
    if (active.has('ouvert') && !isOpenAt(r.hours, now)) return false;
    if (active.has('budget') && r.priceLevel > 2) return false;
    if (active.has('terrasse') && !r.amenities.includes('terrasse')) return false;
    if (active.has('proche') && r.distanceKm > 3) return false;
    return true;
  });
  if (active.has('proche')) out = [...out].sort((a, b) => a.distanceKm - b.distanceKm);
  return out;
}

export default function Classement() {
  const insets = useSafeAreaInsets();
  const ranking = useRanking();
  const { profile } = useApp();
  const [active, setActive] = useState<Set<Filter>>(new Set());
  const [query, setQuery] = useState('');
  const now = new Date();

  const toggle = (f: Filter) =>
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(f)) next.delete(f);
      else {
        next.add(f);
        // Une seule commune à la fois
        if (f === 'gombe') next.delete('ngaliema');
        if (f === 'ngaliema') next.delete('gombe');
      }
      return next;
    });

  const results = useMemo(
    () => (ranking ? applyFilters(ranking, active, query, now) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ranking, active, query],
  );
  const filtered = active.size > 0 || query.trim().length > 0;
  const [top, ...rest] = results;
  const sortedByDistance = active.has('proche');

  const header = (
    <View>
      <View className="gap-[14px] bg-nuit px-5 pb-[22px]" style={{ paddingTop: insets.top + 12 }}>
        <View className="flex-row items-center justify-between">
          <Logo height={34} variant="sombre" />
          <IconButton icon="bell" label="Notifications" tone="sombre" />
        </View>
        <View>
          <RNText className="font-texte text-[14px] text-texte-sur-nuit">
            {greeting(now)} · {profile?.commune ?? 'Gombe'}, Kinshasa
          </RNText>
          <Text variant="titre-1" className="mt-[2px] text-surface">
            Où bien manger {now.getHours() < 16 ? 'aujourd’hui' : 'ce soir'} ?
          </Text>
        </View>
        <View className="h-12 flex-row items-center gap-[10px] rounded-m bg-surface px-[14px]">
          <Icon name="search" size={18} color={colors.texteSecondaire} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Restaurant, plat, quartier…"
            placeholderTextColor={colors.texteSecondaire}
            accessibilityLabel="Rechercher"
            returnKeyType="search"
            className="flex-1 font-texte text-[15px] text-encre"
          />
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerClassName="gap-2 px-5 pb-1 pt-[14px]">
        {FILTERS.map((f) => (
          <Chip key={f.id} label={f.label} active={active.has(f.id)} onPress={() => toggle(f.id)} />
        ))}
      </ScrollView>

      <View className="flex-row items-baseline justify-between px-5 pt-[14px]">
        <Text variant="titre-2">{filtered ? `${results.length} résultat${results.length > 1 ? 's' : ''}` : 'Top de la ville'}</Text>
        <Text variant="legende" className="text-texte-secondaire">
          {formatMonth(now)}
        </Text>
      </View>

      {top ? (
        <View className="px-5 pt-[10px]">
          <TopCard
            restaurant={top}
            label={
              sortedByDistance
                ? `LE PLUS PROCHE · N° ${top.cityRank}`
                : `N° ${top.cityRank} · ${top.commune.toUpperCase()}`
            }
          />
        </View>
      ) : null}
    </View>
  );

  return (
    <FlatList
      className="flex-1 bg-fond"
      data={rest}
      keyExtractor={(r) => r.id}
      ListHeaderComponent={header}
      renderItem={({ item }) => (
        <View className="px-5">
          <RestaurantRow restaurant={item} rank={item.cityRank} />
        </View>
      )}
      ListEmptyComponent={
        ranking && !top ? (
          <View className="items-center gap-2 px-8 py-12">
            <Icon name="search" size={32} color={colors.texteSecondaire} />
            <Text variant="libelle" className="text-center">
              Aucun restaurant ne correspond
            </Text>
            <Text variant="legende" className="text-center text-texte-secondaire">
              Essayez un autre mot ou retirez un filtre.
            </Text>
          </View>
        ) : undefined
      }
      contentContainerStyle={{ paddingBottom: 24 }}
      keyboardShouldPersistTaps="handled"
    />
  );
}
