import { type ReactNode, type ReactElement } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { colors, layout, radius, shadows } from '@/theme';

interface CardProps {
  children: ReactNode;
  flush?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, flush, style }: CardProps): ReactElement {
  return (
    <View style={[styles.card, !flush && styles.padded, style]}>{children}</View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...shadows.card,
  },
  padded: {
    padding: layout.cardPadding,
  },
});
