import { useState, type ReactElement } from "react";
import { Animated, Pressable, StyleSheet, View } from "react-native";
import { Pause, Play, Square } from "lucide-react-native";
import { Text } from "@/components/Text";
import { createStyles, palettes, radius, spacing, workout } from "@/theme";
import { AnimatedLockIcon } from "./AnimatedLockIcon";
import { useTheme, useThemedStyles } from "@/hooks/useTheme";

const UNLOCK_HOLD_MS = 1000;
const UNLOCK_FILL_OPACITY = 0.35;

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
  const [hold] = useState<Animated.Value>(() => new Animated.Value(0));

  const startHold = (): void => {
    if (!locked) return;
    Animated.timing(hold, {
      toValue: 1,
      duration: UNLOCK_HOLD_MS,
      useNativeDriver: true,
    }).start();
  };

  const cancelHold = (): void => {
    hold.stopAnimation();
    hold.setValue(0);
  };

  const fillOpacity = hold.interpolate({
    inputRange: [0, 1],
    outputRange: [0, UNLOCK_FILL_OPACITY],
  });

  return (
    <View>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={
            locked ? "Desbloquear controles" : "Bloquear controles"
          }
          accessibilityHint={
            locked ? "Segure por um segundo para desbloquear" : undefined
          }
          accessibilityState={{ selected: locked }}
          delayLongPress={UNLOCK_HOLD_MS}
          onPress={locked ? undefined : onToggleLock}
          onLongPress={locked ? onToggleLock : undefined}
          onPressIn={startHold}
          onPressOut={cancelHold}
          style={styles.secondary}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.holdFill,
              { backgroundColor: colors.primary, opacity: fillOpacity },
            ]}
          />
          <AnimatedLockIcon
            locked={locked}
            size={workout.secondaryIconSize}
            strokeWidth={1.75}
            lockedColor={colors.primary}
            unlockedColor={palettes.dark.ink}
          />
        </Pressable>

        <Pressable
          accessibilityRole="button"
          accessibilityLabel={paused ? "Retomar treino" : "Pausar treino"}
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
      {locked ? (
        <Text
          variant="caption"
          center
          color={palettes.dark.textSecondary}
          style={styles.hint}
        >
          Segure para desbloquear
        </Text>
      ) : null}
    </View>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    row: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
    },
    secondary: {
      width: workout.secondaryControlSize,
      height: workout.secondaryControlSize,
      borderRadius: radius.full,
      borderWidth: 1,
      borderColor: palettes.dark.border,
      alignItems: "center",
      justifyContent: "center",
    },
    holdFill: {
      ...StyleSheet.absoluteFill,
      borderRadius: radius.full,
    },
    hint: {
      marginTop: spacing.md,
    },
    primary: {
      width: workout.primaryControlSize,
      height: workout.primaryControlSize,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      alignItems: "center",
      justifyContent: "center",
    },
    disabled: {
      opacity: workout.disabledOpacity,
    },
  }),
);
