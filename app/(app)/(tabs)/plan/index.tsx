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
  ScreenTitle,
  Text,
} from '@/components';
import { colors, layout, radius, sizes, spacing } from '@/theme';

export default function PlanScreen(): ReactElement {
  const router = useRouter();

  return (
    <Screen scroll flush>
      <ScreenTitle title="Plano" />
      <View style={styles.body}>

        <Card flush>
          <View style={styles.hero}>
            <View style={styles.heroText}>
              <Text variant="title3">Nenhum plano ativo</Text>
              <Text variant="caption">Escolha um plano para começar</Text>
            </View>
            <AssetPlaceholder
              label="ilustração do plano"
              rounded="sm"
              style={styles.heroArt}
            />
          </View>

          <View style={styles.heroFooter}>
            <Text variant="bodyStrong">Nenhuma semana em andamento</Text>
            <View style={styles.heroProgress}>
              <ProgressBar progress={0} style={styles.grow} />
              <Text variant="caption" color={colors.textSecondary}>
                —
              </Text>
            </View>
          </View>
        </Card>

        <Card flush>
          <ListRow
            title="Visão geral do plano"
            leading={
              <CalendarCheck size={sizes.iconTab} color={colors.ink} strokeWidth={sizes.iconStroke} />
            }
            showChevron
            divider
            onPress={() => { router.push('/plan/week/1'); }}
          />
          <ListRow
            title="Calendário de treinos"
            leading={
              <CalendarDays size={sizes.iconTab} color={colors.ink} strokeWidth={sizes.iconStroke} />
            }
            showChevron
            divider
            onPress={() => { router.push('/plan/week/1'); }}
          />
          <ListRow
            title="Configurações do plano"
            leading={<Settings size={sizes.iconTab} color={colors.ink} strokeWidth={sizes.iconStroke} />}
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
  hero: {
    backgroundColor: colors.primary,
    padding: layout.cardPadding,
    gap: spacing.lg,
  },
  heroText: {
    gap: spacing.xs,
  },
  heroArt: {
    height: sizes.planArtHeight,
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
