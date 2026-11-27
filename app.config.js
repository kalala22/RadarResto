/**
 * Complète app.json. La clé Google Maps d'Android n'est jamais écrite dans le dépôt :
 * elle vient de la variable d'environnement GOOGLE_MAPS_ANDROID_API_KEY (secret EAS).
 * Sans clé, la carte fonctionne dans Expo Go mais pas dans un build Android.
 */
module.exports = ({ config }) => {
  const androidKey = process.env.GOOGLE_MAPS_ANDROID_API_KEY;
  return {
    ...config,
    plugins: [
      ...config.plugins,
      ...(androidKey ? [['react-native-maps', { androidGoogleMapsApiKey: androidKey }]] : []),
    ],
  };
};
