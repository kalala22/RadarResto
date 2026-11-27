# Radar Resto Kin

Application mobile (Android et iOS) qui classe chaque mois les meilleurs restaurants de Kinshasa, avec une cote sur 10 : visites de l'équipe (60 %), avis clients vérifiés (20 %) et tendance Instagram (20 %).

Maquette, charte graphique et plan d'implémentation : voir le projet Claude « RadarResto ».

## Démarrer

```bash
npm install
npx expo start
```

Puis ouvrir l'app dans Expo Go, un simulateur, ou le navigateur (touche `w`).

## Vérifications

```bash
npx expo lint        # lint
npx tsc --noEmit     # types
npm test             # tests unitaires (Jest)
```

## Organisation

| Dossier | Contenu |
| --- | --- |
| `src/app/` | Écrans (Expo Router). `(auth)` : onboarding, inscription, connexion, code. `(tabs)` : classement, carte, favoris, profil. `restaurant/[id]` : fiche, avis, liste des avis. |
| `src/components/` | Composants partagés : `ui/primitives.tsx` (texte, boutons, puces, champs), `restaurant.tsx`, logo, icônes. |
| `src/data/` | Couche de données : types, données fictives, calcul de la cote, `repository.ts` (fonctions asynchrones), `store.tsx` (état gardé sur l'appareil). |
| `src/lib/` | Formatage (cotes « 9,2 », prix en $ ou FC, téléphones +243), distances, position, liens Appeler/Itinéraire/Partager. |
| `src/theme/` | Jetons de couleur de la charte (`tokens.json`), partagés avec `tailwind.config.js`. |
| `assets/brand/` | Logos SVG de la charte. `assets/fonts/` : Archivo largeur 75 % (instances statiques, licence OFL). |

## Style

- **Tailwind CSS** via NativeWind 4 (`className="bg-nuit text-surface"`). Couleurs, typographie (`font-titre`, `font-texte`, `font-chiffres`, `text-titre-1`…), rayons et espacements viennent de la charte, dans `tailwind.config.js`.
- **Expo UI** (`@expo/ui`) pour les composants natifs : interrupteurs et listes déroulantes (paramètres, inscription). Voir le skill `.claude/skills/expo-ui`.
- Règles de la charte : un seul élément safran par écran (le N° 1), `safran-texte` pour du safran en texte sur fond clair, `brique` réservé aux erreurs et à la suppression.

## État actuel (phases 0, 1, 4 et 5)

Pas encore de backend : les restaurants et avis sont fictifs, la connexion par code est simulée (n'importe quel code à 6 chiffres), et favoris, avis et profil sont gardés sur le téléphone (AsyncStorage). Toutes les lectures passent par `src/data/repository.ts`, qui pourra appeler l'API plus tard sans toucher aux écrans.

Recherche (`src/data/search.ts`) : par nom, plat, cuisine, quartier ou adresse, sans tenir compte des accents ; filtres commune, prix, ouvert, cote minimale, équipements et « Près de moi ».

Carte : react-native-maps (Google Maps sur Android, Plans sur iPhone), avec une version dessinée pour le web (`restaurant-map.web.tsx`). La position (expo-location) n'est demandée qu'après une explication, au premier plan seulement, et n'est jamais enregistrée. Sans position, ou hors de Kinshasa, les distances partent de la Gombe.

La carte fonctionne dans Expo Go. Pour un build Android (EAS), il faut une clé Google Maps SDK for Android dans la variable `GOOGLE_MAPS_ANDROID_API_KEY` (secret EAS), lue par `app.config.js`. iOS n'en a pas besoin.
