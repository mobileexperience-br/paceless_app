import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import {
  Card,
  ListRow,
  Ring,
  Screen,
  SegmentedTabs,
  Text,
} from '@/components';
import { colors, layout, spacing } from '@/theme';

const tabs = ['Hoje', 'Plano', 'Receitas'] as const;

const legend = [
  { label: 'Meta', value: '— kcal' },
  { label: 'Consumidas', value: '— kcal' },
  { label: 'Proteínas', value: '— / — g' },
];

const meals = ['Café da manhã', 'Almoço', 'Jantar', 'Lanches'];

export default function NutritionScreen() {
  const [tab, setTab] = useState<string>(tabs[0]);

  return (
    <Screen scroll flush>
      <Text variant="title2" style={styles.title}>
        Nutrição
      </Text>

      <SegmentedTabs items={tabs} value={tab} onChange={setTab} />

      <View style={styles.body}>
        <Card>
          <View style={styles.summaryHeader}>
            <Text variant="captionStrong" style={styles.grow}>
              Resumo do dia
            </Text>
            <Pressable accessibilityRole="button">
              <Text variant="caption" color={colors.primaryDeep}>
                Ver detalhes
              </Text>
            </Pressable>
          </View>

          <View style={styles.summary}>
            <Ring progress={0}>
              <Text variant="title2">—</Text>
              <Text variant="label" center color={colors.textSecondary}>
                kcal restantes
              </Text>
            </Ring>

            <View style={styles.legend}>
              {legend.map((item) => (
                <View key={item.label} style={styles.legendItem}>
                  <View style={styles.legendRow}>
                    <View style={styles.dot} />
                    <Text variant="caption" color={colors.textSecondary}>
                      {item.label}
                    </Text>
                  </View>
                  <Text variant="bodyStrong">{item.value}</Text>
                </View>
              ))}
            </View>
          </View>
        </Card>

        <Card flush>
          <Text variant="captionStrong" style={styles.mealsTitle}>
            Refeições
          </Text>
          {meals.map((meal, index) => (
            <ListRow
              key={meal}
              title={meal}
              leading={<Plus size={20} color={colors.ink} strokeWidth={1.75} />}
              value="Adicionar"
              divider={index < meals.length - 1}
              onPress={() => {}}
            />
          ))}
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  title: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.md,
  },
  body: {
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.lg,
    gap: layout.cardGap,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  grow: {
    flex: 1,
  },
  summary: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.lg,
    marginTop: spacing.lg,
  },
  legend: {
    flex: 1,
    gap: spacing.md,
  },
  legendItem: {
    gap: 2,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
  },
  mealsTitle: {
    paddingHorizontal: layout.cardPadding,
    paddingTop: layout.cardPadding,
    paddingBottom: spacing.xs,
  },
});
