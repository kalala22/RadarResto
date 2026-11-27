import { BottomSheet } from '@expo/ui';
import { Pressable, View } from 'react-native';

import { DIRECTIONS_APPS, openDirections } from '@/lib/links';
import type { Restaurant } from '@/data/types';
import { colors } from '@/theme/colors';

import { Icon } from './ui/icon';
import { Text } from './ui/primitives';

/** Choix de l'application pour l'itinéraire (Google Maps, Waze, Plans sur iPhone). */
export function DirectionsSheet({
  restaurant,
  open,
  onClose,
}: {
  restaurant: Pick<Restaurant, 'latitude' | 'longitude' | 'name' | 'landmark'>;
  open: boolean;
  onClose: () => void;
}) {
  return (
    <BottomSheet isPresented={open} onDismiss={onClose} containerColor={colors.surface}>
      <View className="gap-1 pb-4">
        <Text variant="titre-2">Itinéraire</Text>
        <Text variant="legende" className="mb-2 text-texte-secondaire">
          Vers {restaurant.name}, {restaurant.landmark}
        </Text>
        {DIRECTIONS_APPS.map((app) => (
          <Pressable
            key={app.id}
            accessibilityRole="button"
            accessibilityLabel={`Ouvrir dans ${app.label}`}
            onPress={() => {
              onClose();
              openDirections(restaurant, app.id);
            }}
            className="h-[52px] flex-row items-center gap-3 border-b border-bordure active:opacity-70">
            <Icon name="navigate" size={20} color={colors.vertRadar} />
            <Text variant="corps-bold" className="flex-1">
              {app.label}
            </Text>
            <Icon name="chevron-right" size={18} color={colors.texteSecondaire} />
          </Pressable>
        ))}
      </View>
    </BottomSheet>
  );
}
