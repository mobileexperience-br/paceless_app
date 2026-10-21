import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components';
import { activityLabels, type WorkoutType } from '@/lib/activities';
import { palettes, spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface WorkoutHeadingProps {
  type: WorkoutType;
  formatted: string;
}

export function WorkoutHeading({ type, formatted }: WorkoutHeadingProps): ReactElement {
  const { colors } = useTheme();
  return (
    <>
      <View style={styles.heading}>
        <Text variant="title1" color={palettes.dark.ink}>
          {activityLabels[type]}
        </Text>
        <Text variant="caption" color={palettes.dark.textSecondary}>
          Treino livre
        </Text>
      </View>

      <View style={styles.timer}>
        <Text variant="timer" center color={colors.primary}>
          {formatted}
        </Text>
        <Text variant="caption" center color={palettes.dark.textSecondary}>
          Duração
        </Text>
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  heading: {
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  timer: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
