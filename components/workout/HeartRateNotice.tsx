import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Heart, HeartOff } from 'lucide-react-native';
import { Text } from '@/components/Text';
import type { WorkoutHeartRate } from '@/hooks/useWorkoutHeartRate';
import { zoneLabels } from '@/lib/heartRate/heartRateZones.ts';
import { sizes, spacing, workout } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

type HeartRateNoticeProps = Pick<WorkoutHeartRate, 'status' | 'bpm' | 'zone'>;

const captions = {
  connecting: 'Conectando à cinta...',
  bluetoothOff: 'Bluetooth desligado. Ligue para ver sua frequência cardíaca.',
  unauthorized: 'Sem permissão de Bluetooth. Ative em Dispositivos conectados.',
} as const;

const unavailableCaption = 'Frequência cardíaca indisponível';

export function HeartRateNotice({ status, bpm, zone }: HeartRateNoticeProps): ReactElement {
  const { colors } = useTheme();
  if (status === 'none' || status === 'idle') {
    return <HeartRateUnavailable />;
  }

  if (status === 'connected') {
    if (bpm === null || bpm <= 0) return <HeartRateUnavailable />;
    return (
      <View style={styles.metric}>
        <Heart size={workout.statusIconSize} color={colors.primary} strokeWidth={sizes.iconStroke} />
        <Text variant="metric" color={colors.ink}>{`${String(bpm)} bpm`}</Text>
        {zone !== null ? (
          <Text variant="captionStrong" color={colors.primary}>{zoneLabels[zone]}</Text>
        ) : null}
      </View>
    );
  }

  if (status === 'reconnecting') {
    return (
      <View style={styles.notice}>
        <HeartOff size={workout.statusIconSize} color={colors.danger} strokeWidth={sizes.iconStroke} />
        <Text variant="caption" center color={colors.textSecondary}>
          Cinta desconectada. Tentando reconectar...
        </Text>
      </View>
    );
  }

  return (
    <Text variant="caption" center color={colors.textSecondary} style={styles.caption}>
      {captions[status]}
    </Text>
  );
}

function HeartRateUnavailable(): ReactElement {
  const { colors } = useTheme();
  return (
    <View style={styles.notice}>
      <HeartOff size={workout.statusIconSize} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />
      <Text variant="caption" center color={colors.textSecondary}>
        {unavailableCaption}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  metric: {
    marginTop: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  notice: {
    marginTop: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  caption: {
    marginTop: spacing.md,
  },
});
