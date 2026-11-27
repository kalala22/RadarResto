// Thème Tailwind issu de la charte graphique Radar Resto Kin.
// Les couleurs vivent dans src/theme/tokens.json pour être partagées avec le code
// (SVG, composants Expo UI) qui ne lit pas les classes Tailwind.
const { colors } = require('./src/theme/tokens.json');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  // Thème clair seulement pour l'instant ; le thème sombre (valeurs prévues par la charte) viendra plus tard.
  darkMode: 'class',
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors,
      fontFamily: {
        // Archivo largeur 75 % (instances statiques générées depuis la police variable)
        titre: ['ArchivoCondensed-ExtraBold'],
        'titre-bold': ['ArchivoCondensed-Bold'],
        // Source Sans 3
        texte: ['SourceSans3_400Regular'],
        'texte-semi': ['SourceSans3_600SemiBold'],
        'texte-bold': ['SourceSans3_700Bold'],
        // IBM Plex Mono, pour tous les chiffres
        chiffres: ['IBMPlexMono_600SemiBold'],
        'chiffres-medium': ['IBMPlexMono_500Medium'],
      },
      fontSize: {
        affiche: ['48px', '46px'],
        'titre-1': ['30px', '32px'],
        'titre-2': ['22px', '26px'],
        corps: ['16px', '23px'],
        libelle: ['15px', '20px'],
        legende: ['13px', '18px'],
        cote: ['20px', '22px'],
        surtitre: ['12px', '16px'],
      },
      borderRadius: {
        's': '8px',
        'm': '12px',
        'l': '16px',
      },
      spacing: {
        ecran: '24px',
      },
    },
  },
  plugins: [],
};
