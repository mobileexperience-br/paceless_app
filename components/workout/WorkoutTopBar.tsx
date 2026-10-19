import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ArrowLeft, Ellipsis } from 'lucide-react-native';
import { colors, workout } from '@/theme';

interface WorkoutTopBarProps {
  onBack: () => void;
  onMore: () => void;
}

export function WorkoutTopBar({ onBack, onMore }: WorkoutTopBarProps): ReactElement {
  return (
    <View style={styles.bar}>
      <Pressable accessibilityRole="button" accessibilityLabel="Voltar" hitSlop={12} onPress={onBack}>
        <ArrowLeft size={workout.topBarIconSize} color={colors.dark.text} strokeWidth={2} />
      </Pressable>
      <View style={styles.grow} />
      <Pressable accessibilityRole="button" accessibilityLabel="Mais opções" hitSlop={12} onPress={onMore}>
        <Ellipsis size={workout.topBarIconSize} color={colors.dark.text} strokeWidth={2} />
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
});
