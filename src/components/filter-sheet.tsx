import { BottomSheet } from '@expo/ui';
import { ScrollView, View } from 'react-native';

import { activeFilterCount, EMPTY_FILTERS, NEAR_KM, type Filters } from '@/data/search';
import { COMMUNES, type Amenity, type PriceLevel } from '@/data/types';
import { colors } from '@/theme/colors';

import { AMENITY_LABELS } from './labels';
import { Button, Chip, Text } from './ui/primitives';

const PRICES: { value: PriceLevel | null; label: string }[] = [
  { value: null, label: 'Tous' },
  { value: 1, label: '$' },
  { value: 2, label: '$$ max' },
  { value: 3, label: '$$$ max' },
];

const SCORES: { value: number | null; label: string }[] = [
  { value: null, label: 'Toutes' },
  { value: 7, label: '7+' },
  { value: 8, label: '8+' },
  { value: 9, label: '9+' },
];

const AMENITIES: Amenity[] = ['terrasse', 'parking-garde', 'groupe-electrogene', 'climatisation', 'vue-fleuve', 'wifi'];

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <View className="gap-2">
      <Text variant="libelle">{title}</Text>
      <View className="flex-row flex-wrap gap-2">{children}</View>
    </View>
  );
}

/** Tous les filtres du classement, dans un volet du bas. Les changements s'appliquent tout de suite. */
export function FilterSheet({
  open,
  onClose,
  filters,
  onChange,
  resultCount,
}: {
  open: boolean;
  onClose: () => void;
  filters: Filters;
  onChange: (f: Filters) => void;
  resultCount: number;
}) {
  const set = (patch: Partial<Filters>) => onChange({ ...filters, ...patch });
  const toggleAmenity = (a: Amenity) =>
    set({
      amenities: filters.amenities.includes(a)
        ? filters.amenities.filter((x) => x !== a)
        : [...filters.amenities, a],
    });

  return (
    <BottomSheet isPresented={open} onDismiss={onClose} snapPoints={['full']} containerColor={colors.surface}>
      <View className="flex-1">
        <View className="flex-row items-baseline justify-between pb-3">
          <Text variant="titre-2">Filtres</Text>
          {activeFilterCount(filters) > 0 || filters.sort !== 'cote' ? (
            <Button label="Tout effacer" variant="texte" size="m" onPress={() => onChange(EMPTY_FILTERS)} />
          ) : null}
        </View>
        <ScrollView className="flex-1" contentContainerClassName="gap-5 pb-4">
          <Section title="Trier par">
            <Chip label="Cote" active={filters.sort === 'cote' && !filters.near} onPress={() => set({ sort: 'cote', near: false })} />
            <Chip label="Distance" active={filters.sort === 'distance' || filters.near} onPress={() => set({ sort: 'distance' })} />
          </Section>
          <Section title="Où">
            <Chip label={`À moins de ${NEAR_KM} km`} active={filters.near} onPress={() => set({ near: !filters.near })} />
            <Chip label="Toutes les communes" active={filters.commune === null} onPress={() => set({ commune: null })} />
            {COMMUNES.map((c) => (
              <Chip key={c} label={c} active={filters.commune === c} onPress={() => set({ commune: filters.commune === c ? null : c })} />
            ))}
          </Section>
          <Section title="Quand">
            <Chip label="Ouvert maintenant" active={filters.openNow} onPress={() => set({ openNow: !filters.openNow })} />
          </Section>
          <Section title="Budget">
            {PRICES.map((p) => (
              <Chip key={p.label} label={p.label} active={filters.maxPrice === p.value} onPress={() => set({ maxPrice: p.value })} />
            ))}
          </Section>
          <Section title="Cote minimale">
            {SCORES.map((s) => (
              <Chip key={s.label} label={s.label} active={filters.minScore === s.value} onPress={() => set({ minScore: s.value })} />
            ))}
          </Section>
          <Section title="Équipements">
            {AMENITIES.map((a) => (
              <Chip key={a} label={AMENITY_LABELS[a]} active={filters.amenities.includes(a)} onPress={() => toggleAmenity(a)} />
            ))}
          </Section>
        </ScrollView>
        <View className="pb-2 pt-3">
          <Button
            label={resultCount === 0 ? 'Aucun résultat' : `Voir ${resultCount} restaurant${resultCount > 1 ? 's' : ''}`}
            onPress={onClose}
          />
        </View>
      </View>
    </BottomSheet>
  );
}
