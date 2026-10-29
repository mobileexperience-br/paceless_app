import { useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Plus } from 'lucide-react-native';
import {
  Card,
  ListRow,
  Ring,
  Screen,
  ScreenTitle,
  SegmentedTabs,
  Text,
} from '@/components';
import { createStyles, layout, radius, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

const tabs = ['Hoje', 'Plano', 'Receitas'] as const;

const legend = [
  { label: 'Meta', value: '— kcal' },
  { label: 'Consumidas', value: '— kcal' },
  { label: 'Proteínas', value: '— / — g' },
];

const meals = ['Café da manhã', 'Almoço', 'Jantar', 'Lanches'];

export default function NutritionScreen(): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [tab, setTab] = useState<string>(tabs[0]);

  return (
    <Screen scroll flush>
      <ScreenTitle title="Nutrição" />

      <SegmentedTabs items={tabs} value={tab} onChange={setTab} />

      <View style={styles.body}>
        <Card>
          <View style={styles.summaryHeader}>
            <Text variant="captionStrong" style={styles.grow}>
              Resumo do dia
            </Text>
            <Text variant="caption" color={colors.textSecondary}>
              Ver detalhes
            </Text>
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
              leading={<Plus size={sizes.iconMd} color={colors.ink} strokeWidth={sizes.iconStroke} />}
              value="Adicionar"
              divider={index < meals.length - 1}
            />
          ))}
        </Card>
      </View>
    </Screen>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
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
      gap: sizes.micro,
    },
    legendRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    dot: {
      width: sizes.dot,
      height: sizes.dot,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
    },
    mealsTitle: {
      paddingHorizontal: layout.cardPadding,
      paddingTop: layout.cardPadding,
      paddingBottom: spacing.xs,
    },
  }),
);
