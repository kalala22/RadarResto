import { Host, Picker, Switch } from '@expo/ui';
import { router } from 'expo-router';
import { useState, type ReactNode } from 'react';
import { Pressable, ScrollView, Text as RNText, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { BackButton, Button, Text, cx } from '@/components/ui/primitives';
import { useApp } from '@/data/store';
import { COMMUNES, type Budget, type Profile } from '@/data/types';
import { formatPhone } from '@/lib/format';
import { colors } from '@/theme/colors';

const CUISINES = ['Congolaise', 'Libanaise', 'Asiatique', 'Italienne', 'Grillades', 'Poissons', 'Brasserie', 'Burgers'];
const BUDGETS: { value: Budget; label: string }[] = [
  { value: 1, label: '$ (moins de 10 $)' },
  { value: 2, label: '$$ (10–25 $)' },
  { value: 3, label: '$$$ (plus de 25 $)' },
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View className="gap-2">
      <RNText className="px-1 font-chiffres text-surtitre text-texte-secondaire">{title}</RNText>
      <View className="overflow-hidden rounded-l bg-surface">{children}</View>
    </View>
  );
}

function Row({ label, hint, children, first }: { label: string; hint?: string; children: ReactNode; first?: boolean }) {
  return (
    <View className={cx('min-h-[56px] flex-row items-center gap-3 px-4 py-2', !first && 'border-t border-bordure')}>
      <View className="flex-1">
        <Text className="text-[15px]">{label}</Text>
        {hint ? (
          <Text variant="legende" className="text-texte-secondaire">
            {hint}
          </Text>
        ) : null}
      </View>
      {children}
    </View>
  );
}

/** Interrupteur natif (Expo UI : SwiftUI sur iOS, Jetpack Compose sur Android). */
function Toggle({ value, onChange }: { value: boolean; onChange: (v: boolean) => void }) {
  return (
    <Host matchContents colorScheme="light" seedColor={colors.vertRadar}>
      <Switch value={value} onValueChange={onChange} />
    </Host>
  );
}

export default function Parametres() {
  const insets = useSafeAreaInsets();
  const { profile, session, updateProfile, signOut, deleteAccount } = useApp();
  const [confirmDelete, setConfirmDelete] = useState(false);

  if (!session || !profile) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-fond px-8">
        <Text variant="titre-2">Connectez-vous pour voir vos paramètres</Text>
        <Button label="Se connecter" onPress={() => router.replace('/login')} />
      </View>
    );
  }

  const setNotif = (key: keyof Profile['notifications'], v: boolean) =>
    updateProfile({ notifications: { ...profile.notifications, [key]: v } });

  const toggleCuisine = (c: string) =>
    updateProfile({
      cuisines: profile.cuisines.includes(c) ? profile.cuisines.filter((x) => x !== c) : [...profile.cuisines, c],
    });

  return (
    <ScrollView className="flex-1 bg-fond" contentContainerStyle={{ paddingBottom: insets.bottom + 32 }}>
      <View className="flex-row items-center gap-3 px-4 pb-2" style={{ paddingTop: insets.top + 16 }}>
        <BackButton label="Retour au profil" />
        <Text variant="titre-1">Paramètres</Text>
      </View>

      <View className="gap-5 px-4 pt-3">
        <Section title="COMPTE">
          <Row label="Nom affiché" first>
            <TextInput
              accessibilityLabel="Nom affiché"
              value={profile.name}
              onChangeText={(name) => updateProfile({ name })}
              className="min-w-[140px] text-right font-texte text-[15px] text-texte-secondaire"
            />
          </Row>
          <Row label="Téléphone">
            <RNText className="font-chiffres-medium text-[14px] text-texte-secondaire">
              {formatPhone(profile.phone, true)} · <RNText className="text-vert-radar">vérifié</RNText>
            </RNText>
          </Row>
        </Section>

        <Section title="MES PRÉFÉRENCES">
          <Row label="Quartier préféré" first>
            <Host matchContents colorScheme="light" seedColor={colors.vertRadar}>
              <Picker
                selectedValue={profile.commune ?? 'aucun'}
                onValueChange={(v) => updateProfile({ commune: v === 'aucun' ? null : (v as Profile['commune']) })}
                accessibilityLabel="Quartier préféré">
                <Picker.Item label="Aucun" value="aucun" />
                {COMMUNES.map((c) => (
                  <Picker.Item key={c} label={c} value={c} />
                ))}
              </Picker>
            </Host>
          </Row>
          <Row label="Budget habituel">
            <Host matchContents colorScheme="light" seedColor={colors.vertRadar}>
              <Picker
                selectedValue={profile.budget}
                onValueChange={(v) => updateProfile({ budget: Number(v) as Budget })}
                accessibilityLabel="Budget habituel">
                {BUDGETS.map((b) => (
                  <Picker.Item key={b.value} label={b.label} value={b.value} />
                ))}
              </Picker>
            </Host>
          </Row>
          <View className="gap-2 border-t border-bordure px-4 py-3">
            <Text className="text-[15px]">Cuisines aimées</Text>
            <View className="flex-row flex-wrap gap-2">
              {CUISINES.map((c) => {
                const on = profile.cuisines.includes(c);
                return (
                  <Pressable
                    key={c}
                    accessibilityRole="checkbox"
                    accessibilityState={{ checked: on }}
                    onPress={() => toggleCuisine(c)}
                    className={cx(
                      'h-9 justify-center rounded-full px-3',
                      on ? 'bg-vert-radar' : 'border border-bordure-champ bg-surface',
                    )}>
                    <RNText className={cx('text-[14px]', on ? 'font-texte-semi text-sur-vert' : 'font-texte text-encre')}>
                      {c}
                    </RNText>
                  </Pressable>
                );
              })}
            </View>
          </View>
          <Row label="Langue">
            <Text className="text-[15px] text-texte-secondaire">Français</Text>
          </Row>
        </Section>

        <Section title="NOTIFICATIONS ET CONFIDENTIALITÉ">
          <Row label="Nouveau classement du mois" hint="Chaque début de mois" first>
            <Toggle value={profile.notifications.classement} onChange={(v) => setNotif('classement', v)} />
          </Row>
          <Row label="Réponses à mes avis" hint="Quand un restaurant vous répond (bientôt)">
            <Toggle value={profile.notifications.reponses} onChange={(v) => setNotif('reponses', v)} />
          </Row>
          <Row label="Offres des restaurants" hint="Promotions près de vous">
            <Toggle value={profile.notifications.offres} onChange={(v) => setNotif('offres', v)} />
          </Row>
          <Row label="Utiliser ma position" hint="Seulement quand l’app est ouverte">
            <Toggle value={profile.useLocation} onChange={(v) => updateProfile({ useLocation: v })} />
          </Row>
          <Row label="Avis publiés avec mon nom" hint="Sinon : « Membre vérifié »">
            <Toggle value={profile.publicName} onChange={(v) => updateProfile({ publicName: v })} />
          </Row>
        </Section>

        <View className="gap-1">
          <Button
            label="Se déconnecter"
            variant="secondaire"
            size="m"
            onPress={() => {
              signOut();
              router.replace('/classement');
            }}
          />
          {confirmDelete ? (
            <View className="mt-2 gap-2 rounded-l border border-brique bg-surface p-4">
              <Text className="text-[15px]">
                Supprimer votre compte efface votre profil, vos favoris et vos avis sur ce téléphone. Continuer ?
              </Text>
              <View className="flex-row gap-2">
                <View className="flex-1">
                  <Button label="Annuler" variant="secondaire" size="m" onPress={() => setConfirmDelete(false)} />
                </View>
                <View className="flex-1">
                  <Pressable
                    accessibilityRole="button"
                    onPress={() => {
                      deleteAccount();
                      router.replace('/classement');
                    }}
                    className="h-12 items-center justify-center rounded-m bg-brique">
                    <RNText className="font-texte-bold text-libelle text-surface">Supprimer</RNText>
                  </Pressable>
                </View>
              </View>
            </View>
          ) : (
            <Button label="Supprimer mon compte" variant="danger" size="m" onPress={() => setConfirmDelete(true)} />
          )}
        </View>
      </View>
    </ScrollView>
  );
}
