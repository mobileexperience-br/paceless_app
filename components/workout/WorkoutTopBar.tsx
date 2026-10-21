import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ArrowLeft, Ellipsis } from 'lucide-react-native';
import { palettes, workout } from '@/theme';

interface WorkoutTopBarProps {
  disabled: boolean;
  onBack: () => void;
  onMore: () => void;
}

export function WorkoutTopBar({ disabled, onBack, onMore }: WorkoutTopBarProps): ReactElement {
  const dimmed = disabled && styles.disabled;
  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Voltar"
        accessibilityState={{ disabled }}
        disabled={disabled}
        hitSlop={12}
        onPress={onBack}
        style={dimmed}
      >
        <ArrowLeft size={workout.topBarIconSize} color={palettes.dark.ink} strokeWidth={2} />
      </Pressable>
      <View style={styles.grow} />
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Mais opções"
        accessibilityState={{ disabled }}
        disabled={disabled}
        hitSlop={12}
        onPress={onMore}
        style={dimmed}
      >
        <Ellipsis size={workout.topBarIconSize} color={palettes.dark.ink} strokeWidth={2} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: workout.topBarHeight,
  },
  grow: {
    flex: 1,
  },
  disabled: {
    opacity: workout.disabledOpacity,
  },
});
