import type { ReactElement } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { CalendarPlus } from 'lucide-react-native';
import { Button, EmptyState } from '@/components';
import { layout, sizes } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { useRouter } from 'expo-router';

export function PlanLoading(): ReactElement {
  const { colors } = useTheme();
  return (
    <View style={styles.center}>
      <ActivityIndicator accessibilityLabel="Carregando plano" color={colors.primaryDeep} />
    </View>
  );
}

interface PlanErrorProps {
  message: string;
  onRetry: () => void;
}

export function PlanError({ message, onRetry }: PlanErrorProps): ReactElement {
  return (
    <EmptyState
      title="Não foi possível carregar seu plano"
      description={message}
      action={<Button label="Tentar novamente" onPress={onRetry} />}
    />
  );
}

export function NoPlanState(): ReactElement {
  const { colors } = useTheme();
  const router = useRouter();
  return (
    <EmptyState
      icon={<CalendarPlus size={sizes.iconXl * 2} color={colors.primaryDeep} strokeWidth={sizes.iconStroke} />}
      title="Você ainda não tem um plano"
      description="Configure seus dias e objetivo para gerarmos seus treinos."
      action={
        <Button
          label="Configurar plano"
          onPress={() => {
            router.push('/plan/settings');
          }}
        />
      }
    />
  );
}

const styles = StyleSheet.create({
  center: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: layout.controlHeight,
  },
});
