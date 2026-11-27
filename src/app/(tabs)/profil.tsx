import { router } from 'expo-router';
import { Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GuestPrompt } from '@/components/guest-prompt';
import { ReviewScore } from '@/components/restaurant';
import { Icon } from '@/components/ui/icon';
import { IconButton, Text, Thumbnail } from '@/components/ui/primitives';
import { useApp, useRanking } from '@/data/store';
import { CRITERIA, type Review } from '@/data/types';
import { formatMonth, formatPriceLevel, formatRelative, formatScore, initials } from '@/lib/format';
import { colors } from '@/theme/colors';

/** Niveaux d'évaluateur, selon le nombre d'avis vérifiés. */
const LEVELS = [
  { name: 'Nouveau membre', from: 0 },
  { name: 'Évaluateur', from: 3 },
  { name: 'Évaluateur confirmé', from: 8 },
  { name: 'Expert local', from: 20 },
];

function levelFor(verified: number) {
  let index = 0;
  LEVELS.forEach((l, i) => {
    if (verified >= l.from) index = i;
  });
  const current = LEVELS[index];
  const next = LEVELS[index + 1];
  const progress = next ? (verified - current.from) / (next.from - current.from) : 1;
  return { current, next, progress, missing: next ? next.from - verified : 0 };
}

const reviewAverage = (r: Review) => CRITERIA.reduce((s, c) => s + r.ratings[c.key], 0) / CRITERIA.length;

export default function Profil() {
  const insets = useSafeAreaInsets();
  const { session, profile, favorites, myReviews } = useApp();
  const ranking = useRanking();

  if (!session || !profile) {
    return (
      <View className="flex-1 bg-fond" style={{ paddingTop: insets.top + 16 }}>
        <Text variant="titre-1" className="px-5">
          Profil
        </Text>
        <GuestPrompt
          icon="user"
          title="Rejoignez Radar Resto Kin"
          text="Notez les restaurants où vous allez, gardez vos favoris et recevez le classement du mois."
        />
      </View>
    );
  }

  const verified = myReviews.filter((r) => r.verified).length;
  const level = levelFor(verified);
  const favs = (ranking ?? []).filter((r) => favorites.includes(r.id)).slice(0, 3);
  const nameOf = (id: string) => ranking?.find((r) => r.id === id)?.name ?? id;
  const now = new Date();
  const prefs = [
    profile.commune,
    formatPriceLevel(profile.budget),
    ...profile.cuisines.slice(0, 1),
  ].filter(Boolean);

  return (
    <ScrollView className="flex-1 bg-fond" contentContainerStyle={{ paddingBottom: 24 }}>
      <View className="bg-nuit px-5 pb-5" style={{ paddingTop: insets.top + 16 }}>
        <View className="flex-row items-center gap-[14px]">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-vert-radar">
            <RNText className="font-titre text-[26px] text-sur-vert">{initials(profile.name) || 'RK'}</RNText>
          </View>
          <View className="min-w-0 flex-1">
            <Text variant="titre-2" className="text-[26px] leading-[28px] text-surface" numberOfLines={1}>
              {profile.name}
            </Text>
            <Text variant="legende" className="text-texte-sur-nuit">
              {profile.commune ? `${profile.commune} · ` : ''}membre depuis {formatMonth(new Date(profile.memberSince)).toLowerCase()}
            </Text>
          </View>
          <IconButton icon="settings" label="Paramètres" tone="sombre" onPress={() => router.push('/parametres')} />
        </View>
        <View className="mt-5 flex-row gap-2">
          {[
            [myReviews.length, 'avis publiés'],
            [verified, 'visites vérifiées'],
            [favorites.length, 'favoris'],
          ].map(([value, label]) => (
            <View key={label} className="flex-1 rounded-m bg-nuit-2 px-3 py-[10px]">
              <RNText className="font-chiffres text-[22px] text-surface">{value}</RNText>
              <RNText className="font-texte text-legende text-texte-sur-nuit">{label}</RNText>
            </View>
          ))}
        </View>
      </View>

      <View className="mx-5 mt-4 flex-row items-center gap-3 rounded-l bg-surface p-4">
        <View className="h-11 w-11 items-center justify-center rounded-full bg-menthe">
          <Icon name="award" size={22} color={colors.vertProfond} />
        </View>
        <View className="flex-1 gap-[6px]">
          <Text variant="libelle">{level.current.name}</Text>
          <View className="h-2 overflow-hidden rounded-full bg-bordure">
            <View className="h-2 rounded-full bg-vert-radar" style={{ width: `${Math.round(level.progress * 100)}%` }} />
          </View>
          <Text variant="legende" className="text-texte-secondaire">
            {level.next
              ? `Encore ${level.missing} avis vérifié${level.missing > 1 ? 's' : ''} pour devenir ${level.next.name}`
              : 'Vous avez atteint le plus haut niveau.'}
          </Text>
        </View>
      </View>

      <View className="mt-5 px-5">
        <View className="flex-row items-baseline justify-between">
          <Text variant="titre-2">Mes favoris</Text>
          {favorites.length > 0 ? (
            <Pressable accessibilityRole="link" onPress={() => router.navigate('/favoris')}>
              <Text className="font-texte-semi text-legende text-vert-radar">Tout voir ({favorites.length})</Text>
            </Pressable>
          ) : null}
        </View>
        {favs.length > 0 ? (
          <View className="mt-3 flex-row gap-[10px]">
            {favs.map((r) => (
              <Pressable
                key={r.id}
                accessibilityRole="link"
                onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: r.id } })}
                className="flex-1 gap-[6px] rounded-m bg-surface p-[10px]">
                <Thumbnail name={r.name} size={56} className="w-full" />
                <Text className="font-texte-bold text-[14px] leading-[18px]" numberOfLines={2}>
                  {r.name}
                </Text>
                <RNText className="font-chiffres text-[14px] text-vert-radar">{formatScore(r.score.total)}</RNText>
              </Pressable>
            ))}
          </View>
        ) : (
          <Text variant="legende" className="mt-2 text-texte-secondaire">
            Aucun favori pour l’instant.
          </Text>
        )}
      </View>

      <View className="mt-5 px-5">
        <Text variant="titre-2">Mes derniers avis</Text>
        {myReviews.length === 0 ? (
          <Text variant="legende" className="mt-2 text-texte-secondaire">
            Vous n’avez pas encore donné d’avis. Ouvrez la fiche d’un restaurant pour le noter.
          </Text>
        ) : (
          myReviews.slice(0, 3).map((r) => (
            <Pressable
              key={r.id}
              accessibilityRole="link"
              onPress={() => router.push({ pathname: '/restaurant/[id]', params: { id: r.restaurantId } })}
              className="flex-row items-center border-b border-bordure py-3">
              <View className="flex-1">
                <Text variant="libelle">{nameOf(r.restaurantId)}</Text>
                <Text variant="legende" className="text-texte-secondaire">
                  {formatRelative(r.createdAt, now)}
                  {r.verified ? ' · Visite vérifiée' : ''}
                </Text>
              </View>
              <ReviewScore value={reviewAverage(r)} />
            </Pressable>
          ))
        )}
      </View>

      <View className="mx-5 mt-5 overflow-hidden rounded-l bg-surface">
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push('/parametres')}
          className="h-[52px] flex-row items-center justify-between border-b border-bordure px-4">
          <Text className="text-[15px]">Mes préférences{prefs.length ? ` · ${prefs.join(', ')}` : ''}</Text>
          <Icon name="chevron-right" size={18} color={colors.texteSecondaire} />
        </Pressable>
        <Pressable
          accessibilityRole="link"
          onPress={() => router.push('/parametres')}
          className="h-[52px] flex-row items-center justify-between px-4">
          <Text className="text-[15px]">Confidentialité et position</Text>
          <Icon name="chevron-right" size={18} color={colors.texteSecondaire} />
        </Pressable>
      </View>
    </ScrollView>
  );
}
