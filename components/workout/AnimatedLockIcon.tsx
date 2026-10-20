import { useEffect } from 'react';
import type { ReactElement } from 'react';
import Svg, { Path } from 'react-native-svg';
import Animated, {
  Easing,
  interpolateColor,
  useAnimatedProps,
  useReducedMotion,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';

const AnimatedPath = Animated.createAnimatedComponent(Path);

const BODY_PATH = 'M5 11h14a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2z';
const DURATION_MS = 260;
const SHACKLE_LIFT = 2;
const SHACKLE_RIGHT_LEG = 4;

interface AnimatedLockIconProps {
  locked: boolean;
  size: number;
  strokeWidth: number;
  lockedColor: string;
  unlockedColor: string;
}

export function AnimatedLockIcon({
  locked,
  size,
  strokeWidth,
  lockedColor,
  unlockedColor,
}: AnimatedLockIconProps): ReactElement {
  const reducedMotion = useReducedMotion();
  const openness = useSharedValue(locked ? 0 : 1);

  useEffect(() => {
    const target = locked ? 0 : 1;
    openness.value = reducedMotion
      ? target
      : withTiming(target, { duration: DURATION_MS, easing: Easing.out(Easing.cubic) });
  }, [locked, reducedMotion, openness]);

  const shackleProps = useAnimatedProps(() => {
    const lift = SHACKLE_LIFT * openness.value;
    const rightLeg = SHACKLE_RIGHT_LEG * (1 - openness.value);
    return {
      d: `M7 11V${7 - lift}a5 5 0 0 1 10 0v${rightLeg}`,
      stroke: interpolateColor(openness.value, [0, 1], [lockedColor, unlockedColor]),
    };
  });

  const bodyProps = useAnimatedProps(() => ({
    stroke: interpolateColor(openness.value, [0, 1], [lockedColor, unlockedColor]),
  }));

  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <AnimatedPath
        d={BODY_PATH}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={bodyProps}
      />
      <AnimatedPath
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        animatedProps={shackleProps}
      />
    </Svg>
  );
}
