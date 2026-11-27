import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Logo } from '@/components/brand/logo';
import { BackButton, Button, Field, PhoneInput, Text } from '@/components/ui/primitives';
import { sendOtp } from '@/data/repository';
import { useApp } from '@/data/store';
import type { OtpChannel } from '@/data/types';
import { normalizePhone } from '@/lib/format';

export default function Login() {
  const insets = useSafeAreaInsets();
  const { completeOnboarding } = useApp();
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState<OtpChannel | null>(null);
  const e164 = normalizePhone(phone);

  const send = async (channel: OtpChannel) => {
    if (!e164) return;
    setLoading(channel);
    await sendOtp(e164, channel);
    setLoading(null);
    router.push({ pathname: '/verify', params: { phone: e164, channel } });
  };

  const guest = () => {
    completeOnboarding();
    router.replace('/classement');
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-fond" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, paddingBottom: insets.bottom + 24 }}
        keyboardShouldPersistTaps="handled">
        <View className="rounded-b-[28px] bg-nuit px-6 pb-8" style={{ paddingTop: insets.top + 16 }}>
          <BackButton tone="sombre" />
          <View className="mt-7">
            <Logo height={44} variant="sombre" />
          </View>
          <Text variant="affiche" className="mt-4 text-[34px] leading-[36px] text-surface">
            Content de vous revoir
          </Text>
          <Text className="mt-2 text-[15px] text-texte-sur-nuit">
            Connectez-vous avec votre numéro. Pas de mot de passe : un code vous est envoyé.
          </Text>
        </View>

        <View className="gap-4 px-6 pt-7">
          <Field label="Numéro de téléphone">
            <PhoneInput value={phone} onChangeText={setPhone} />
          </Field>
          <Button
            label="Recevoir le code par WhatsApp"
            onPress={() => send('whatsapp')}
            disabled={!e164}
            loading={loading === 'whatsapp'}
          />
          <Button
            label="Recevoir le code par SMS"
            variant="secondaire"
            size="m"
            onPress={() => send('sms')}
            disabled={!e164}
            loading={loading === 'sms'}
          />
          <View className="mt-1 flex-row items-center gap-[10px]">
            <View className="h-px flex-1 bg-bordure" />
            <Text variant="legende" className="text-texte-secondaire">
              ou
            </Text>
            <View className="h-px flex-1 bg-bordure" />
          </View>
          <Button label="Continuer sans compte" variant="texte" size="m" onPress={guest} />
          <Text variant="legende" className="-mt-3 text-center text-texte-secondaire">
            Vous pourrez voir le classement et la carte, mais pas noter.
          </Text>
        </View>

        <View className="min-h-6 flex-1" />
        <View className="flex-row justify-center px-6">
          <Text className="text-[15px] text-texte-secondaire">Nouveau ici ? </Text>
          <Pressable accessibilityRole="link" onPress={() => router.replace('/signup')}>
            <RNText className="font-texte-bold text-[15px] text-vert-radar">Créer un compte</RNText>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
