import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Crown } from 'lucide-react-native';
import { Button, Text } from '@/components';
import { createStyles, layout, radius, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

interface PremiumLockCardProps {
  freeWeeks: number;
  fullWeeks: number;
  locked: boolean;
}

export function PremiumLockCard({ freeWeeks, fullWeeks, locked }: PremiumLockCardProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const description = locked
    ? `Seu plano gratuito inclui as ${String(freeWeeks)} primeiras semanas. Assine para liberar as ${String(fullWeeks)} semanas.`
    : 'Seu plano gratuito inclui as primeiras semanas. Assine para liberar o plano completo.';

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Crown size={sizes.iconLg} color={colors.primaryDeep} strokeWidth={sizes.iconStroke} />
        <Text variant="bodyStrong" style={styles.title}>
          Desbloqueie o plano completo
        </Text>
      </View>
      <Text variant="caption" color={colors.textSecondary}>
        {description}
      </Text>
      <Button
        label="Ver planos"
        onPress={() => {
          router.push('/plan-paywall');
        }}
      />
    </View>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.primarySoft,
      borderRadius: radius.lg,
      padding: layout.cardPadding,
      gap: spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    title: {
      flexGrow: 1,
      flexShrink: 1,
    },
  }),
);
