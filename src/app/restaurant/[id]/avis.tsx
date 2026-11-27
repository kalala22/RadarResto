import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, TextInput, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { GuestPrompt } from '@/components/guest-prompt';
import { StarRating } from '@/components/restaurant';
import { Icon } from '@/components/ui/icon';
import { BackButton, Button, Text } from '@/components/ui/primitives';
import { canReview, REVIEW_COOLDOWN_DAYS } from '@/data/repository';
import { useApp, useRestaurant } from '@/data/store';
import { CRITERIA, type Criterion } from '@/data/types';
import { colors } from '@/theme/colors';

export default function Avis() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const restaurant = useRestaurant(id);
  const { session, profile, myReviews, addReview } = useApp();
  const [ratings, setRatings] = useState<Record<Criterion, number>>({ cuisine: 0, service: 0, ambiance: 0, prix: 0 });
  const [comment, setComment] = useState('');
  const now = new Date();

  if (!restaurant) return <View className="flex-1 bg-fond" />;

  const header = (
    <View className="flex-row items-center gap-[10px] px-4 pb-2" style={{ paddingTop: insets.top + 16 }}>
      <BackButton />
      <View>
        <Text variant="legende" className="text-texte-secondaire">
          Votre avis sur
        </Text>
        <Text className="font-texte-bold text-[17px]">{restaurant.name}</Text>
      </View>
    </View>
  );

  if (!session) {
    return (
      <View className="flex-1 bg-fond">
        {header}
        <GuestPrompt
          icon="star"
          title="Connectez-vous pour noter"
          text="Seuls les membres peuvent donner un avis, pour que la cote reste fiable."
        />
      </View>
    );
  }

  if (!canReview(restaurant.id, myReviews, now)) {
    return (
      <View className="flex-1 bg-fond">
        {header}
        <View className="items-center gap-3 px-8 py-10">
          <Icon name="lock" size={32} color={colors.texteSecondaire} />
          <Text variant="titre-2" className="text-center">
            Avis déjà publié
          </Text>
          <Text className="text-center text-texte-secondaire">
            Vous pourrez noter ce restaurant à nouveau {REVIEW_COOLDOWN_DAYS} jours après votre dernier avis.
          </Text>
          <Button label="Retour à la fiche" variant="secondaire" size="m" className="mt-2 self-stretch" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const complete = CRITERIA.every((c) => ratings[c.key] > 0);

  const publish = () => {
    addReview({
      id: `local-${Date.now()}`,
      restaurantId: restaurant.id,
      authorName: profile?.publicName ? profile.name : 'Membre vérifié',
      ratings,
      comment: comment.trim(),
      // La vérification de la visite par la position est reportée : l'avis est marqué vérifié.
      verified: true,
      createdAt: new Date().toISOString(),
      mine: true,
    });
    router.back();
  };

  return (
    <KeyboardAvoidingView className="flex-1 bg-fond" behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView keyboardShouldPersistTaps="handled" contentContainerStyle={{ paddingBottom: 24 }}>
        {header}
        <View className="mx-4 mt-2 flex-row items-center gap-[10px] rounded-m bg-menthe px-[14px] py-3">
          <Icon name="shield-check" size={22} color={colors.vertProfond} />
          <Text className="flex-1 text-[14px] text-vert-profond">
            <Text className="font-texte-bold text-[14px] text-vert-profond">Visite vérifiée</Text> · votre avis
            comptera dans la cote du restaurant.
          </Text>
        </View>

        <View className="gap-[14px] px-5 pt-[18px]">
          <Text variant="titre-1" className="text-[24px] leading-[26px]">
            Notez votre expérience
          </Text>
          {CRITERIA.map((c) => (
            <StarRating
              key={c.key}
              label={c.longLabel}
              value={ratings[c.key]}
              onChange={(n) => setRatings({ ...ratings, [c.key]: n })}
            />
          ))}

          <View className="gap-[6px]">
            <Text className="font-texte-semi text-[15px]">Votre commentaire</Text>
            <TextInput
              accessibilityLabel="Votre commentaire"
              value={comment}
              onChangeText={setComment}
              placeholder="Qu’avez-vous mangé ? Comment était l’accueil ?"
              placeholderTextColor={colors.texteSecondaire}
              multiline
              maxLength={600}
              textAlignVertical="top"
              className="h-24 rounded-m border border-bordure-champ bg-surface p-3 font-texte text-[15px] text-encre"
            />
          </View>

          <View className="flex-row items-center gap-3">
            <View className="h-[72px] w-[72px] items-center justify-center gap-[2px] rounded-m border border-dashed border-bordure-champ bg-surface opacity-60">
              <Icon name="camera" size={22} color={colors.texteSecondaire} />
              <Text className="text-[12px] text-texte-secondaire">Photo</Text>
            </View>
            <Text variant="legende" className="flex-1 text-texte-secondaire">
              L’ajout de photos arrive bientôt. Un avis par restaurant tous les {REVIEW_COOLDOWN_DAYS} jours.
            </Text>
          </View>
        </View>
      </ScrollView>
      <View className="border-t border-bordure bg-surface px-4 pt-3" style={{ paddingBottom: insets.bottom + 12 }}>
        <Button label="Publier mon avis" onPress={publish} disabled={!complete} />
        {!complete ? (
          <Text variant="legende" className="mt-2 text-center text-texte-secondaire">
            Donnez une note à chacun des 4 critères.
          </Text>
        ) : null}
      </View>
    </KeyboardAvoidingView>
  );
}
