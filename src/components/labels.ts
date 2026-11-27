import type { Amenity, PaymentMethod } from '@/data/types';

export const AMENITY_LABELS: Record<Amenity, string> = {
  'groupe-electrogene': 'Groupe électrogène',
  'parking-garde': 'Parking gardé',
  terrasse: 'Terrasse',
  'vue-fleuve': 'Vue sur le fleuve',
  climatisation: 'Climatisation',
  wifi: 'Wi-Fi',
};

export const PAYMENT_LABELS: Record<PaymentMethod, string> = {
  especes: 'Espèces',
  'm-pesa': 'M-Pesa',
  'orange-money': 'Orange Money',
  'airtel-money': 'Airtel Money',
  carte: 'Carte',
};
