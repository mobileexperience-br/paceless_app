import type { ReactElement } from 'react';
import { ActivityIndicator, StyleSheet, Switch, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Bell, BellOff } from 'lucide-react-native';
import { Card, EmptyState, InlineError, ListRow, Screen, ScreenHeader, Text } from '@/components';
import { PermissionNotice } from '@/components/notifications/PermissionNotice';
import { ReminderTimeStepper } from '@/components/notifications/ReminderTimeStepper';
import { useNotificationSettings } from '@/hooks/useNotificationSettings';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';
import { trainingDaysLabel } from '@/lib/reminderCopy';
import { createStyles, layout, sizes, spacing } from '@/theme';

export default function NotificationsScreen(): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const state = useNotificationSettings();

  const renderBody = (): ReactElement => {
    if (state.loading) {
      return (
        <View style={styles.loading}>
          <ActivityIndicator color={colors.textSecondary} />
        </View>
      );
    }
    if (state.permission === 'unavailable') {
      return (
        <EmptyState
          icon={<BellOff size={sizes.iconXl} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />}
          title="Notificações"
          description="Os lembretes de treino funcionam no app para celular."
        />
      );
    }
    return (
      <View style={styles.body}>
        <Text variant="captionStrong">Lembretes de treino</Text>
        <Card flush>
          <ListRow
            title="Lembrete nos dias de treino"
            subtitle="Um aviso no horário que você escolher."
            leading={<Bell size={sizes.iconLg} color={colors.ink} strokeWidth={sizes.iconStroke} />}
            trailing={
              <Switch
                value={state.enabled}
                onValueChange={(value: boolean): void => { void state.toggle(value); }}
                disabled={state.saving}
                trackColor={{ true: colors.primary, false: colors.track }}
                thumbColor={colors.white}
                accessibilityLabel="Lembretes de treino"
              />
            }
          />
        </Card>
        {state.permission === 'denied' ? <PermissionNotice /> : null}
        {state.permission === 'undetermined' && !state.enabled ? (
          <Text variant="caption" color={colors.textSecondary}>
            Vamos pedir sua permissão para mostrar os lembretes. Você pode desligar quando quiser.
          </Text>
        ) : null}
        {state.enabled ? (
          <>
            <Text variant="captionStrong">Horário</Text>
            <Card>
              <ReminderTimeStepper time={state.time} onChange={state.changeTime} />
            </Card>
          </>
        ) : null}
        <Text variant="captionStrong">Dias de treino</Text>
        <Card flush>
          <ListRow
            title={trainingDaysLabel(state.days)}
            subtitle="Definido em Configurações do plano"
            showChevron
            onPress={(): void => { router.push('/plan/settings'); }}
          />
        </Card>
        <InlineError message={state.error} />
      </View>
    );
  };

  return (
    <Screen scroll flush>
      <ScreenHeader showBack title="Notificações" />
      {renderBody()}
    </Screen>
  );
}

const makeStyles = createStyles(() =>
  StyleSheet.create({
    body: {
      paddingHorizontal: layout.screenPadding,
      gap: layout.cardGap,
    },
    loading: {
      paddingVertical: spacing.huge,
      alignItems: 'center',
    },
  }),
);
