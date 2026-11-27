import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/logo';
import { Button, Text, cx } from '@/components/ui/primitives';
import { useApp } from '@/data/store';

const STEPS = [
  {
    title: 'Les meilleures tables de Kinshasa',
    text: 'Un classement clair des restaurants de la ville, mis à jour chaque mois, avec une cote sur 10.',
  },
  {
    title: 'Une cote en qui avoir confiance',
    text: 'Elle combine les visites de notre équipe, les avis vérifiés des clients et la tendance du moment. Aucun restaurant ne peut acheter sa place.',
  },
  {
    title: 'Le bon restaurant, près de vous',
    text: 'Carte, itinéraire, prix réels, mobile money, groupe électrogène : tout ce qu’il faut savoir avant de sortir.',
  },
];

function Podium() {
  const bars = [
    { rank: '2', score: '8,9', h: 120 },
    { rank: '1', score: '9,2', h: 170, top: true },
    { rank: '3', score: '8,7', h: 96 },
  ];
  return (
    <View className="h-[210px] flex-row items-end justify-center gap-3">
      {bars.map((b) => (
        <View
          key={b.rank}
          style={{ height: b.h }}
          className={cx('w-[84px] items-center justify-between rounded-t-m py-3', b.top ? 'bg-safran' : 'bg-nuit-2')}>
          <RNText className={cx('font-titre text-[34px]', b.top ? 'text-sur-safran' : 'text-surface')}>{b.rank}</RNText>
          <RNText className={cx('font-chiffres text-[15px]', b.top ? 'text-sur-safran' : 'text-texte-sur-nuit')}>
            {b.score}
          </RNText>
        </View>
      ))}
    </View>
  );
}

function Method() {
  const rows = [
    ['Visites de l’équipe', '60 %'],
    ['Avis clients vérifiés', '20 %'],
    ['Tendance Instagram', '20 %'],
  ];
  return (
    <View className="w-full gap-2 rounded-l bg-nuit-2 p-4">
      {rows.map(([label, value]) => (
        <View key={label} className="flex-row justify-between border-b border-nuit-3 pb-2">
          <RNText className="font-texte text-[15px] text-texte-sur-nuit">{label}</RNText>
          <RNText className="font-chiffres text-[15px] text-surface">{value}</RNText>
        </View>
      ))}
      <View className="flex-row items-center justify-between pt-1">
        <RNText className="font-texte-bold text-[15px] text-surface">Cote du restaurant</RNText>
        <RNText className="font-chiffres text-[22px] text-safran">9,2/10</RNText>
      </View>
    </View>
  );
}

function MiniMap() {
  return (
    <View className="h-[210px] w-full overflow-hidden rounded-l bg-nuit-2">
      <View className="absolute left-0 right-0 top-[90px] h-3 bg-nuit-3" />
      <View className="absolute bottom-0 top-0 left-[120px] w-3 bg-nuit-3" />
      <View className="absolute left-[40px] top-[40px] rounded-full bg-safran px-3 py-1">
        <RNText className="font-chiffres text-[14px] text-sur-safran">9,2</RNText>
      </View>
      <View className="absolute left-[180px] top-[120px] rounded-full bg-vert-radar px-3 py-1">
        <RNText className="font-chiffres text-[14px] text-sur-vert">8,7</RNText>
      </View>
      <View className="absolute left-[80px] top-[150px] rounded-full bg-vert-radar px-3 py-1">
        <RNText className="font-chiffres text-[14px] text-sur-vert">8,4</RNText>
      </View>
    </View>
  );
}

export default function Onboarding() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useApp();
  const [i, setI] = useState(0);
  const last = i === STEPS.length - 1;

  const leave = (to: '/signup' | '/login') => {
    completeOnboarding();
    router.replace(to);
  };

  return (
    <View className="flex-1 bg-nuit px-6" style={{ paddingTop: insets.top + 12, paddingBottom: insets.bottom + 24 }}>
      <View className="flex-row items-center justify-between">
        <Logo height={40} variant="sombre" />
        <Pressable accessibilityRole="button" onPress={() => leave('/login')} className="h-11 justify-center px-2">
          <RNText className="font-texte-bold text-[15px] text-texte-sur-nuit">Passer</RNText>
        </Pressable>
      </View>

      <View className="mt-8 items-center">
        {i === 0 ? <Podium /> : i === 1 ? <Method /> : <MiniMap />}
      </View>

      <View className="mt-8 gap-2">
        <RNText className="font-chiffres text-surtitre text-safran">
          ÉTAPE {i + 1} SUR {STEPS.length}
        </RNText>
        <Text variant="affiche" className="text-surface">
          {STEPS[i].title}
        </Text>
        <Text className="text-[16px] leading-[24px] text-texte-sur-nuit">{STEPS[i].text}</Text>
      </View>

      <View className="flex-1" />

      <View className="mb-5 flex-row justify-center gap-[6px]" accessibilityLabel={`Étape ${i + 1} sur 3`}>
        {STEPS.map((_, n) => (
          <View key={n} className={cx('h-2 rounded-full', n === i ? 'w-6 bg-safran' : 'w-2 bg-nuit-3')} />
        ))}
      </View>

      {last ? (
        <View className="gap-3">
          <Button label="Créer un compte" onPress={() => leave('/signup')} />
          <Pressable
            accessibilityRole="button"
            onPress={() => leave('/login')}
            className="h-12 items-center justify-center rounded-m border border-texte-sur-nuit">
            <RNText className="font-texte-bold text-[15px] text-surface">J’ai déjà un compte</RNText>
          </Pressable>
        </View>
      ) : (
        <Button label="Suivant" onPress={() => setI(i + 1)} />
      )}
    </View>
  );
}
