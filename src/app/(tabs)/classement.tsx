import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useMemo, useRef, useState } from 'react';
import { FlatList, Pressable, ScrollView, Text as RNText, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/logo';
import { FilterSheet } from '@/components/filter-sheet';
import { LocationPrompt } from '@/components/location-prompt';
import { RestaurantRow, TopCard } from '@/components/restaurant';
import { Icon } from '@/components/ui/icon';
import { Chip, IconButton, Text } from '@/components/ui/primitives';
import {
  activeFilterCount,
  applyFilters,
  EMPTY_FILTERS,
  MATCH_LABELS,
  SEARCH_SUGGESTIONS,
  searchRestaurants,
  type Filters,
  type SearchResult,
} from '@/data/search';
import { useApp, useRanking } from '@/data/store';
import { formatMonth, formatPriceLevel, greeting } from '@/lib/format';
import { colors } from '@/theme/colors';

const hintOf = (r: SearchResult) =>
  r.match && r.match.field !== 'nom' ? `${MATCH_LABELS[r.match.field]} : ${r.match.text}` : undefined;

export default function Classement() {
  const insets = useSafeAreaInsets();
  const ranking = useRanking();
  const { profile, recentSearches, addRecentSearch, clearRecentSearches, location } = useApp();
  const [filters, setFilters] = useState<Filters>(EMPTY_FILTERS);
  const [sheetOpen, setSheetOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [focused, setFocused] = useState(false);
  const inputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const now = new Date();

  // Depuis la carte : « Rechercher » ouvre directement le champ de recherche.
  const { recherche } = useLocalSearchParams<{ recherche?: string }>();
  useEffect(() => {
    if (recherche !== '1') return;
    inputRef.current?.focus();
    router.setParams({ recherche: undefined });
  }, [recherche]);

  const results = useMemo(
    () => (ranking ? applyFilters(searchRestaurants(ranking, query), filters, now) : []),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ranking, filters, query],
  );

  const searching = query.trim().length > 0;
  const filterCount = activeFilterCount(filters);
  const filtered = searching || filterCount > 0;
  const byDistance = filters.near || filters.sort === 'distance';
  const showSuggestions = focused && !searching;
  // Pendant une recherche, pas d'encart du N° 1 : tous les résultats en liste, avec leur explication.
  const top = searching ? undefined : results[0];
  const rest = searching ? results : results.slice(1);
  const listData = showSuggestions ? [] : rest;

  const set = (patch: Partial<Filters>) => setFilters((f) => ({ ...f, ...patch }));
  const remember = () => addRecentSearch(query);
  const pick = (q: string) => {
    setQuery(q);
    addRecentSearch(q);
    inputRef.current?.blur();
  };

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
            ref={inputRef}
            value={query}
            onChangeText={setQuery}
            onFocus={() => setFocused(true)}
            // Petit délai : laisse le temps au toucher sur une suggestion d'arriver.
            onBlur={() => setTimeout(() => setFocused(false), 150)}
            onSubmitEditing={remember}
            placeholder="Restaurant, plat, quartier…"
            placeholderTextColor={colors.texteSecondaire}
            accessibilityLabel="Rechercher un restaurant, un plat ou un quartier"
            returnKeyType="search"
            autoCorrect={false}
            className="flex-1 font-texte text-[15px] text-encre outline-none"
          />
          {query.length > 0 ? (
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Effacer la recherche"
              onPress={() => setQuery('')}
              hitSlop={12}>
              <Icon name="close" size={18} color={colors.texteSecondaire} />
            </Pressable>
          ) : null}
        </View>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        contentContainerClassName="gap-2 px-5 pb-1 pt-[14px]">
        <Chip
          icon="sliders"
          label={filterCount > 0 ? `Filtres · ${filterCount}` : 'Filtres'}
          accessibilityLabel={filterCount > 0 ? `Filtres, ${filterCount} actifs` : 'Tous les filtres'}
          active={filterCount > 0}
          onPress={() => setSheetOpen(true)}
        />
        <Chip label="Près de moi" active={filters.near} onPress={() => set({ near: !filters.near })} />
        <Chip
          label={filters.commune ?? 'Commune'}
          menu
          active={filters.commune !== null}
          onPress={() => setSheetOpen(true)}
        />
        <Chip label="Ouvert" active={filters.openNow} onPress={() => set({ openNow: !filters.openNow })} />
        <Chip
          label={filters.maxPrice ? `${formatPriceLevel(filters.maxPrice)} max` : 'Prix'}
          menu
          active={filters.maxPrice !== null}
          onPress={() => setSheetOpen(true)}
        />
        <Chip
          label="Terrasse"
          active={filters.amenities.includes('terrasse')}
          onPress={() =>
            set({
              amenities: filters.amenities.includes('terrasse')
                ? filters.amenities.filter((a) => a !== 'terrasse')
                : [...filters.amenities, 'terrasse'],
            })
          }
        />
      </ScrollView>

      {showSuggestions ? (
        <View className="gap-4 px-5 pt-5">
          {recentSearches.length > 0 ? (
            <View className="gap-1">
              <View className="flex-row items-center justify-between">
                <Text variant="libelle">Recherches récentes</Text>
                <Pressable accessibilityRole="button" onPress={clearRecentSearches} className="h-11 justify-center">
                  <Text className="font-texte-semi text-legende text-vert-radar">Effacer</Text>
                </Pressable>
              </View>
              {recentSearches.map((q) => (
                <Pressable
                  key={q}
                  accessibilityRole="button"
                  accessibilityLabel={`Rechercher ${q}`}
                  onPress={() => pick(q)}
                  className="h-11 flex-row items-center gap-3 border-b border-bordure">
                  <Icon name="history" size={18} color={colors.texteSecondaire} />
                  <Text className="flex-1">{q}</Text>
                </Pressable>
              ))}
            </View>
          ) : null}
          <View className="gap-2">
            <Text variant="libelle">Idées de recherche</Text>
            <View className="flex-row flex-wrap gap-2">
              {SEARCH_SUGGESTIONS.map((s) => (
                <Chip key={s} label={s} onPress={() => pick(s)} />
              ))}
            </View>
          </View>
        </View>
      ) : (
        <>
          {byDistance ? <LocationPrompt compact className="mx-5 mt-[14px]" /> : null}

          <View className="flex-row items-baseline justify-between px-5 pt-[14px]">
            <Text variant="titre-2">
              {filtered ? `${results.length} résultat${results.length > 1 ? 's' : ''}` : 'Top de la ville'}
            </Text>
            <Text variant="legende" className="text-texte-secondaire">
              {byDistance
                ? location.status === 'accordee' && !location.outsideKinshasa
                  ? 'Depuis votre position'
                  : 'Depuis la Gombe'
                : formatMonth(now)}
            </Text>
          </View>

          {top ? (
            <View className="px-5 pt-[10px]">
              <TopCard
                restaurant={top.restaurant}
                label={
                  byDistance
                    ? `LE PLUS PROCHE · N° ${top.restaurant.cityRank}`
                    : `N° ${top.restaurant.cityRank} · ${top.restaurant.commune.toUpperCase()}`
                }
              />
            </View>
          ) : null}
        </>
      )}
    </View>
  );

  return (
    <>
      <FlatList
        className="flex-1 bg-fond"
        data={listData}
        keyExtractor={(r) => r.restaurant.id}
        ListHeaderComponent={header}
        renderItem={({ item }) => (
          <View className="px-5">
            <RestaurantRow
              restaurant={item.restaurant}
              rank={item.restaurant.cityRank}
              hint={hintOf(item)}
              onOpen={searching ? remember : undefined}
            />
          </View>
        )}
        ListEmptyComponent={
          ranking && !showSuggestions && results.length === 0 ? (
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
        keyboardDismissMode="on-drag"
      />
      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        filters={filters}
        onChange={setFilters}
        resultCount={results.length}
      />
    </>
  );
}
