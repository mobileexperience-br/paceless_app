import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { AssetPlaceholder, Card, ProgressBar, Text } from '@/components';
import { createStyles, layout, radius, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

interface PlanHeroProps {
  name: string;
  weekNumber: number;
  fullWeeks: number;
  weekTitle: string;
  done: number;
  total: number;
}

export function PlanHero({
  name,
  weekNumber,
  fullWeeks,
  weekTitle,
  done,
  total,
}: PlanHeroProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const progress = total === 0 ? 0 : done / total;

  return (
    <Card flush>
      <View style={styles.hero}>
        <View style={styles.heroText}>
          <Text variant="title3" color={colors.onPrimary} numberOfLines={2}>
            {name}
          </Text>
          <Text variant="caption" color={colors.onPrimary}>
            {`Semana ${String(weekNumber)} de ${String(fullWeeks)}`}
          </Text>
        </View>
        <AssetPlaceholder label="ilustração do plano" rounded="sm" style={styles.heroArt} />
      </View>

      <View style={styles.footer}>
        {weekTitle ? (
          <Text variant="bodyStrong" numberOfLines={2}>
            {weekTitle}
          </Text>
        ) : null}
        <ProgressBar
          progress={progress}
          accessibilityValue={{ min: 0, max: total, now: done }}
        />
        <Text variant="caption" color={colors.textSecondary}>
          {`${String(done)} de ${String(total)} treinos`}
        </Text>
      </View>
    </Card>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
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
    footer: {
      padding: layout.cardPadding,
      gap: spacing.md,
    },
  }),
);
