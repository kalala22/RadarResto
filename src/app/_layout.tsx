import '@/global.css';

import { IBMPlexMono_500Medium, IBMPlexMono_600SemiBold } from '@expo-google-fonts/ibm-plex-mono';
import {
  SourceSans3_400Regular,
  SourceSans3_600SemiBold,
  SourceSans3_700Bold,
} from '@expo-google-fonts/source-sans-3';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AppProvider, useApp } from '@/data/store';
import { colors } from '@/theme/colors';

SplashScreen.preventAutoHideAsync();

function RootNavigator() {
  const { hydrated } = useApp();
  const [fontsLoaded, fontError] = useFonts({
    'ArchivoCondensed-ExtraBold': require('@/assets/fonts/ArchivoCondensed-ExtraBold.ttf'),
    'ArchivoCondensed-Bold': require('@/assets/fonts/ArchivoCondensed-Bold.ttf'),
    SourceSans3_400Regular,
    SourceSans3_600SemiBold,
    SourceSans3_700Bold,
    IBMPlexMono_500Medium,
    IBMPlexMono_600SemiBold,
  });
  const ready = hydrated && (fontsLoaded || !!fontError);

  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  if (!ready) return null;

  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.fond } }}>
        <Stack.Screen name="index" />
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen name="restaurant/[id]/index" />
        <Stack.Screen name="restaurant/[id]/avis" options={{ presentation: 'modal' }} />
        <Stack.Screen name="restaurant/[id]/avis-liste" />
        <Stack.Screen name="parametres" />
      </Stack>
    </>
  );
}

export default function RootLayout() {
  return (
    <AppProvider>
      <RootNavigator />
    </AppProvider>
  );
}
