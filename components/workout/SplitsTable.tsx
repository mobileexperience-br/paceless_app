import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { splitMetersFor, type Split } from '@/lib/splits';
import { formatDistance, formatPaceForUnit, paceLabel } from '@/lib/units';
import { palettes, radius, spacing, workout } from '@/theme';
import type { DistanceUnit } from '@/types/preferences';

interface SplitsTableProps {
  splits: readonly Split[];
  unit: DistanceUnit;
}

const METERS_PER_KM = 1000;
const PERCENT = 100;

function splitPace(split: Split): number {
  return split.seconds / (split.meters / METERS_PER_KM);
}

function splitLabel(split: Split, unit: DistanceUnit): string {
  if (split.meters >= splitMetersFor(unit)) return String(split.index);
  return formatDistance(split.meters, unit, 2);
}

export function SplitsTable({ splits, unit }: SplitsTableProps): ReactElement {
  const paces = splits.map(splitPace);
  const fastest = Math.min(...paces);
  const slowest = Math.max(...paces);
  const highlight = splits.length > 1 && slowest > fastest;

  return (
    <View>
      <View style={styles.row}>
        <Text variant="label" color={palettes.dark.textSecondary} style={styles.cell}>
          {unit === 'mi' ? 'MI' : 'KM'}
        </Text>
        <Text variant="label" color={palettes.dark.textSecondary} style={styles.cellEnd}>
          {`RITMO (${paceLabel(unit).toUpperCase()})`}
        </Text>
      </View>
      {splits.length === 0 ? (
        <Text variant="caption" color={palettes.dark.textSecondary} style={styles.empty}>
          Nenhuma parcial completa ainda.
        </Text>
      ) : (
        splits.map((split, position) => {
          const pace = paces[position] ?? fastest;
          const barColor = !highlight
            ? palettes.dark.track
            : pace === fastest
              ? palettes.dark.primary
              : pace === slowest
                ? palettes.dark.danger
                : palettes.dark.track;
          return (
            <View key={split.index} style={styles.row}>
              <Text
                variant="bodyStrong"
                color={palettes.dark.ink}
                numberOfLines={1}
                style={styles.cell}
              >
                {splitLabel(split, unit)}
              </Text>
              <View style={styles.barTrack}>
                <View
                  style={[
                    styles.bar,
                    { width: `${Math.round((fastest / pace) * PERCENT)}%`, backgroundColor: barColor },
                  ]}
                />
              </View>
              <Text variant="bodyStrong" color={palettes.dark.ink} style={styles.pace}>
                {formatPaceForUnit(pace, unit)}
              </Text>
            </View>
          );
        })
      )}
      {highlight ? (
        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: palettes.dark.primary }]} />
            <Text variant="caption" color={palettes.dark.textSecondary}>
              Mais rápida
            </Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.dot, { backgroundColor: palettes.dark.danger }]} />
            <Text variant="caption" color={palettes.dark.textSecondary}>
              Mais lenta
            </Text>
          </View>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: workout.splitRowHeight,
    borderBottomWidth: 1,
    borderBottomColor: palettes.dark.border,
  },
  cell: {
    flex: 2,
  },
  cellEnd: {
    flex: 4,
    textAlign: 'right',
  },
  barTrack: {
    flex: 2,
    marginHorizontal: spacing.md,
  },
  bar: {
    height: spacing.sm,
    borderRadius: radius.full,
  },
  pace: {
    flex: 1.5,
    textAlign: 'right',
  },
  empty: {
    paddingVertical: spacing.md,
  },
  legend: {
    flexDirection: 'row',
    gap: spacing.lg,
    paddingVertical: spacing.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: spacing.sm,
    height: spacing.sm,
    borderRadius: radius.full,
  },
});
