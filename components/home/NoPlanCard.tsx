import type { ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

export function NoPlanCard(): ReactElement {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <Card>
      <Text variant="title3">Você ainda não tem um plano ativo</Text>
      <Text variant="caption" color={colors.textSecondary} style={styles.text}>
        Responda algumas perguntas e gere um plano para começar.
      </Text>
      <Button
        label="Criar meu plano"
        style={styles.button}
        onPress={() => { router.push('/plan/settings'); }}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  text: {
    marginTop: spacing.xs,
  },
  button: {
    marginTop: spacing.md,
  },
});
