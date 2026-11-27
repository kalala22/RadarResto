import { Pressable, Text as RNText, View } from 'react-native';

import type { OtpChannel } from '@/data/types';

import { cx } from './ui/primitives';

/** Choix du canal d'envoi du code : WhatsApp ou SMS. */
export function ChannelPicker({ value, onChange }: { value: OtpChannel; onChange: (c: OtpChannel) => void }) {
  const options: [OtpChannel, string][] = [
    ['whatsapp', 'WhatsApp'],
    ['sms', 'SMS'],
  ];
  return (
    <View className="flex-row gap-2" accessibilityRole="radiogroup" accessibilityLabel="Recevoir le code par">
      {options.map(([id, label]) => {
        const active = value === id;
        return (
          <Pressable
            key={id}
            accessibilityRole="radio"
            accessibilityState={{ selected: active }}
            onPress={() => onChange(id)}
            className={cx(
              'h-12 flex-1 items-center justify-center rounded-m',
              active ? 'border-2 border-vert-radar bg-menthe' : 'border border-bordure-champ bg-surface',
            )}>
            <RNText className={cx('text-[15px]', active ? 'font-texte-bold text-vert-profond' : 'font-texte text-encre')}>
              {label}
            </RNText>
          </Pressable>
        );
      })}
    </View>
  );
}
