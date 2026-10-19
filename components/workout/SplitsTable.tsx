import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { splitMetersFor, type Split } from '@/lib/splits';
import { formatDistance, formatPaceForUnit, paceLabel } from '@/lib/units';
import { colors, spacing, workout } from '@/theme';
import type { DistanceUnit } from '@/types/preferences';

interface SplitsTableProps {
  splits: readonly Split[];
  unit: DistanceUnit;
}

const METERS_PER_KM = 1000;

function splitPace(split: Split): number {
  return split.seconds / (split.meters / METERS_PER_KM);
}

function splitLabel(split: Split, unit: DistanceUnit): string {
  if (split.meters >= splitMetersFor(unit)) return String(split.index);
  return formatDistance(split.meters, unit, 2);
}

export function SplitsTable({ splits, unit }: SplitsTableProps): ReactElement {
  return (
    <View>
      <View style={styles.row}>
        <Text variant="label" color={colors.dark.textSecondary} style={styles.cell}>
          {unit === 'mi' ? 'MI' : 'KM'}
        </Text>
        <Text variant="label" color={colors.dark.textSecondary} style={styles.cellEnd}>
          {`RITMO (${paceLabel(unit).toUpperCase()})`}
        </Text>
      </View>
      {splits.length === 0 ? (
        <Text variant="caption" color={colors.dark.textSecondary} style={styles.empty}>
          Nenhuma parcial completa ainda.
        </Text>
      ) : (
        splits.map((split) => (
          <View key={split.index} style={styles.row}>
            <Text variant="bodyStrong" color={colors.dark.text} style={styles.cell}>
              {splitLabel(split, unit)}
            </Text>
            <Text variant="bodyStrong" color={colors.dark.text} style={styles.cellEnd}>
              {formatPaceForUnit(splitPace(split), unit)}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: workout.splitRowHeight,
    borderBottomWidth: 1,
    borderBottomColor: colors.dark.border,
  },
  cell: {
    flex: 1,
  },
  cellEnd: {
    flex: 2,
    textAlign: 'right',
  },
  empty: {
    paddingVertical: spacing.md,
  },
});
