/**
 * État de l'application gardé sur l'appareil (AsyncStorage) en attendant le backend :
 * onboarding vu, session simulée, profil, favoris et avis publiés.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

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
};

const INITIAL: PersistedState = {
  onboarded: false,
  session: null,
  profile: null,
  favorites: [],
  myReviews: [],
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
    }),
    [state, hydrated, update],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp(): AppState {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp doit être utilisé dans <AppProvider>');
  return ctx;
}

/** Classement complet, recalculé quand l'utilisateur publie un avis. */
export function useRanking(): RankedRestaurant[] | null {
  const { myReviews } = useApp();
  const [ranking, setRanking] = useState<RankedRestaurant[] | null>(null);
  useEffect(() => {
    let alive = true;
    getRanking(myReviews).then((r) => alive && setRanking(r));
    return () => {
      alive = false;
    };
  }, [myReviews]);
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
