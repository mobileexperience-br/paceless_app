import { type ReactNode, type ReactElement } from 'react';
import { StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { createStyles, layout, radius, shadows } from '@/theme';
import { useThemedStyles } from '@/hooks/useTheme';

interface CardProps {
  children: ReactNode;
  flush?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function Card({ children, flush, style }: CardProps): ReactElement {
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.card, !flush && styles.padded, style]}>{children}</View>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
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
  }),
);
