import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';

import { LOGO_HORIZONTAL, LOGO_HORIZONTAL_FOND_SOMBRE, SYMBOLE, SYMBOLE_FOND_SOMBRE } from './logo-svg';

type Props = {
  /** Hauteur affichée en px (la largeur suit les proportions du logo). */
  height: number;
  /** `sombre` : version posée sur fond nuit, pour les en-têtes. */
  variant?: 'clair' | 'sombre';
};

/** Logo horizontal Radar Resto Kin. Taille minimale : 120 px de large. */
export function Logo({ height, variant = 'clair' }: Props) {
  const dark = variant === 'sombre';
  // Le fichier « fond sombre » inclut sa marge de protection (viewBox -16 -16 365.92 96).
  const ratio = dark ? 365.92 / 96 : 333.92 / 64;
  return (
    <View accessible accessibilityRole="image" accessibilityLabel="Radar Resto Kin">
      <SvgXml xml={dark ? LOGO_HORIZONTAL_FOND_SOMBRE : LOGO_HORIZONTAL} height={height} width={height * ratio} />
    </View>
  );
}

/** Symbole seul (radar), pour les petits formats. Taille minimale : 24 px. */
export function BrandSymbol({ size, variant = 'clair' }: { size: number; variant?: 'clair' | 'sombre' }) {
  return (
    <View accessible accessibilityRole="image" accessibilityLabel="Radar Resto Kin">
      <SvgXml xml={variant === 'sombre' ? SYMBOLE_FOND_SOMBRE : SYMBOLE} width={size} height={size} />
    </View>
  );
}
