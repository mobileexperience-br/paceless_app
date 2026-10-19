import { useCallback, useMemo, useState, type ReactElement } from 'react';
import { ActivityIndicator, FlatList, Pressable, RefreshControl, StyleSheet, View } from 'react-native';
import { useFocusEffect } from 'expo-router';
import { ListFilter } from 'lucide-react-native';
import {
  Card,
  EmptyState,
  Screen,
  ScreenTitle,
  SegmentedTabs,
  StatRow,
  Text,
  type Stat,
} from '@/components';
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
import { colors, layout, sizes, spacing } from '@/theme';

const EMPTY_VALUE = '—';

export default function ActivitiesScreen(): ReactElement {
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
      { value: EMPTY_VALUE, label: 'Kcal' },
    ];
  }, [activities, distanceUnit]);

  const header = (
    <View style={styles.listHeader}>
      <Text variant="captionStrong">Esta semana</Text>
      <Card>
        <StatRow stats={stats} />
      </Card>
      {error ? (
        <Text variant="caption" color={colors.danger}>
          {error}
        </Text>
      ) : null}
    </View>
  );

  return (
    <Screen flush>
      <ScreenTitle
        title="Atividades"
        trailing={
          <Pressable accessibilityRole="button" accessibilityLabel="Filtrar" hitSlop={sizes.hitSlop}>
            <ListFilter size={sizes.iconTab} color={colors.ink} strokeWidth={sizes.iconStroke} />
          </Pressable>
        }
      />

      <SegmentedTabs items={activityFilters} value={filter} onChange={setFilter} />

      <FlatList
        data={visible}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => <ActivityRow activity={item} now={now} />}
        ListHeaderComponent={header}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={colors.primary} style={styles.loader} />
          ) : (
            <EmptyState
              title="Nenhuma atividade ainda"
              description="Seus treinos concluídos aparecem aqui."
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
            tintColor={colors.primary}
            colors={[colors.primary]}
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
