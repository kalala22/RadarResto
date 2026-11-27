import { router, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { DirectionsSheet } from '@/components/directions-sheet';
import { AMENITY_LABELS, PAYMENT_LABELS } from '@/components/labels';
import { CriteriaBar, ReviewScore } from '@/components/restaurant';
import { Icon } from '@/components/ui/icon';
import { BackButton, Button, IconButton, ScoreBadge, Tag, Text, Thumbnail } from '@/components/ui/primitives';
import { useApp, useRestaurant, useReviews } from '@/data/store';
import { CRITERIA, type Review } from '@/data/types';
import { formatDistance, formatHours, formatOpening, formatPriceLevel, formatPriceRange, formatScore } from '@/lib/format';
import { driveMinutes } from '@/lib/geo';
import { callRestaurant, shareRestaurant } from '@/lib/links';
import { colors } from '@/theme/colors';

const avg = (r: Review) => CRITERIA.reduce((s, c) => s + r.ratings[c.key], 0) / CRITERIA.length;

export default function Fiche() {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const restaurant = useRestaurant(id);
  const reviews = useReviews(id);
  const { favorites, toggleFavorite, session, location } = useApp();
  const [directionsOpen, setDirectionsOpen] = useState(false);

  if (restaurant === undefined) {
    return (
      <View className="flex-1 items-center justify-center bg-fond">
        <ActivityIndicator color={colors.vertRadar} />
      </View>
    );
  }
  if (restaurant === null) {
    return (
      <View className="flex-1 items-center justify-center gap-3 bg-fond px-8">
        <Text variant="titre-2">Restaurant introuvable</Text>
        <Button label="Retour au classement" onPress={() => router.replace('/classement')} />
      </View>
    );
  }

  const isFav = favorites.includes(restaurant.id);
  const now = new Date();
  const latest = reviews?.[0];
  const isTop = restaurant.cityRank === 1;

  return (
    <View className="flex-1 bg-fond">
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View className="h-[200px] items-center justify-center bg-nuit-3" style={{ paddingTop: insets.top }}>
          <Thumbnail name={restaurant.name} size={88} dark />
          <Text variant="legende" className="mt-2 text-texte-sur-nuit">
            Photos du restaurant bientôt disponibles
          </Text>
          <View className="absolute left-4" style={{ top: insets.top + 12 }}>
            <BackButton />
          </View>
          <View className="absolute right-4 flex-row gap-2" style={{ top: insets.top + 12 }}>
            <IconButton icon="share" label="Partager" onPress={() => shareRestaurant(restaurant)} />
            <IconButton
              icon={isFav ? 'heart-filled' : 'heart'}
              color={isFav ? colors.vertRadar : colors.encre}
              label={isFav ? 'Retirer des favoris' : 'Ajouter aux favoris'}
              onPress={() => (session ? toggleFavorite(restaurant.id) : router.push('/login'))}
            />
          </View>
        </View>

        <View className="mx-4 -mt-7 flex-row items-start gap-3 rounded-l bg-surface p-4">
          <View className="min-w-0 flex-1">
            <RNText className="font-chiffres text-surtitre text-safran-texte">
              N° {restaurant.cityRank} DE LA VILLE · N° {restaurant.communeRank} À {restaurant.commune.toUpperCase()}
            </RNText>
            <Text variant="titre-1" className="mt-[2px] text-[26px] leading-[28px]">
              {restaurant.name}
            </Text>
            <Text className="mt-1 text-[14px] text-texte-secondaire">
              {restaurant.cuisine} · {formatPriceLevel(restaurant.priceLevel)} (
              {formatPriceRange(restaurant.priceMin, restaurant.priceMax, restaurant.currency)}) ·{' '}
              {formatOpening(restaurant.hours, now)}
            </Text>
          </View>
          <ScoreBadge value={restaurant.score.total} size={60} safran={isTop} />
        </View>

        <View className="gap-4 px-5 pt-4">
          <View className="gap-2">
            <Text className="font-texte-bold text-[15px]">Détail de la cote</Text>
            {CRITERIA.map((c) => (
              <CriteriaBar key={c.key} label={c.label} value={restaurant.score.criteria[c.key]} />
            ))}
            <Text variant="legende" className="text-[12px] text-texte-secondaire">
              Note de l’équipe {formatScore(restaurant.score.team)} · {restaurant.score.reviewCount} avis clients{' '}
              {restaurant.score.reviewCount > 0 ? `${formatScore(restaurant.score.reviewAverage)}/5` : ''} · Tendance{' '}
              {formatScore(restaurant.score.trend)}
            </Text>
          </View>

          <View className="gap-2">
            <Text className="font-texte-bold text-[15px]">À goûter</Text>
            <View className="flex-row flex-wrap gap-[6px]">
              {restaurant.dishes.map((d) => (
                <Tag key={d} label={d} />
              ))}
            </View>
          </View>

          <View className="gap-2">
            <Text className="font-texte-bold text-[15px]">Sur place</Text>
            <View className="flex-row flex-wrap gap-[6px]">
              {restaurant.amenities.map((a) => (
                <Tag key={a} label={AMENITY_LABELS[a]} />
              ))}
            </View>
            <Text variant="legende" className="text-texte-secondaire">
              Paiement : {restaurant.payments.map((p) => PAYMENT_LABELS[p]).join(', ')}
            </Text>
          </View>

          <View className="flex-row items-start gap-[10px]">
            <View className="mt-[2px]">
              <Icon name="clock" size={18} color={colors.vertRadar} />
            </View>
            <View className="flex-1">
              <Text className="text-[14px]">Tous les jours, {formatHours(restaurant.hours)}</Text>
              <Text variant="legende" className="text-texte-secondaire">
                {formatOpening(restaurant.hours, now)}
              </Text>
            </View>
          </View>

          <View className="flex-row items-start gap-[10px]">
            <View className="mt-[2px]">
              <Icon name="pin" size={18} color={colors.vertRadar} />
            </View>
            <View className="flex-1">
              <Text className="text-[14px]">
                {restaurant.address}, {restaurant.commune}
              </Text>
              <Text variant="legende" className="text-texte-secondaire">
                Repère : {restaurant.landmark}
              </Text>
              <Text variant="legende" className="text-texte-secondaire">
                {formatDistance(restaurant.distanceKm)} · environ {driveMinutes(restaurant.distanceKm)} min en voiture
                {location.status === 'accordee' && !location.outsideKinshasa ? '' : ' depuis la Gombe'}
              </Text>
            </View>
          </View>

          <View className="border-t border-bordure pt-3">
            <View className="flex-row items-baseline justify-between">
              <Text className="font-texte-bold text-[15px]">Avis récents</Text>
              {reviews && reviews.length > 0 ? (
                <Pressable
                  accessibilityRole="link"
                  onPress={() => router.push({ pathname: '/restaurant/[id]/avis-liste', params: { id: restaurant.id } })}
                  className="h-11 justify-center">
                  <Text className="font-texte-semi text-legende text-vert-radar">Voir les {reviews.length}</Text>
                </Pressable>
              ) : null}
            </View>
            {latest ? (
              <View className="mt-1">
                <View className="flex-row items-center gap-2">
                  <Text className="font-texte-bold text-[14px]">{latest.authorName}</Text>
                  <ReviewScore value={avg(latest)} />
                  {latest.verified ? <Tag label="Visite vérifiée" /> : null}
                </View>
                <Text className="mt-[2px] text-[14px] text-encre" numberOfLines={2}>
                  {latest.comment}
                </Text>
              </View>
            ) : (
              <Text variant="legende" className="mt-1 text-texte-secondaire">
                Pas encore d’avis. Soyez le premier à noter ce restaurant.
              </Text>
            )}
          </View>
        </View>
      </ScrollView>

      <View
        className="flex-row gap-2 border-t border-bordure bg-surface px-4 pt-3"
        style={{ paddingBottom: insets.bottom + 12 }}>
        <View className="flex-1">
          <Button label="Appeler" variant="secondaire" size="m" onPress={() => callRestaurant(restaurant.phone)} />
        </View>
        <View className="flex-1">
          <Button label="Itinéraire" variant="secondaire" size="m" onPress={() => setDirectionsOpen(true)} />
        </View>
        <View className="flex-1">
          <Button
            label="Donner un avis"
            size="m"
            onPress={() => router.push({ pathname: '/restaurant/[id]/avis', params: { id: restaurant.id } })}
          />
        </View>
      </View>
      <DirectionsSheet restaurant={restaurant} open={directionsOpen} onClose={() => setDirectionsOpen(false)} />
    </View>
  );
}
