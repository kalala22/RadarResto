import { router } from 'expo-router';
import { View } from 'react-native';

import { colors } from '@/theme/colors';

import { Icon, type IconName } from './ui/icon';
import { Button, Text } from './ui/primitives';

/** Invitation à se connecter, pour les actions réservées aux membres. */
export function GuestPrompt({ icon, title, text }: { icon: IconName; title: string; text: string }) {
  return (
    <View className="items-center gap-3 px-8 py-10">
      <View className="h-14 w-14 items-center justify-center rounded-l bg-menthe">
        <Icon name={icon} size={28} color={colors.vertProfond} />
      </View>
      <Text variant="titre-2" className="text-center">
        {title}
      </Text>
      <Text className="text-center text-texte-secondaire">{text}</Text>
      <View className="mt-2 w-full gap-2">
        <Button label="Créer un compte" onPress={() => router.push('/signup')} />
        <Button label="Se connecter" variant="texte" size="m" onPress={() => router.push('/login')} />
      </View>
    </View>
  );
}
