import { Redirect } from 'expo-router';

import { useApp } from '@/data/store';

/** Point d'entrée : onboarding au premier lancement, puis le classement. */
export default function Index() {
  const { onboarded } = useApp();
  return <Redirect href={onboarded ? '/classement' : '/onboarding'} />;
}
