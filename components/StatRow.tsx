import { StyleSheet, View, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, spacing } from '@/theme';

export type Stat = {
  value: string;
  label: string;
};

type StatRowProps = {
  stats: readonly Stat[];
  /** Variante da tela de treino, sobre fundo escuro. */
  dark?: boolean;
  style?: ViewStyle;
};

/** Linha de métricas: valor em destaque com o label abaixo. */
export function StatRow({ stats, dark, style }: StatRowProps) {
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
