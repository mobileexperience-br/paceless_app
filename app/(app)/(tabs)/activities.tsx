import { useCallback, useMemo, useState, type ReactElement } from 'react';
import { ActivityIndicator, FlatList, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import {
  Card,
  Screen,
  ScreenTitle,
  SegmentedTabs,
  StatRow,
  Text,
  type Stat,
} from '@/components';
import { ActivitiesEmpty } from '@/components/activities/ActivitiesEmpty';
import { ActivityRow } from '@/components/activities/ActivityRow';
import { useActivities } from '@/hooks/useActivities';
import { usePreferences } from '@/hooks/usePreferences';
import type { Activity } from '@/lib/activities';
import {
  activityFilters,
  filterActivities,
  formatDuration,
  formatWeekDistance,
  summarizeWeek,
} from '@/lib/activityStats';
import { distanceLabel } from '@/lib/units';
import { layout, spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

export default function ActivitiesScreen(): ReactElement {
  const { colors } = useTheme();
  const { distanceUnit } = usePreferences();
  const [filter, setFilter] = useState<string>(activityFilters[0]);
  const { activities, loading, refreshing, error, load, refresh } = useActivities();

  useFocusEffect(
    useCallback((): void => {
      void load();
    }, [load]),
  );

  const now = new Date();
  const visible = useMemo<Activity[]>(
    () => filterActivities(activities, filter),
    [activities, filter],
  );
  const stats = useMemo<Stat[]>(() => {
    const week = summarizeWeek(activities, new Date());
    return [
      { value: String(week.workouts), label: 'Treinos' },
      {
        value: formatWeekDistance(week.distanceMeters, distanceUnit),
        label: distanceLabel(distanceUnit),
      },
      { value: formatDuration(week.durationSeconds), label: 'Tempo' },
    ];
  }, [activities, distanceUnit]);

  const header = (
    <View style={styles.listHeader}>
      <Text variant="captionStrong">Esta semana</Text>
      <Card>
        <StatRow stats={stats} />
      </Card>
      {error && activities.length > 0 ? (
        <Text variant="caption" color={colors.danger}>
          Não foi possível carregar seus treinos.
        </Text>
      ) : null}
    </View>
  );

  return (
    <Screen flush>
      <ScreenTitle title="Atividades" />

      <SegmentedTabs items={activityFilters} value={filter} onChange={setFilter} />

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityRow activity={item} now={now} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primaryDeep} style={styles.loader} />
          ) : (
            <ActivitiesEmpty
              filter={filter}
              allFilter={activityFilters[0]}
              failed={error !== null && activities.length === 0}
              onRetry={() => { void load(); }}
            />
          )
        }
        ItemSeparatorComponent={Separator}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => { void refresh(); }}
            tintColor={colors.primaryDeep}
            colors={[colors.primaryDeep]}
          />
        }
      />
    </Screen>
  );
}

function Separator(): ReactElement {
  return <View style={styles.separator} />;
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    paddingBottom: layout.screenBottom,
  },
  listHeader: {
    gap: layout.cardGap,
    marginBottom: layout.cardGap,
  },
  separator: {
    height: layout.cardGap,
  },
  loader: {
    paddingVertical: spacing.huge,
  },
});
