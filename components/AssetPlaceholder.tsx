import type { ReactElement } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Image as ImageIcon } from 'lucide-react-native';
import { Text } from './Text';
import { createStyles, radius, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

interface AssetPlaceholderProps {
  label?: string;
  iconSize?: number;
  rounded?: keyof typeof radius;
  style?: ViewStyle;
}

export function AssetPlaceholder({
  label,
  iconSize = 24,
  rounded = 'md',
  style,
}: AssetPlaceholderProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[styles.box, { borderRadius: radius[rounded] }, style]}>
      <ImageIcon size={iconSize} color={colors.textSecondary} strokeWidth={1.5} />
      {label ? (
        <Text variant="label" center color={colors.textSecondary}>
          {label}
        </Text>
      ) : null}
    </View>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    box: {
      flex: 1,
      backgroundColor: colors.track,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xs,
      padding: spacing.sm,
    },
  }),
);
