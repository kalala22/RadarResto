export type Commune =
  | 'Gombe'
  | 'Ngaliema'
  | 'Limete'
  | 'Lingwala'
  | 'Bandalungwa'
  | 'Kintambo';

export const COMMUNES: Commune[] = ['Gombe', 'Ngaliema', 'Limete', 'Lingwala', 'Bandalungwa', 'Kintambo'];

/** Chaque restaurant affiche ses prix dans sa propre devise. */
export type Currency = 'USD' | 'CDF';

/** Niveau de prix affiché en $, $$, $$$. */
export type PriceLevel = 1 | 2 | 3;

export type Amenity =
  | 'groupe-electrogene'
  | 'parking-garde'
  | 'terrasse'
  | 'vue-fleuve'
  | 'climatisation'
  | 'wifi';

export type PaymentMethod = 'especes' | 'm-pesa' | 'orange-money' | 'airtel-money' | 'carte';

export type Criterion = 'cuisine' | 'service' | 'ambiance' | 'prix';

export const CRITERIA: { key: Criterion; label: string; longLabel: string }[] = [
  { key: 'cuisine', label: 'Cuisine', longLabel: 'Cuisine' },
  { key: 'service', label: 'Service', longLabel: 'Service' },
  { key: 'ambiance', label: 'Ambiance', longLabel: 'Ambiance' },
  { key: 'prix', label: 'Qualité-prix', longLabel: 'Rapport qualité-prix' },
];

/** Notes sur 10 par critère. */
export type CriteriaScores = Record<Criterion, number>;

export type OpeningHours = {
  /** Heure d'ouverture, au format 24 h (ex. 11 pour 11 h). */
  opens: number;
  /** Heure de fermeture (peut dépasser 24 pour une fermeture après minuit). */
  closes: number;
};

export type Restaurant = {
  id: string;
  name: string;
  cuisine: string;
  /** Plats phares, utilisés par la recherche (« liboke », « moambe »…). */
  dishes: string[];
  commune: Commune;
  address: string;
  landmark: string;
  latitude: number;
  longitude: number;
  phone: string;
  priceLevel: PriceLevel;
  currency: Currency;
  /** Fourchette de prix d'un repas, dans la devise du restaurant. */
  priceMin: number;
  priceMax: number;
  hours: OpeningHours;
  amenities: Amenity[];
  payments: PaymentMethod[];
  /** Notes des visites de l'équipe, sur 10 par critère. */
  team: CriteriaScores;
  /** Tendance Instagram du mois, sur 10 (saisie à la main chaque mois). */
  trend: number;
};

export type Review = {
  id: string;
  restaurantId: string;
  authorName: string;
  /** Notes sur 5 par critère. */
  ratings: Record<Criterion, number>;
  comment: string;
  verified: boolean;
  createdAt: string;
  /** Vrai quand l'avis a été publié depuis ce téléphone. */
  mine?: boolean;
};

export type ScoreBreakdown = {
  /** Cote finale sur 10, arrondie à une décimale. */
  total: number;
  team: number;
  reviews: number;
  trend: number;
  /** Détail par critère, sur 10 (moyenne équipe et clients). */
  criteria: CriteriaScores;
  reviewCount: number;
  /** Moyenne des avis clients, sur 5. */
  reviewAverage: number;
};

export type RankedRestaurant = Restaurant & {
  score: ScoreBreakdown;
  cityRank: number;
  communeRank: number;
  /** Distance depuis la position de l'utilisateur, en km. */
  distanceKm: number;
};

export type Budget = 1 | 2 | 3;

export type Profile = {
  name: string;
  phone: string;
  commune: Commune | null;
  budget: Budget;
  cuisines: string[];
  memberSince: string;
  notifications: {
    classement: boolean;
    reponses: boolean;
    offres: boolean;
  };
  useLocation: boolean;
  publicName: boolean;
};

export type OtpChannel = 'whatsapp' | 'sms';
