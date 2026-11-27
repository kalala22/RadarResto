import { FlatList, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GuestPrompt } from '@/components/guest-prompt';
import { RestaurantRow } from '@/components/restaurant';
import { Icon } from '@/components/ui/icon';
import { Text } from '@/components/ui/primitives';
import { useApp, useRanking } from '@/data/store';
import { formatDistance } from '@/lib/format';
import { colors } from '@/theme/colors';

/** Onglet Favoris (absent de la maquette, construit dans le même style). */
export default function Favoris() {
  const insets = useSafeAreaInsets();
  const { session, favorites } = useApp();
  const ranking = useRanking();
  const list = (ranking ?? [])
    .filter((r) => favorites.includes(r.id))
    .sort((a, b) => favorites.indexOf(a.id) - favorites.indexOf(b.id));

  return (
    <View className="flex-1 bg-fond" style={{ paddingTop: insets.top + 16 }}>
      <View className="px-5 pb-2">
        <Text variant="titre-1">Mes favoris</Text>
        {session && list.length > 0 ? (
          <Text variant="legende" className="mt-1 text-texte-secondaire">
            {list.length} restaurant{list.length > 1 ? 's' : ''} gardé{list.length > 1 ? 's' : ''}
          </Text>
        ) : null}
      </View>
      {!session ? (
        <GuestPrompt
          icon="heart"
          title="Gardez vos tables préférées"
          text="Créez un compte pour enregistrer des restaurants et les retrouver ici."
        />
      ) : (
        <FlatList
          data={list}
          keyExtractor={(r) => r.id}
          contentContainerClassName="px-5 pb-6"
          renderItem={({ item }) => (
            <RestaurantRow
              restaurant={item}
              meta={`N° ${item.cityRank} · ${item.cuisine} · ${item.commune} · ${formatDistance(item.distanceKm)}`}
            />
          )}
          ListEmptyComponent={
            <View className="items-center gap-2 px-6 py-12">
              <Icon name="heart" size={32} color={colors.texteSecondaire} />
              <Text variant="libelle" className="text-center">
                Aucun favori pour l’instant
              </Text>
              <Text variant="legende" className="text-center text-texte-secondaire">
                Touchez le cœur sur la fiche d’un restaurant pour le garder ici.
              </Text>
            </View>
          }
        />
      )}
    </View>
  );
}
