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
import { createStyles, layout, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

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
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
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

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    body: {
      paddingHorizontal: layout.screenPadding,
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
  }),
);
