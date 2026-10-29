import { useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { HeartPulse } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Dialog } from '@/components/dialog/Dialog';
import { IconBadge } from '@/components/IconBadge';
import { InlineError } from '@/components/InlineError';
import { ListRow } from '@/components/ListRow';
import { Text } from '@/components/Text';
import { useHeartRateStrap } from '@/hooks/useHeartRateStrap';
import { useTheme } from '@/hooks/useTheme';
import { layout, sizes, spacing } from '@/theme';

const NO_STRAP_TEXT = 'Conecte uma cinta Bluetooth ou um relógio que transmite FC para ver seus batimentos durante o treino.';
const CONNECTED_HINT = 'Conecta sozinha quando você começa um treino.';

export function StrapCard(): ReactElement {
  const { colors } = useTheme();
  const router = useRouter();
  const { strap, error, remove } = useHeartRateStrap();
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false);
  const goToPairing = (): void => {
    router.push('/profile/heart-rate-strap');
  };

  return (
    <Card flush>
      <View style={styles.header}>
        <IconBadge tone="soft">
          <HeartPulse size={sizes.iconLg} color={colors.primary} strokeWidth={sizes.iconStroke} />
        </IconBadge>
        <View style={styles.titleBlock}>
          <Text variant="title3">Cinta cardíaca</Text>
          <Text variant="caption" color={colors.textSecondary}>
            {strap ? strap.name : NO_STRAP_TEXT}
          </Text>
        </View>
      </View>

      {strap ? (
        <>
          <Text variant="caption" color={colors.textSecondary} style={styles.hint}>
            {CONNECTED_HINT}
          </Text>
          <ListRow title="Trocar cinta" showChevron divider onPress={goToPairing} />
          <ListRow
            title="Remover cinta"
            tone="danger"
            onPress={() => {
              setConfirmOpen(true);
            }}
          />
        </>
      ) : (
        <View style={styles.action}>
          <Button label="Parear cinta" onPress={goToPairing} />
        </View>
      )}
      <View style={styles.error}>
        <InlineError message={error} />
      </View>

      <Dialog
        visible={confirmOpen}
        title="Remover cinta?"
        message="O Paceless deixa de se conectar a ela nos treinos."
        actions={[
          {
            label: 'Remover',
            variant: 'danger',
            onPress: (): void => {
              setConfirmOpen(false);
              void remove();
            },
          },
          {
            label: 'Cancelar',
            variant: 'text',
            onPress: (): void => {
              setConfirmOpen(false);
            },
          },
        ]}
        onDismiss={() => {
          setConfirmOpen(false);
        }}
      />
    </Card>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: layout.cardPadding,
  },
  titleBlock: {
    flexShrink: 1,
    gap: spacing.xs,
  },
  hint: {
    paddingHorizontal: layout.cardPadding,
    paddingBottom: spacing.sm,
  },
  action: {
    paddingHorizontal: layout.cardPadding,
    paddingBottom: layout.cardPadding,
  },
  error: {
    paddingHorizontal: layout.cardPadding,
    paddingBottom: spacing.sm,
  },
});
