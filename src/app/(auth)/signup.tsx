import { Host, Picker } from '@expo/ui';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChannelPicker } from '@/components/channel-picker';
import { Icon } from '@/components/ui/icon';
import { BackButton, Button, Field, Input, PhoneInput, Text, cx } from '@/components/ui/primitives';
import { sendOtp } from '@/data/repository';
import { COMMUNES, type OtpChannel } from '@/data/types';
import { normalizePhone } from '@/lib/format';
import { colors } from '@/theme/colors';

const NO_COMMUNE = 'aucune';

export default function Signup() {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [commune, setCommune] = useState<string>(NO_COMMUNE);
  const [channel, setChannel] = useState<OtpChannel>('whatsapp');
  const [accepted, setAccepted] = useState(true);
  const [loading, setLoading] = useState(false);

  const e164 = normalizePhone(phone);
  const valid = name.trim().length >= 2 && !!e164 && accepted;

  const submit = async () => {
    if (!e164) return;
    setLoading(true);
    await sendOtp(e164, channel);
    setLoading(false);
    router.push({
      pathname: '/verify',
      params: { phone: e164, channel, name: name.trim(), commune: commune === NO_COMMUNE ? '' : commune },
    });
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-fond" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        contentContainerClassName="px-6"
        contentContainerStyle={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24, flexGrow: 1 }}
        keyboardShouldPersistTaps="handled">
        <BackButton />
        <Text variant="titre-1" className="mt-6 text-[32px] leading-[34px]">
          Créer un compte
        </Text>
        <Text className="mt-2 text-texte-secondaire">
          Pour noter les restaurants, garder vos favoris et recevoir le classement du mois.
        </Text>

        <View className="mt-6 gap-4">
          <Field label="Prénom et nom">
            <Input value={name} onChangeText={setName} placeholder="Ex. Grâce Mbuyi" autoComplete="name" />
          </Field>
          <Field label="Numéro de téléphone">
            <PhoneInput value={phone} onChangeText={setPhone} />
          </Field>
          <Field label="Votre quartier" hint="(facultatif)">
            <View className="min-h-[52px] justify-center rounded-m border border-bordure-champ bg-surface px-2">
              <Host matchContents colorScheme="light" seedColor={colors.vertRadar}>
                <Picker
                  selectedValue={commune}
                  onValueChange={(v) => setCommune(String(v))}
                  accessibilityLabel="Votre quartier">
                  <Picker.Item label="Choisir une commune" value={NO_COMMUNE} />
                  {COMMUNES.map((c) => (
                    <Picker.Item key={c} label={c} value={c} />
                  ))}
                  <Picker.Item label="Autre commune" value="autre" />
                </Picker>
              </Host>
            </View>
          </Field>
          <View className="gap-2">
            <Text className="font-texte-semi text-[14px]">Recevoir le code par</Text>
            <ChannelPicker value={channel} onChange={setChannel} />
          </View>
          <Pressable
            accessibilityRole="checkbox"
            accessibilityState={{ checked: accepted }}
            onPress={() => setAccepted(!accepted)}
            className="flex-row items-start gap-3 py-1">
            <View
              className={cx(
                'mt-[2px] h-[22px] w-[22px] items-center justify-center rounded-[6px]',
                accepted ? 'bg-vert-radar' : 'border border-bordure-champ bg-surface',
              )}>
              {accepted ? <Icon name="check" size={16} color={colors.surface} strokeWidth={3} /> : null}
            </View>
            <RNText className="flex-1 font-texte text-[14px] leading-[20px] text-encre">
              J’accepte les <RNText className="font-texte-bold text-vert-radar">conditions d’utilisation</RNText> et la{' '}
              <RNText className="font-texte-bold text-vert-radar">politique de confidentialité</RNText>.
            </RNText>
          </Pressable>
        </View>

        <View className="min-h-6 flex-1" />
        <Button label="Recevoir mon code" onPress={submit} disabled={!valid} loading={loading} />
        <View className="mt-4 flex-row justify-center">
          <Text className="text-[15px] text-texte-secondaire">Déjà inscrit ? </Text>
          <Pressable accessibilityRole="link" onPress={() => router.replace('/login')}>
            <Text className="font-texte-bold text-[15px] text-vert-radar">Se connecter</Text>
          </Pressable>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
