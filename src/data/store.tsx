/**
 * État de l'application gardé sur l'appareil (AsyncStorage) en attendant le backend :
 * onboarding vu, session simulée, profil, favoris, avis publiés et recherches récentes.
 * La position de l'utilisateur n'est jamais enregistrée.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { DEFAULT_USER_POSITION, type LatLng } from '@/lib/geo';
import { askPermission, isInKinshasa, readPermission, readPosition, type LocationStatus } from '@/lib/location';

import { getRanking, getReviews } from './repository';
import type { Profile, RankedRestaurant, Review } from './types';

const STORAGE_KEY = 'radar-resto-kin/state/v1';

type Session = { phone: string } | null;

type PersistedState = {
  onboarded: boolean;
  session: Session;
  profile: Profile | null;
  favorites: string[];
  myReviews: Review[];
  /** Dernières recherches, la plus récente d'abord. */
  recentSearches: string[];
};

const MAX_RECENT_SEARCHES = 5;

const INITIAL: PersistedState = {
  onboarded: false,
  session: null,
  profile: null,
  favorites: [],
  myReviews: [],
  recentSearches: [],
};

export function defaultProfile(name: string, phone: string): Profile {
  return {
    name,
    phone,
    commune: null,
    budget: 2,
    cuisines: [],
    memberSince: new Date().toISOString(),
    notifications: { classement: true, reponses: true, offres: false },
    useLocation: true,
    publicName: true,
  };
}

type AppState = PersistedState & {
  hydrated: boolean;
  completeOnboarding: () => void;
  signIn: (phone: string, profile?: Profile) => void;
  signOut: () => void;
  deleteAccount: () => void;
  updateProfile: (patch: Partial<Profile>) => void;
  toggleFavorite: (restaurantId: string) => void;
  addReview: (review: Review) => void;
  addRecentSearch: (query: string) => void;
  clearRecentSearches: () => void;
  location: UserLocation;
  /** Explique puis demande la permission ; renvoie vrai si la position est disponible. */
  requestLocation: () => Promise<boolean>;
  /** Point de départ des distances : la vraie position si possible, sinon la Gombe. */
  userPosition: LatLng;
};

export type UserLocation = {
  status: LocationStatus;
  /** Position mesurée (même hors de Kinshasa). */
  position: LatLng | null;
  outsideKinshasa: boolean;
};

const AppContext = createContext<AppState | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<PersistedState>(INITIAL);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY)
      .then((raw) => {
        if (raw) setState({ ...INITIAL, ...(JSON.parse(raw) as Partial<PersistedState>) });
      })
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state)).catch(() => {});
  }, [state, hydrated]);

  const update = useCallback((fn: (s: PersistedState) => PersistedState) => setState(fn), []);

  const [measured, setLocation] = useState<UserLocation>({ status: 'inconnu', position: null, outsideKinshasa: false });
  const locationAllowed = state.profile?.useLocation ?? true;
  const location = useMemo<UserLocation>(
    () => (locationAllowed ? measured : { status: 'desactivee', position: null, outsideKinshasa: false }),
    [locationAllowed, measured],
  );

  const locate = useCallback(async (status: LocationStatus) => {
    if (status !== 'accordee') {
      setLocation({ status, position: null, outsideKinshasa: false });
      return false;
    }
    const position = await readPosition();
    setLocation({ status, position, outsideKinshasa: position ? !isInKinshasa(position) : false });
    return position !== null;
  }, []);

  // Sans jamais afficher la demande du système : on lit seulement l'état de la permission.
  useEffect(() => {
    if (!hydrated || !locationAllowed) return;
    readPermission().then(locate);
  }, [hydrated, locationAllowed, locate]);

  const requestLocation = useCallback(async () => {
    if (!locationAllowed) update((s) => (s.profile ? { ...s, profile: { ...s.profile, useLocation: true } } : s));
    return locate(await askPermission());
  }, [locationAllowed, locate, update]);

  const userPosition =
    location.position && !location.outsideKinshasa ? location.position : DEFAULT_USER_POSITION;

  const value = useMemo<AppState>(
    () => ({
      ...state,
      hydrated,
      completeOnboarding: () => update((s) => ({ ...s, onboarded: true })),
      signIn: (phone, profile) =>
        update((s) => ({
          ...s,
          onboarded: true,
          session: { phone },
          profile: profile ?? (s.profile?.phone === phone ? s.profile : defaultProfile('Membre', phone)),
        })),
      signOut: () => update((s) => ({ ...s, session: null })),
      deleteAccount: () => update(() => ({ ...INITIAL, onboarded: true })),
      updateProfile: (patch) =>
        update((s) => (s.profile ? { ...s, profile: { ...s.profile, ...patch } } : s)),
      toggleFavorite: (id) =>
        update((s) => ({
          ...s,
          favorites: s.favorites.includes(id) ? s.favorites.filter((f) => f !== id) : [id, ...s.favorites],
        })),
      addReview: (review) => update((s) => ({ ...s, myReviews: [review, ...s.myReviews] })),
      addRecentSearch: (query) => {
        const q = query.trim();
        if (q.length < 2) return;
        update((s) => ({
          ...s,
          recentSearches: [q, ...s.recentSearches.filter((r) => r.toLowerCase() !== q.toLowerCase())].slice(
            0,
            MAX_RECENT_SEARCHES,
          ),
        }));
      },
      clearRecentSearches: () => update((s) => ({ ...s, recentSearches: [] })),
      location,
      requestLocation,
      userPosition,
    }),
    [state, hydrated, update, location, requestLocation, userPosition],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé dans <AppProvider>');
  return ctx;
}

/** Classement complet, recalculé quand l'utilisateur publie un avis ou se déplace. */
export function useRanking(): RankedRestaurant[] | null {
  const { myReviews, userPosition } = useApp();
  const [ranking, setRanking] = useState<RankedRestaurant[] | null>(null);
  useEffect(() => {
    let alive = true;
    getRanking(myReviews, userPosition).then((r) => alive && setRanking(r));
    return () => {
      alive = false;
    };
  }, [myReviews, userPosition]);
  return ranking;
}

export function useRestaurant(id: string | undefined): RankedRestaurant | null | undefined {
  const ranking = useRanking();
  if (!ranking) return undefined;
  return ranking.find((r) => r.id === id) ?? null;
}

export function useReviews(restaurantId: string | undefined): Review[] | null {
  const { myReviews } = useApp();
  const [reviews, setReviews] = useState<Review[] | null>(null);
  useEffect(() => {
    if (!restaurantId) return;
    let alive = true;
    getReviews(restaurantId, myReviews).then((r) => alive && setReviews(r));
    return () => {
      alive = false;
    };
  }, [restaurantId, myReviews]);
  return reviews;
}
