import type { ReactElement } from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { Text } from './Text';
import type { Plan } from '@/hooks/useOfferings';
import { useOpenLink } from '@/hooks/useOpenLink';
import { spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface SubscriptionDisclosureProps {
  plan: Plan;
}

const PERIODS: Record<Plan['id'], string> = {
  annual: '1 ano',
  monthly: '1 mês',
};

function accountLabel(): string {
  return Platform.OS === 'ios' ? 'ID Apple' : 'conta Google';
}

function cancelSteps(): string {
  return Platform.OS === 'ios'
    ? 'Ajustes do iPhone > seu nome > Assinaturas'
    : 'Google Play > Perfil > Pagamentos e assinaturas > Assinaturas';
}

interface LegalLinkProps {
  label: string;
  onPress: () => void;
}

function LegalLink({ label, onPress }: LegalLinkProps): ReactElement {
  const { colors } = useTheme();
  return (
    <Text
      variant="captionStrong"
      color={colors.primaryDeep}
      accessibilityRole="link"
      onPress={onPress}
    >
      {label}
    </Text>
  );
}

export function SubscriptionDisclosure({ plan }: SubscriptionDisclosureProps): ReactElement {
  const { colors } = useTheme();
  const { error, openLegal } = useOpenLink();
  const account = accountLabel();

  return (
    <View style={styles.container}>
      <Text variant="caption" color={colors.textSecondary}>
        {plan.purchasePackage.product.title}: {plan.price} a cada {PERIODS[plan.id]}.
      </Text>
      <Text variant="caption" color={colors.textSecondary}>
        O pagamento é cobrado na sua {account} na confirmação da compra. A assinatura é renovada
        automaticamente, a menos que seja cancelada pelo menos 24 horas antes do fim do período
        atual. Você pode gerenciar e cancelar a qualquer momento em {cancelSteps()}.
      </Text>
      <Text variant="caption" color={colors.textSecondary}>
        <LegalLink label="Termos de uso" onPress={() => { openLegal('terms'); }} />
        {' e '}
        <LegalLink label="Política de privacidade" onPress={() => { openLegal('privacy'); }} />
      </Text>
      {error ? (
        <Text variant="caption" color={colors.danger}>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.xs,
  },
});
