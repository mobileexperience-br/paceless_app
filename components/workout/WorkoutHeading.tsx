import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';
import { Text } from '@/components';
import { activityLabels, type WorkoutType } from '@/lib/activities';
import { palettes, spacing, workout } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface WorkoutHeadingProps {
  type: WorkoutType;
  formatted: string;
  paused: boolean;
  typeDisabled: boolean;
  onPressType: () => void;
}

export function WorkoutHeading({
  type,
  formatted,
  paused,
  typeDisabled,
  onPressType,
}: WorkoutHeadingProps): ReactElement {
  const { colors } = useTheme();
  return (
    <>
      <View style={styles.heading}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={`Tipo de atividade: ${activityLabels[type]}`}
          accessibilityState={{ disabled: typeDisabled }}
          disabled={typeDisabled}
          onPress={onPressType}
          style={[styles.chip, typeDisabled && styles.disabled]}
        >
          <Text variant="title1" color={palettes.dark.ink}>
            {activityLabels[type]}
          </Text>
          <ChevronDown size={workout.menuIconSize} color={palettes.dark.textSecondary} strokeWidth={2} />
        </Pressable>
        <Text variant="caption" color={palettes.dark.textSecondary}>
          Treino livre
        </Text>
      </View>

      <View style={styles.timer}>
        <Text
          variant="timer"
          center
          color={paused ? palettes.dark.textSecondary : colors.primary}
          style={paused && styles.pausedTimer}
        >
          {formatted}
        </Text>
        <Text
          variant={paused ? 'captionStrong' : 'caption'}
          center
          color={paused ? colors.primary : palettes.dark.textSecondary}
        >
          {paused ? 'PAUSADO' : 'Duração'}
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
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: spacing.sm,
    minHeight: workout.topBarHeight,
  },
  disabled: {
    opacity: workout.disabledOpacity,
  },
  pausedTimer: {
    opacity: workout.disabledOpacity,
  },
  timer: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
