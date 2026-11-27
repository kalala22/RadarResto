import { useState } from 'react';
import { Linking, View } from 'react-native';

import { useApp } from '@/data/store';
import { colors } from '@/theme/colors';

import { Icon } from './ui/icon';
import { Button, Text, cx } from './ui/primitives';

/**
 * Explique pourquoi on demande la position avant d'afficher la demande du système.
 * Ne s'affiche que si la position n'est pas disponible.
 */
export function LocationPrompt({ className, compact }: { className?: string; compact?: boolean }) {
  const { location, requestLocation } = useApp();
  const [busy, setBusy] = useState(false);

  if (location.status === 'accordee' && !location.outsideKinshasa) return null;

  const blocked = location.status === 'bloquee';
  const outside = location.status === 'accordee' && location.outsideKinshasa;

  const title = outside
    ? 'Vous semblez hors de Kinshasa'
    : blocked
      ? 'La position est bloquée'
      : 'Voir ce qui est vraiment près de vous';
  const body = outside
    ? 'Les distances sont calculées depuis la Gombe.'
    : blocked
      ? 'Autorisez la position dans les réglages du téléphone. En attendant, les distances partent de la Gombe.'
      : 'Votre position sert seulement à calculer les distances, quand l’app est ouverte. Elle n’est jamais enregistrée. Sans elle, les distances partent de la Gombe.';

  const onPress = async () => {
    if (blocked) {
      Linking.openSettings().catch(() => {});
      return;
    }
    setBusy(true);
    await requestLocation();
    setBusy(false);
  };

  return (
    <View className={cx('flex-row gap-3 rounded-m bg-menthe p-3', className)}>
      <View className="mt-[2px]">
        <Icon name="locate" size={20} color={colors.vertProfond} />
      </View>
      <View className="flex-1 gap-1">
        <Text variant="libelle" className="text-vert-profond">
          {title}
        </Text>
        {compact && !blocked && !outside ? null : (
          <Text variant="legende" className="text-encre">
            {body}
          </Text>
        )}
        {outside ? null : (
          <Button
            label={blocked ? 'Ouvrir les réglages' : 'Activer ma position'}
            size="m"
            variant="secondaire"
            className="mt-1 self-start"
            loading={busy}
            onPress={onPress}
          />
        )}
      </View>
    </View>
  );
}
