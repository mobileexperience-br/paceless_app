import type { ReactElement } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { createStyles, layout, radius } from '@/theme';
import { useThemedStyles } from '@/hooks/useTheme';

interface ProgressBarProps {
  progress: number;
  style?: ViewStyle;
}

export function ProgressBar({ progress, style }: ProgressBarProps): ReactElement {
  const styles = useThemedStyles(makeStyles);
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

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
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
  }),
);
