import type { ReactElement } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { palettes, spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

export interface Stat {
  value: string;
  label: string;
}

interface StatRowProps {
  stats: readonly Stat[];
  dark?: boolean;
  style?: ViewStyle;
}

export function StatRow({ stats, dark, style }: StatRowProps): ReactElement {
  const { colors } = useTheme();
  return (
    <View style={[styles.row, style]}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.item}>
          <Text
            variant="metric"
            center
            color={dark ? palettes.dark.ink : colors.ink}
          >
            {stat.value}
          </Text>
          <Text
            variant="caption"
            center
            color={dark ? palettes.dark.textSecondary : colors.textSecondary}
          >
            {stat.label}
          </Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
  },
  item: {
    flex: 1,
    gap: spacing.xs,
  },
});
