import { useEffect, useState, type ReactElement } from 'react';
import {
  Animated,
  PanResponder,
  type PanResponderInstance,
  StyleSheet,
  View,
  type LayoutChangeEvent,
} from 'react-native';
import { ArrowRight } from 'lucide-react-native';
import { Text } from '../Text';
import { colors, radius, spacing, workout } from '@/theme';

interface SlideToFinishProps {
  disabled: boolean;
  onFinish: () => void;
}

class Gate {
  max = 0;
  disabled: boolean;
  onFinish: () => void;

  constructor(disabled: boolean, onFinish: () => void) {
    this.disabled = disabled;
    this.onFinish = onFinish;
  }

  sync(disabled: boolean, onFinish: () => void): void {
    this.disabled = disabled;
    this.onFinish = onFinish;
  }

  setMax(max: number): void {
    this.max = max;
  }
}

export function SlideToFinish({ disabled, onFinish }: SlideToFinishProps): ReactElement {
  const [x] = useState<Animated.Value>(() => new Animated.Value(0));
  const [maxX, setMaxX] = useState<number>(0);
  const [gate] = useState<Gate>(() => new Gate(disabled, onFinish));

  useEffect(() => {
    gate.sync(disabled, onFinish);
  }, [gate, disabled, onFinish]);

  const [panResponder] = useState<PanResponderInstance>(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => !gate.disabled,
        onMoveShouldSetPanResponder: () => !gate.disabled,
        onPanResponderMove: (_event, gesture) => {
          x.setValue(Math.min(Math.max(gesture.dx, 0), gate.max));
        },
        onPanResponderRelease: (_event, gesture) => {
          const reached =
            gate.max > 0 && gesture.dx >= gate.max * workout.finishThreshold;
          if (reached) {
            Animated.timing(x, {
              toValue: gate.max,
              duration: 120,
              useNativeDriver: true,
            }).start(() => {
              gate.onFinish();
              x.setValue(0);
            });
            return;
          }
          Animated.spring(x, { toValue: 0, useNativeDriver: true }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(x, { toValue: 0, useNativeDriver: true }).start();
        },
      }),
  );

  const handleLayout = (event: LayoutChangeEvent): void => {
    const next = Math.max(
      0,
      event.nativeEvent.layout.width - spacing.xs * 2 - workout.thumbWidth,
    );
    gate.setMax(next);
    setMaxX(next);
  };

  const labelOpacity = x.interpolate({
    inputRange: [0, Math.max(maxX, 1)],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <View
      onLayout={handleLayout}
      style={[styles.track, disabled && styles.disabled]}
      accessibilityLabel="Deslize para finalizar"
    >
      <Animated.View
        {...panResponder.panHandlers}
        style={[styles.thumb, { transform: [{ translateX: x }] }]}
      >
        <ArrowRight size={workout.thumbIconSize} color={colors.ink} strokeWidth={2.5} />
      </Animated.View>
      <Animated.View style={[styles.label, { opacity: labelOpacity }]}>
        <Text variant="caption" center color={colors.dark.textSecondary}>
          Deslize para finalizar
        </Text>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    height: workout.sliderHeight,
    borderRadius: radius.md,
    backgroundColor: colors.dark.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
  },
  thumb: {
    width: workout.thumbWidth,
    height: workout.thumbHeight,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1,
  },
  label: {
    flex: 1,
  },
  disabled: {
    opacity: workout.disabledOpacity,
  },
});
