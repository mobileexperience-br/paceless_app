import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Trophy } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { StatRow, type Stat } from '@/components/StatRow';
import { Text } from '@/components/Text';
import { formatDuration, formatWeekDistance } from '@/lib/activityStats';
import { distanceLabel } from '@/lib/units';
import { layout, sizes } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { usePreferences } from '@/hooks/usePreferences';
import type { ProgressTotals } from '@/types/progress';

interface HistoryHeaderProps {
  weekStats: Stat[];
  total: ProgressTotals | null;
  showError: boolean;
}

export function HistoryHeader({ weekStats, total, showError }: HistoryHeaderProps): ReactElement {
  const { colors } = useTheme();
  const { distanceUnit } = usePreferences();
  const router = useRouter();
  const totalStats: Stat[] = total
    ? [
        { value: String(total.sessions), label: 'Sessões' },
        {
          value: formatWeekDistance(total.distanceMeters, distanceUnit),
          label: distanceLabel(distanceUnit),
        },
        { value: formatDuration(total.durationSeconds), label: 'Tempo' },
      ]
    : [];

  return (
    <View style={styles.header}>
      <Text variant="captionStrong">Esta semana</Text>
      <Card>
        <StatRow stats={weekStats} />
      </Card>

      {total ? (
        <>
          <Text variant="captionStrong">Desde o início</Text>
          <Card>
            <StatRow stats={totalStats} />
          </Card>
        </>
      ) : null}

      <Card flush>
        <ListRow
          title="Conquistas"
          leading={
            <Trophy size={sizes.iconMd} color={colors.primaryDeep} strokeWidth={sizes.iconStroke} />
          }
          showChevron
          onPress={() => { router.push('/achievements'); }}
        />
      </Card>

      {showError ? (
        <Text variant="caption" color={colors.danger}>
          Não foi possível carregar seus treinos.
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  header: {
    gap: layout.cardGap,
    marginBottom: layout.cardGap,
  },
});
