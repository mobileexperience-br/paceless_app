import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { createStyles, radius } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

interface CheckCircleProps {
  checked?: boolean;
  size?: number;
  decorative?: boolean;
}

export function CheckCircle({ checked = false, size = 24, decorative = false }: CheckCircleProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View
      accessible={decorative ? false : undefined}
      accessibilityRole={decorative ? undefined : 'checkbox'}
      accessibilityState={decorative ? undefined : { checked }}
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: radius.full },
        checked ? styles.checked : styles.unchecked,
      ]}
    >
      {checked ? (
        <Check size={size * 0.6} color={colors.onPrimary} strokeWidth={3} />
      ) : null}
    </View>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    circle: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    unchecked: {
      borderWidth: 1.5,
      borderColor: colors.borderStrong,
    },
    checked: {
      backgroundColor: colors.primary,
    },
  }),
);
