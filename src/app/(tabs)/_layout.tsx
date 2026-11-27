import { Tabs } from 'expo-router/tabs';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon, type IconName } from '@/components/ui/icon';
import { colors } from '@/theme/colors';

const tab = (title: string, icon: IconName) => ({
  title,
  tabBarIcon: ({ color }: { color: ColorValue }) => <Icon name={icon} size={22} color={String(color)} />,
});

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.vertRadar,
        tabBarInactiveTintColor: colors.texteSecondaire,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.bordure,
          height: 64 + insets.bottom,
          paddingTop: 6,
          paddingBottom: insets.bottom + 8,
        },
        tabBarLabelStyle: { fontFamily: 'SourceSans3_600SemiBold', fontSize: 12, lineHeight: 16 },
        sceneStyle: { backgroundColor: colors.fond },
      }}>
      <Tabs.Screen name="classement" options={tab('Classement', 'ranking')} />
      <Tabs.Screen name="carte" options={tab('Carte', 'pin')} />
      <Tabs.Screen name="favoris" options={tab('Favoris', 'heart')} />
      <Tabs.Screen name="profil" options={tab('Profil', 'user')} />
    </Tabs>
  );
}
