import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ChevronRight, ClipboardList } from 'lucide-react-native';
import { Card, Text } from '@/components';
import { currentWeekNumber, planProgress } from '@/lib/planProgress';
import { localToday } from '@/lib/planDates';
import { createStyles, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';
import type { ActivePlan } from '@/types/training';

interface PlanCardProps {
  plan: ActivePlan | null;
  loading: boolean;
}

export function PlanCard({ plan, loading }: PlanCardProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const hidden = loading && plan === null ? styles.hidden : undefined;
  const target = plan ? '/plan' : '/plan/settings';
  const progress = plan ? planProgress(plan) : null;
  const weekNumber = plan ? currentWeekNumber(plan, localToday()) : 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={plan ? `Plano atual: ${plan.name}. Abrir plano` : 'Nenhum plano ativo. Configurar plano'}
      onPress={() => {
        router.push(target);
      }}
    >
      {({ pressed }) => (
        <Card style={pressed ? styles.pressed : undefined}>
          <View style={styles.row}>
            <View style={styles.texts}>
              <Text variant="captionStrong">Plano atual</Text>
              <Text variant="title3" style={[styles.planTitle, hidden]} numberOfLines={2}>
                {plan ? plan.name : 'Nenhum plano ativo'}
              </Text>
              <View style={[styles.meta, hidden]}>
                <ClipboardList size={sizes.iconSm} color={colors.primaryDeep} strokeWidth={sizes.iconStroke} />
                <Text variant="caption" color={colors.textSecondary} style={styles.metaText}>
                  {plan && progress
                    ? `Semana ${String(weekNumber)} de ${String(plan.fullWeeks)} • ${String(progress.done)}/${String(progress.total)} treinos`
                    : 'Nenhuma semana em andamento'}
                </Text>
              </View>
            </View>
            <ChevronRight size={sizes.iconMd} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    texts: {
      flexGrow: 1,
      flexShrink: 1,
    },
    planTitle: {
      marginTop: spacing.xs,
    },
    meta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    metaText: {
      flexShrink: 1,
    },
    hidden: {
      opacity: 0,
    },
    pressed: {
      backgroundColor: colors.track,
    },
  }),
);
