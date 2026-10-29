import type { ReactElement, ReactNode } from 'react';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';
import { Check } from 'lucide-react-native';
import { Card } from '../Card';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';
import { createStyles, radius, sizes, spacing } from '@/theme';

interface SelectableCardProps {
  active: boolean;
  onPress: () => void;
  children: ReactNode;
  pressableStyle?: StyleProp<ViewStyle>;
  accessibilityLabel?: string;
  disabled?: boolean;
}

export function SelectableCard({
  active,
  onPress,
  children,
  pressableStyle,
  accessibilityLabel,
  disabled,
}: SelectableCardProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ checked: active, selected: active }}
      disabled={disabled}
      onPress={onPress}
      style={pressableStyle}
    >
      <Card style={[styles.card, active && styles.cardActive]}>
        <View style={styles.row}>
          <View style={styles.content}>{children}</View>
          {active ? <Check size={sizes.iconMd} color={colors.primaryDeep} strokeWidth={3} /> : null}
        </View>
      </Card>
    </Pressable>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    card: {
      flexGrow: 1,
      borderWidth: 2,
      borderRadius: radius.lg,
    },
    cardActive: {
      borderColor: colors.primary,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    content: {
      flex: 1,
    },
  }),
);
