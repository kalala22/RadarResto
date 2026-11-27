import { useLocalSearchParams } from 'expo-router';
import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ReviewScore } from '@/components/restaurant';
import { BackButton, Tag, Text } from '@/components/ui/primitives';
import { useRestaurant, useReviews } from '@/data/store';
import { CRITERIA, type Review } from '@/data/types';
import { formatRelative } from '@/lib/format';

const avg = (r: Review) => CRITERIA.reduce((s, c) => s + r.ratings[c.key], 0) / CRITERIA.length;

/** Liste complète des avis (absente de la maquette, construite dans le même style). */
export default function AvisListe() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const restaurant = useRestaurant(id);
  const reviews = useReviews(id);
  const now = new Date();

  return (
    <View className="flex-1 bg-fond" style={{ paddingTop: insets.top + 16 }}>
      <View className="flex-row items-center gap-[10px] px-4 pb-3">
        <BackButton />
        <View className="flex-1">
          <Text variant="legende" className="text-texte-secondaire">
            {reviews?.length ?? 0} avis
          </Text>
          <Text className="font-texte-bold text-[17px]" numberOfLines={1}>
            {restaurant?.name ?? ''}
          </Text>
        </View>
      </View>
      <FlatList
        data={reviews ?? []}
        keyExtractor={(r) => r.id}
        contentContainerClassName="px-5"
        contentContainerStyle={{ paddingBottom: insets.bottom + 24 }}
        renderItem={({ item }) => (
          <View className="gap-1 border-b border-bordure py-3">
            <View className="flex-row flex-wrap items-center gap-2">
              <Text className="font-texte-bold text-[15px]">{item.authorName}</Text>
              <ReviewScore value={avg(item)} />
              {item.verified ? <Tag label="Visite vérifiée" /> : null}
            </View>
            <Text variant="legende" className="text-texte-secondaire">
              {formatRelative(item.createdAt, now)}
              {item.mine ? ' · votre avis' : ''}
            </Text>
            {item.comment ? <Text className="text-[15px]">{item.comment}</Text> : null}
          </View>
        )}
      />
    </View>
  );
}
