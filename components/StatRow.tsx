import type { ReactElement } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, spacing } from '@/theme';

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
  return (
    <View style={[styles.row, style]}>
      {stats.map((stat) => (
        <View key={stat.label} style={styles.item}>
          <Text
            variant="metric"
            center
            color={dark ? colors.dark.text : colors.ink}
          >
            {stat.value}
          </Text>
          <Text
            variant="caption"
            center
            color={dark ? colors.dark.textSecondary : colors.textSecondary}
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
