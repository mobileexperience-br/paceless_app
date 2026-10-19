import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { colors, radius } from '@/theme';

interface CheckCircleProps {
  checked?: boolean;
  size?: number;
}

export function CheckCircle({ checked = false, size = 24 }: CheckCircleProps): ReactElement {
  return (
    <View
      accessibilityRole="checkbox"
      accessibilityState={{ checked }}
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: radius.full },
        checked ? styles.checked : styles.unchecked,
      ]}
    >
      {checked ? (
        <Check size={size * 0.6} color={colors.white} strokeWidth={3} />
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  circle: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  unchecked: {
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  checked: {
    backgroundColor: colors.primary,
  },
});
