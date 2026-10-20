import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Lock, Pause, Play, Square } from 'lucide-react-native';
import { createStyles, palettes, radius, workout } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

interface WorkoutControlsProps {
  paused: boolean;
  locked: boolean;
  onTogglePause: () => void;
  onStop: () => void;
  onToggleLock: () => void;
}

export function WorkoutControls({
  paused,
  locked,
  onTogglePause,
  onStop,
  onToggleLock,
}: WorkoutControlsProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const PlayPauseIcon = paused ? Play : Pause;

  return (
    <View style={styles.row}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={locked ? 'Desbloquear controles' : 'Bloquear controles'}
        accessibilityState={{ selected: locked }}
        onPress={onToggleLock}
        style={styles.secondary}
      >
        <Lock
          size={workout.secondaryIconSize}
          color={locked ? colors.primary : palettes.dark.ink}
          strokeWidth={1.75}
        />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={paused ? 'Retomar treino' : 'Pausar treino'}
        accessibilityState={{ disabled: locked }}
        disabled={locked}
        onPress={onTogglePause}
        style={[styles.primary, locked && styles.disabled]}
      >
        <PlayPauseIcon
          size={workout.primaryIconSize}
          color={colors.onPrimary}
          fill={colors.onPrimary}
          strokeWidth={0}
        />
      </Pressable>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Parar treino"
        accessibilityState={{ disabled: locked }}
        disabled={locked}
        onPress={onStop}
        style={[styles.secondary, locked && styles.disabled]}
      >
        <Square
          size={workout.stopIconSize}
          color={palettes.dark.ink}
          fill={palettes.dark.ink}
          strokeWidth={0}
        />
      </Pressable>
    </View>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    secondary: {
      width: workout.secondaryControlSize,
      height: workout.secondaryControlSize,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: palettes.dark.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primary: {
      width: workout.primaryControlSize,
      height: workout.primaryControlSize,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    disabled: {
      opacity: workout.disabledOpacity,
    },
  }),
);
