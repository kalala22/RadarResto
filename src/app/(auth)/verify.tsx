import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, Text as RNText, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { Icon } from '@/components/ui/icon';
import { BackButton, Button, Text, cx } from '@/components/ui/primitives';
import { sendOtp, verifyOtp } from '@/data/repository';
import { defaultProfile, useApp } from '@/data/store';
import type { Commune, OtpChannel } from '@/data/types';
import { formatPhone } from '@/lib/format';
import { colors } from '@/theme/colors';

const LENGTH = 6;
const RESEND_SECONDS = 45;

export default function Verify() {
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ phone: string; channel: OtpChannel; name?: string; commune?: string }>();
  const { signIn } = useApp();
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''));
  const [channel, setChannel] = useState<OtpChannel>(params.channel ?? 'whatsapp');
  const [seconds, setSeconds] = useState(RESEND_SECONDS);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputs = useRef<(React.ComponentRef<typeof TextInput> | null)[]>([]);

  useEffect(() => {
    if (seconds <= 0) return;
    const t = setTimeout(() => setSeconds((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [seconds]);

  const code = digits.join('');

  const setDigit = (index: number, value: string) => {
    const clean = value.replace(/\D/g, '');
    // Collage d'un code complet
    if (clean.length > 1) {
      const next = clean.slice(0, LENGTH).split('');
      setDigits([...next, ...Array(LENGTH - next.length).fill('')]);
      inputs.current[Math.min(next.length, LENGTH - 1)]?.focus();
      return;
    }
    const next = [...digits];
    next[index] = clean;
    setDigits(next);
    setError(null);
    if (clean && index < LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const resend = async (c: OtpChannel) => {
    setChannel(c);
    setSeconds(RESEND_SECONDS);
    await sendOtp(params.phone, c);
  };

  const submit = async () => {
    setLoading(true);
    const ok = await verifyOtp(params.phone, code);
    setLoading(false);
    if (!ok) {
      setError('Code incorrect. Vérifiez les 6 chiffres.');
      return;
    }
    const profile = params.name
      ? { ...defaultProfile(params.name, params.phone), commune: (params.commune || null) as Commune | null }
      : undefined;
    signIn(params.phone, profile);
    router.dismissAll();
    router.replace('/classement');
  };

  const mm = Math.floor(seconds / 60);
  const ss = String(seconds % 60).padStart(2, '0');

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-fond px-6"
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      style={{ paddingTop: insets.top + 16, paddingBottom: insets.bottom + 24 }}>
      <BackButton />
      <View className="mt-7 h-14 w-14 items-center justify-center rounded-l bg-menthe">
        <Icon name="message" size={28} color={colors.vertProfond} />
      </View>
      <Text variant="titre-1" className="mt-[18px] text-[32px] leading-[34px]">
        Entrez le code
      </Text>
      <RNText className="mt-2 font-texte text-[15px] leading-[22px] text-texte-secondaire">
        Nous avons envoyé un code à 6 chiffres {channel === 'whatsapp' ? 'sur WhatsApp' : 'par SMS'} au{' '}
        <RNText className="font-chiffres text-encre">{formatPhone(params.phone ?? '', true)}</RNText>.{' '}
        <RNText className="font-texte-bold text-vert-radar" onPress={() => router.back()}>
          Modifier
        </RNText>
      </RNText>

      <View className="mt-7 flex-row gap-2">
        {digits.map((d, i) => {
          const filled = d !== '';
          const current = !filled && digits.slice(0, i).every((x) => x !== '');
          return (
            <TextInput
              key={i}
              ref={(r) => {
                inputs.current[i] = r;
              }}
              accessibilityLabel={`Chiffre ${i + 1}`}
              value={d}
              onChangeText={(v) => setDigit(i, v)}
              onKeyPress={(e) => {
                if (e.nativeEvent.key === 'Backspace' && !d && i > 0) inputs.current[i - 1]?.focus();
              }}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              autoComplete="sms-otp"
              autoFocus={i === 0}
              maxLength={i === 0 ? LENGTH : 1}
              className={cx(
                'h-[58px] min-w-0 flex-1 rounded-m bg-surface text-center font-chiffres text-[24px] text-encre',
                error
                  ? 'border-2 border-brique'
                  : filled
                    ? 'border-2 border-vert-radar'
                    : current
                      ? 'border-2 border-safran'
                      : 'border border-bordure-champ',
              )}
            />
          );
        })}
      </View>
      {error ? (
        <Text className="mt-3 text-[14px] text-brique" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      {seconds > 0 ? (
        <RNText className="mt-[18px] font-texte text-[14px] text-texte-secondaire">
          Pas reçu ? Nouveau code dans <RNText className="font-chiffres text-encre">{`${mm}:${ss}`}</RNText>
        </RNText>
      ) : (
        <Pressable accessibilityRole="button" onPress={() => resend(channel)} className="mt-3 h-11 justify-center">
          <RNText className="font-texte-bold text-[15px] text-vert-radar">Renvoyer le code</RNText>
        </Pressable>
      )}
      <Pressable
        accessibilityRole="button"
        onPress={() => resend(channel === 'whatsapp' ? 'sms' : 'whatsapp')}
        className="mt-1 h-11 justify-center">
        <RNText className="font-texte-bold text-[15px] text-vert-radar">
          {channel === 'whatsapp' ? 'Recevoir plutôt par SMS' : 'Recevoir plutôt sur WhatsApp'}
        </RNText>
      </Pressable>

      <View className="flex-1" />
      <Button label="Valider et continuer" onPress={submit} disabled={code.length !== LENGTH} loading={loading} />
      <Text variant="legende" className="mt-3 text-center text-texte-secondaire">
        Le code expire après 10 minutes.
      </Text>
    </KeyboardAvoidingView>
  );
}
