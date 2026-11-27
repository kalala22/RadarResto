import tokens from './tokens.json';

/**
 * Couleurs de la charte, pour le code qui ne lit pas les classes Tailwind
 * (SVG, composants natifs Expo UI). Dans les vues, utiliser les classes : `bg-nuit`, `text-vert-radar`…
 */
export const colors = {
  nuit: tokens.colors.nuit,
  nuit2: tokens.colors['nuit-2'],
  nuit3: tokens.colors['nuit-3'],
  vertRadar: tokens.colors['vert-radar'],
  safran: tokens.colors.safran,
  menthe: tokens.colors.menthe,
  fond: tokens.colors.fond,
  surface: tokens.colors.surface,
  encre: tokens.colors.encre,
  texteSecondaire: tokens.colors['texte-secondaire'],
  texteSurNuit: tokens.colors['texte-sur-nuit'],
  vertProfond: tokens.colors['vert-profond'],
  safranTexte: tokens.colors['safran-texte'],
  bordure: tokens.colors.bordure,
  bordureChamp: tokens.colors['bordure-champ'],
  brique: tokens.colors.brique,
  vignette: tokens.colors.vignette,
  carteSol: tokens.colors['carte-sol'],
  carteEau: tokens.colors['carte-eau'],
  carteParc: tokens.colors['carte-parc'],
} as const;
