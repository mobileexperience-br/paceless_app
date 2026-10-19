import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarCheck, CalendarDays, Settings } from 'lucide-react-native';
import {
  AssetPlaceholder,
  Card,
  ListRow,
  ProgressBar,
  Screen,
  Text,
} from '@/components';
import { colors, layout, radius, spacing } from '@/theme';

export default function PlanScreen(): ReactElement {
  const router = useRouter();

  return (
    <Screen scroll flush>
      <View style={styles.body}>
        <Text variant="title2" style={styles.title}>
          Plano
        </Text>

        <Card flush>
          <View style={styles.hero}>
            <View style={styles.heroText}>
              <Text variant="title3">New To Running Plan</Text>
              <Text variant="caption">8 semanas • 3–4 treinos/semana</Text>
            </View>
            <AssetPlaceholder
              label="ilustração do plano"
              rounded="sm"
              style={styles.heroArt}
            />
          </View>

          <View style={styles.heroFooter}>
            <Text variant="bodyStrong">Semana 1 de 8</Text>
            <View style={styles.heroProgress}>
              <ProgressBar progress={0} style={styles.grow} />
              <Text variant="caption" color={colors.textSecondary}>
                0%
              </Text>
            </View>
          </View>
        </Card>

        <Card flush>
          <ListRow
            title="Visão geral do plano"
            leading={
              <CalendarCheck size={22} color={colors.ink} strokeWidth={1.75} />
            }
            showChevron
            divider
            onPress={() => { router.push('/week/1'); }}
          />
          <ListRow
            title="Calendário de treinos"
            leading={
              <CalendarDays size={22} color={colors.ink} strokeWidth={1.75} />
            }
            showChevron
            divider
            onPress={() => { router.push('/week/1'); }}
          />
          <ListRow
            title="Configurações do plano"
            leading={<Settings size={22} color={colors.ink} strokeWidth={1.75} />}
            showChevron
          />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: layout.screenPadding,
    gap: layout.cardGap,
  },
  title: {
    paddingVertical: spacing.md,
  },
  hero: {
    backgroundColor: colors.primary,
    padding: layout.cardPadding,
    gap: spacing.lg,
  },
  heroText: {
    gap: spacing.xs,
  },
  heroArt: {
    height: 132,
    borderRadius: radius.sm,
    backgroundColor: colors.primarySoft,
  },
  heroFooter: {
    padding: layout.cardPadding,
    gap: spacing.md,
  },
  heroProgress: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  grow: {
    flex: 1,
  },
});
