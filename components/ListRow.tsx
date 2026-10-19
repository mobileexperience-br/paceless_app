import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { ChevronRight } from 'lucide-react-native';
import { Text } from './Text';
import { colors, layout, spacing } from '@/theme';

type ListRowProps = {
  title: string;
  subtitle?: string;
  /** Terceira linha, como a duração nos treinos de musculação. */
  meta?: string;
  /** Elemento à esquerda: IconBadge, thumbnail ou ícone solto. */
  leading?: ReactNode;
  /** Elemento à direita, no lugar do chevron. */
  trailing?: ReactNode;
  /** Texto curto à direita, como "350 kcal" ou "Adicionar". */
  value?: string;
  showChevron?: boolean;
  divider?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
};

export function ListRow({
  title,
  subtitle,
  meta,
  leading,
  trailing,
  value,
  showChevron = false,
  divider = false,
  onPress,
  style,
}: ListRowProps) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'button' : undefined}
      disabled={!onPress}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        divider && styles.divider,
        pressed && onPress ? styles.pressed : null,
        style,
      ]}
    >
      {leading ? <View style={styles.leading}>{leading}</View> : null}

      <View style={styles.content}>
        <Text variant="bodyStrong">{title}</Text>
        {subtitle ? (
          <Text variant="caption" color={colors.textSecondary}>
            {subtitle}
          </Text>
        ) : null}
        {meta ? (
          <Text variant="caption" color={colors.textSecondary}>
            {meta}
          </Text>
        ) : null}
      </View>

      {value ? (
        <Text variant="caption" color={colors.textSecondary}>
          {value}
        </Text>
      ) : null}
      {trailing}
      {showChevron ? (
        <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.75} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.md,
    paddingHorizontal: layout.cardPadding,
    minHeight: 56,
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  pressed: {
    backgroundColor: colors.track,
  },
  leading: {
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
});
