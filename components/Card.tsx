import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, layout, radius, shadows } from '@/theme';

type CardProps = {
  children: ReactNode;
  /** Remove o padding interno — para cards que contêm listas coladas na borda. */
  flush?: boolean;
  style?: ViewStyle;
};

export function Card({ children, flush, style }: CardProps) {
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
