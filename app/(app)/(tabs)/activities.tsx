import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { ListFilter } from 'lucide-react-native';
import {
  Card,
  EmptyState,
  Screen,
  SegmentedTabs,
  StatRow,
  Text,
  type Stat,
} from '@/components';
import { colors, layout, spacing } from '@/theme';

const filters = ['Todas', 'Corrida', 'Musculação'] as const;

const emptyStats: Stat[] = [
  { value: '0', label: 'Treinos' },
  { value: '0', label: 'Km' },
  { value: '0h', label: 'Tempo' },
  { value: '0', label: 'Kcal' },
];

export default function ActivitiesScreen() {
  const [filter, setFilter] = useState<string>(filters[0]);

  return (
    <Screen flush>
      <View style={styles.header}>
        <Text variant="title2" style={styles.grow}>
          Atividades
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Filtrar" hitSlop={12}>
          <ListFilter size={22} color={colors.ink} strokeWidth={1.75} />
        </Pressable>
      </View>

      <SegmentedTabs items={filters} value={filter} onChange={setFilter} />

      <View style={styles.body}>
        <Text variant="captionStrong">Esta semana</Text>

        <Card>
          <StatRow stats={emptyStats} />
        </Card>

        <EmptyState
          title="Nenhuma atividade ainda"
          description="Seus treinos concluídos aparecem aqui."
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
  },
  grow: {
    flex: 1,
  },
  body: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    gap: layout.cardGap,
  },
});
