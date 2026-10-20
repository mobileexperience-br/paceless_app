import { type ReactNode, type ReactElement } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { useTheme } from '@/hooks/useTheme';

interface RingProps {
  progress: number;
  size?: number;
  thickness?: number;
  children?: ReactNode;
  style?: ViewStyle;
}

export function Ring({
  progress,
  size = 128,
  thickness = 12,
  children,
  style,
}: RingProps): ReactElement {
  const { colors } = useTheme();
  const clamped = Math.min(1, Math.max(0, progress));
  const r = (size - thickness) / 2;
  const circumference = 2 * Math.PI * r;

  return (
    <View style={[{ width: size, height: size }, style]}>
      <Svg width={size} height={size}>
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.track}
          strokeWidth={thickness}
          fill="none"
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          stroke={colors.primaryDeep}
          strokeWidth={thickness}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - clamped)}
          fill="none"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={styles.center}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  center: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
