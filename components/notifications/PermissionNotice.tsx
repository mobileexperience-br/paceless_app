import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Text } from '@/components/Text';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';
import { openSystemSettings } from '@/lib/platform/reminders';
import { createStyles, spacing } from '@/theme';

export function PermissionNotice(): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <Card>
      <View style={styles.content}>
        <Text variant="caption" color={colors.textSecondary}>
          As notificações estão desativadas nas configurações do aparelho. Para receber os lembretes, ative por lá.
        </Text>
        <Button label="Abrir configurações" variant="secondary" onPress={openSystemSettings} />
      </View>
    </Card>
  );
}

const makeStyles = createStyles(() =>
  StyleSheet.create({
    content: {
      gap: spacing.md,
    },
  }),
);
