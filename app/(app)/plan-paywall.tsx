import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { X } from 'lucide-react-native';
import { Screen } from '@/components';
import { PaywallContent } from '@/components/paywall/PaywallContent';
import { useActivePlan } from '@/hooks/useActivePlan';
import { useDialog } from '@/hooks/useDialog';
import { useGeneratePlan } from '@/hooks/useGeneratePlan';
import { createStyles, layout, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

export default function PlanPaywallScreen(): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { alert } = useDialog();
  const { generate } = useGeneratePlan();
  const { reload } = useActivePlan();

  const completeUpgrade = async (): Promise<void> => {
    const result = await generate(true);
    if (result.error) {
      await alert({ title: 'Plano não atualizado', message: result.error });
    } else {
      const plan = await reload();
      if (plan?.tier === 'free') {
        await alert({
          title: 'Assinatura confirmada',
          message: 'Seu plano completo será liberado em instantes.',
        });
      }
    }
    router.back();
  };

  return (
    <Screen flush>
      <View style={styles.bar}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Fechar"
          hitSlop={sizes.hitSlop}
          onPress={() => {
            router.back();
          }}
          style={styles.close}
        >
          <X size={sizes.iconLg} color={colors.ink} strokeWidth={sizes.iconStroke} />
        </Pressable>
      </View>
      <PaywallContent
        onPurchased={() => {
          void completeUpgrade();
        }}
      />
    </Screen>
  );
}

const makeStyles = createStyles(() =>
  StyleSheet.create({
    bar: {
      alignItems: 'flex-end',
      paddingHorizontal: layout.screenPadding,
      paddingTop: spacing.sm,
    },
    close: {
      alignItems: 'center',
      justifyContent: 'center',
      minWidth: layout.headerHeight,
      minHeight: layout.headerHeight,
    },
  }),
);
