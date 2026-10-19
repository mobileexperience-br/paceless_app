import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, spacing } from '@/theme';

type EmptyStateProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  action?: ReactNode;
  style?: ViewStyle;
};

export function EmptyState({
  title,
  description,
  icon,
  action,
  style,
}: EmptyStateProps) {
  return (
    <View style={[styles.container, style]}>
      {icon}
      <Text variant="title3" center>
        {title}
      </Text>
      {description ? (
        <Text variant="caption" center color={colors.textSecondary}>
          {description}
        </Text>
      ) : null}
      {action}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    paddingVertical: spacing.huge,
    paddingHorizontal: spacing.xxl,
  },
});
