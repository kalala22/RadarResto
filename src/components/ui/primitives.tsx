/**
 * Composants de base de la charte : texte, boutons, puces, badges, champs.
 * Mise en forme avec les classes Tailwind (NativeWind) issues de tailwind.config.js.
 */
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { ActivityIndicator, Pressable, Text as RNText, TextInput, View, type TextProps } from 'react-native';

import { formatScore, initials } from '@/lib/format';
import { colors } from '@/theme/colors';

import { Icon, type IconName } from './icon';

const cx = (...parts: (string | false | null | undefined)[]) => parts.filter(Boolean).join(' ');

type Variant =
  | 'affiche'
  | 'titre-1'
  | 'titre-2'
  | 'corps'
  | 'corps-bold'
  | 'libelle'
  | 'legende'
  | 'cote'
  | 'surtitre';

const VARIANTS: Record<Variant, string> = {
  affiche: 'font-titre text-affiche',
  'titre-1': 'font-titre text-titre-1',
  'titre-2': 'font-titre text-titre-2',
  corps: 'font-texte text-corps',
  'corps-bold': 'font-texte-bold text-corps',
  libelle: 'font-texte-bold text-libelle',
  legende: 'font-texte text-legende',
  cote: 'font-chiffres text-cote',
  surtitre: 'font-chiffres text-surtitre uppercase',
};

/** Texte de la charte. Couleur par défaut : encre. */
export function Text({
  variant = 'corps',
  className,
  ...props
}: TextProps & { variant?: Variant; className?: string }) {
  return <RNText className={cx('text-encre', VARIANTS[variant], className)} {...props} />;
}

type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: 'principal' | 'secondaire' | 'texte' | 'danger';
  icon?: IconName;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
  size?: 'l' | 'm';
};

export function Button({
  label,
  onPress,
  variant = 'principal',
  icon,
  disabled,
  loading,
  className,
  size = 'l',
}: ButtonProps) {
  const base = cx(
    'flex-row items-center justify-center gap-2 rounded-m px-4',
    size === 'l' ? 'h-[52px]' : 'h-12',
    variant === 'principal' && 'bg-vert-radar',
    variant === 'secondaire' && 'border border-bordure-champ bg-surface',
    variant === 'texte' && 'bg-transparent',
    variant === 'danger' && 'bg-transparent',
    (disabled || loading) && 'opacity-50',
    className,
  );
  const textColor =
    variant === 'principal'
      ? 'text-sur-vert'
      : variant === 'texte'
        ? 'text-vert-radar'
        : variant === 'danger'
          ? 'text-brique'
          : 'text-encre';
  const iconColor = variant === 'principal' ? colors.surface : variant === 'texte' ? colors.vertRadar : colors.encre;
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: !!disabled }}
      disabled={disabled || loading}
      onPress={onPress}
      className={cx(base, 'active:opacity-80')}>
      {loading ? (
        <ActivityIndicator color={iconColor} />
      ) : (
        <>
          {icon ? <Icon name={icon} size={18} color={iconColor} /> : null}
          <RNText className={cx('font-texte-bold', size === 'l' ? 'text-[16px]' : 'text-libelle', textColor)}>
            {label}
          </RNText>
        </>
      )}
    </Pressable>
  );
}

/** Puce de filtre (arrondi complet). */
export function Chip({
  label,
  active,
  onPress,
  tone = 'clair',
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
  tone?: 'clair' | 'carte';
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ selected: !!active }}
      onPress={onPress}
      className={cx(
        'h-9 justify-center rounded-full px-[14px]',
        active
          ? tone === 'carte'
            ? 'bg-nuit'
            : 'bg-vert-radar'
          : tone === 'carte'
            ? 'bg-surface'
            : 'border border-bordure-champ bg-surface',
      )}>
      <RNText className={cx('text-[14px]', active ? 'font-texte-semi text-surface' : 'font-texte text-encre')}>
        {label}
      </RNText>
    </Pressable>
  );
}

/** Pastille de cote sur 10. `safran` est réservé au N° 1 : un seul par écran. */
export function ScoreBadge({ value, size = 56, safran }: { value: number; size?: number; safran?: boolean }) {
  return (
    <View
      accessibilityLabel={`Cote ${formatScore(value)} sur 10`}
      style={{ width: size, height: size }}
      className={cx('items-center justify-center rounded-m', safran ? 'bg-safran' : 'bg-vert-radar')}>
      <RNText
        className={cx('font-chiffres', safran ? 'text-sur-safran' : 'text-sur-vert')}
        style={{ fontSize: size * 0.36, lineHeight: size * 0.4 }}>
        {formatScore(value)}
      </RNText>
      <RNText className={cx('font-texte-bold text-[10px]', safran ? 'text-sur-safran' : 'text-sur-vert')}>/10</RNText>
    </View>
  );
}

/** Badge en menthe (équipements, « Visite vérifiée »). */
export function Tag({ label, icon }: { label: string; icon?: IconName }) {
  return (
    <View className="flex-row items-center gap-1 self-start rounded-s bg-menthe px-[10px] py-[5px]">
      {icon ? <Icon name={icon} size={14} color={colors.vertProfond} /> : null}
      <RNText className="font-texte-semi text-legende text-vert-profond">{label}</RNText>
    </View>
  );
}

/** Vignette en attendant les photos : initiales du restaurant sur aplat. */
export function Thumbnail({
  name,
  size = 48,
  dark,
  className,
}: {
  name: string;
  size?: number;
  dark?: boolean;
  className?: string;
}) {
  return (
    <View
      style={{ width: size, height: size }}
      className={cx('items-center justify-center rounded-s', dark ? 'bg-nuit-3' : 'bg-vignette', className)}>
      <RNText
        className={cx('font-titre', dark ? 'text-texte-sur-nuit' : 'text-texte-secondaire')}
        style={{ fontSize: Math.round(size * 0.34) }}>
        {initials(name)}
      </RNText>
    </View>
  );
}

/** Bouton rond de retour (44 px). */
export function BackButton({ tone = 'clair', label = 'Retour' }: { tone?: 'clair' | 'sombre'; label?: string }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={() => (router.canGoBack() ? router.back() : router.replace('/'))}
      className={cx(
        'h-11 w-11 items-center justify-center rounded-full',
        tone === 'sombre' ? 'bg-nuit-2' : 'bg-surface',
      )}>
      <Icon name="back" size={20} color={tone === 'sombre' ? colors.surface : colors.encre} />
    </Pressable>
  );
}

export function IconButton({
  icon,
  label,
  onPress,
  tone = 'clair',
  color,
}: {
  icon: IconName;
  label: string;
  onPress?: () => void;
  tone?: 'clair' | 'sombre';
  color?: string;
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      className={cx(
        'h-11 w-11 items-center justify-center rounded-full',
        tone === 'sombre' ? 'bg-nuit-2' : 'bg-surface',
      )}>
      <Icon name={icon} size={20} color={color ?? (tone === 'sombre' ? colors.surface : colors.encre)} />
    </Pressable>
  );
}

/** Champ de saisie avec libellé. */
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <View className="gap-[6px]">
      <RNText className="font-texte-semi text-[14px] text-encre">
        {label}
        {hint ? <RNText className="font-texte text-texte-secondaire"> {hint}</RNText> : null}
      </RNText>
      {children}
    </View>
  );
}

export function Input(props: React.ComponentProps<typeof TextInput> & { className?: string }) {
  const { className, ...rest } = props;
  return (
    <TextInput
      placeholderTextColor={colors.texteSecondaire}
      className={cx(
        'h-[52px] rounded-m border border-bordure-champ bg-surface px-[14px] font-texte text-[16px] text-encre',
        className,
      )}
      {...rest}
    />
  );
}

/** Numéro congolais : indicatif +243 fixe, puis 9 chiffres. */
export function PhoneInput({
  value,
  onChangeText,
}: {
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <View className="flex-row gap-2">
      <View className="h-[52px] justify-center rounded-m border border-bordure-champ bg-surface px-3">
        <RNText className="font-chiffres-medium text-[15px] text-encre">+243</RNText>
      </View>
      <TextInput
        accessibilityLabel="Numéro de téléphone"
        value={value}
        onChangeText={onChangeText}
        placeholder="81 234 5678"
        placeholderTextColor={colors.texteSecondaire}
        keyboardType="phone-pad"
        autoComplete="tel"
        maxLength={12}
        className="h-[52px] flex-1 rounded-m border border-bordure-champ bg-surface px-[14px] font-chiffres-medium text-[17px] text-encre"
      />
    </View>
  );
}

export function Divider({ className }: { className?: string }) {
  return <View className={cx('h-px bg-bordure', className)} />;
}

export { cx };
