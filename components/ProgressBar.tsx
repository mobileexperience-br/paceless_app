import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, layout, radius } from '@/theme';

type ProgressBarProps = {
  /** 0 a 1. */
  progress: number;
  style?: ViewStyle;
};

export function ProgressBar({ progress, style }: ProgressBarProps) {
  const clamped = Math.min(1, Math.max(0, progress));

  return (
    <View
      accessibilityRole="progressbar"
      accessibilityValue={{ min: 0, max: 100, now: Math.round(clamped * 100) }}
      style={[styles.track, style]}
    >
      <View style={[styles.fill, { width: `${clamped * 100}%` }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: layout.progressHeight,
    borderRadius: radius.full,
    backgroundColor: colors.track,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: radius.full,
    backgroundColor: colors.primary,
  },
});
