import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import {
  CheckCircle,
  EmptyState,
  ProgressBar,
  Screen,
  ScreenHeader,
  Text,
} from '@/components';
import { colors, layout, spacing } from '@/theme';

const weekdays = [
  'Segunda',
  'Terça',
  'Quarta',
  'Quinta',
  'Sexta',
  'Sábado',
  'Domingo',
];

export default function WeekScreen(): ReactElement {
  const { week } = useLocalSearchParams<{ week: string }>();

  return (
    <Screen scroll flush>
      <ScreenHeader showBack title={`Semana ${week}`} />

      <View style={styles.body}>
        <Text variant="caption" color={colors.textSecondary}>
          0 de 0 treinos
        </Text>
        <ProgressBar progress={0} style={styles.progress} />

        <View style={styles.days}>
          {weekdays.map((day, index) => (
            <View
              key={day}
              style={[styles.day, index < weekdays.length - 1 && styles.divider]}
            >
              <View style={styles.dayText}>
                <Text variant="caption" color={colors.textSecondary}>
                  {day}
                </Text>
                <Text variant="body" color={colors.textSecondary}>
                  —
                </Text>
              </View>
              <CheckCircle />
            </View>
          ))}
        </View>

        <EmptyState description="Escolha um plano para preencher a semana." title="Semana sem treinos" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xs,
  },
  progress: {
    marginTop: spacing.md,
  },
  days: {
    marginTop: spacing.lg,
  },
  day: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  dayText: {
    flex: 1,
    gap: 2,
  },
});
