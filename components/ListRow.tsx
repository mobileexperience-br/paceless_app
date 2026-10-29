import { type ReactNode, type ReactElement } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  View,
  type AccessibilityRole,
  type AccessibilityState,
  type ViewStyle,
} from 'react-native';
import { ChevronRight, ExternalLink } from 'lucide-react-native';
import { Text } from './Text';
import { createStyles, layout, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

interface ListRowProps {
  title: string;
  subtitle?: string;
  meta?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
  value?: string;
  showChevron?: boolean;
  external?: boolean;
  loading?: boolean;
  tone?: 'default' | 'danger';
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityState?: AccessibilityState;
  divider?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}

export function ListRow({
  title,
  subtitle,
  meta,
  leading,
  trailing,
  value,
  showChevron = false,
  external = false,
  loading = false,
  tone = 'default',
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  accessibilityState,
  divider = false,
  onPress,
  style,
}: ListRowProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      accessibilityLabel={accessibilityLabel}
      accessibilityHint={accessibilityHint}
      accessibilityRole={accessibilityRole ?? (onPress ? 'button' : undefined)}
      accessibilityState={{ ...accessibilityState, busy: loading }}
      disabled={!onPress || loading}
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
        <Text variant="bodyStrong" color={tone === 'danger' ? colors.danger : colors.ink}>
          {title}
        </Text>
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
        <Text variant="caption" color={colors.textSecondary} style={styles.value}>
          {value}
        </Text>
      ) : null}
      {trailing}
      {loading ? <ActivityIndicator color={colors.textSecondary} accessibilityLabel="Carregando" /> : null}
      {external && !loading ? (
        <ExternalLink size={sizes.iconMd} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />
      ) : null}
      {showChevron && !external ? (
        <ChevronRight size={sizes.iconMd} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />
      ) : null}
    </Pressable>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
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
    value: {
      flexShrink: 1,
    },
  }),
);
