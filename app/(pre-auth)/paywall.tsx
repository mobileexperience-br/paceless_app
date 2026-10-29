import type { ReactElement } from 'react';
import { useRouter } from 'expo-router';
import { Screen, ScreenHeader } from '@/components';
import { PaywallContent } from '@/components/paywall/PaywallContent';
import { useOnboarding } from '@/hooks/useOnboarding';
import { summarizeAnswers } from '@/lib/onboardingSteps';

export default function PaywallScreen(): ReactElement {
  const router = useRouter();
  const { answers } = useOnboarding();
  const goToSignup = (): void => {
    router.replace('/signup');
  };

  return (
    <Screen flush>
      <ScreenHeader showBack />
      <PaywallContent
        intro={summarizeAnswers(answers)}
        hint="Você pode assinar depois pelo perfil."
        secondary={{ label: 'Agora não', onPress: goToSignup }}
        onPurchased={goToSignup}
      />
    </Screen>
  );
}
