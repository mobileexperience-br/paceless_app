import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { StatRow, type Stat } from '@/components/StatRow';
import { formatElapsed } from '@/hooks/useStopwatch';
import { useTheme } from '@/hooks/useTheme';
import { zoneLabels, type HeartRateZone } from '@/lib/heartRate/heartRateZones.ts';
import type { HeartRateSummary } from '@/types/heartRate';
import { layout, palettes, radius, spacing } from '@/theme';

interface HeartRateSummaryCardProps {
  summary: HeartRateSummary;
}

const zoneOrder: readonly HeartRateZone[] = [5, 4, 3, 2, 1];
const MS_PER_SECOND = 1000;

interface ZoneRowProps {
  label: string;
  seconds: number;
  share: number;
}

function ZoneRow({ label, seconds, share }: ZoneRowProps): ReactElement {
  const { colors } = useTheme();
  return (
    <View style={styles.zoneRow}>
      <Text variant="caption" color={palettes.dark.ink} style={styles.zoneLabel}>
        {label}
      </Text>
      <View style={[styles.track, { backgroundColor: colors.track }]}>
        <View style={[styles.fill, { width: `${share * 100}%`, backgroundColor: colors.primary }]} />
      </View>
      <Text variant="caption" color={palettes.dark.textSecondary}>
        {formatElapsed(seconds * MS_PER_SECOND)}
      </Text>
    </View>
  );
}

export function HeartRateSummaryCard({ summary }: HeartRateSummaryCardProps): ReactElement {
  const stats: Stat[] = [
    { value: String(summary.avg), label: 'FC média (bpm)' },
    { value: String(summary.max), label: 'FC máxima (bpm)' },
  ];
  const seconds = summary.secondsInZone;
  const total = seconds ? zoneOrder.reduce((sum, zone) => sum + seconds[zone], 0) : 0;

  return (
    <View>
      <Text variant="title3" color={palettes.dark.ink} style={styles.title}>
        Frequência cardíaca
      </Text>
      <StatRow stats={stats} dark />
      {seconds ? (
        <View style={styles.zones}>
          {zoneOrder.map((zone) => (
            <ZoneRow
              key={zone}
              label={zoneLabels[zone]}
              seconds={seconds[zone]}
              share={total > 0 ? seconds[zone] / total : 0}
            />
          ))}
        </View>
      ) : (
        <Text variant="caption" color={palettes.dark.textSecondary} style={styles.hint}>
          Defina sua FC máxima em Preferências para ver o tempo em cada zona.
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  title: {
    marginTop: layout.sectionGap,
    marginBottom: spacing.sm,
  },
  zones: {
    marginTop: layout.sectionGap,
    gap: spacing.sm,
  },
  zoneRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  zoneLabel: {
    flexShrink: 1,
    minWidth: layout.zoneLabelMinWidth,
  },
  track: {
    flexGrow: 1,
    height: layout.progressHeight,
    borderRadius: radius.full,
    overflow: 'hidden',
  },
  fill: {
    height: layout.progressHeight,
    borderRadius: radius.full,
  },
  hint: {
    marginTop: layout.sectionGap,
  },
});
