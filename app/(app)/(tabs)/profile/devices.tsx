import { useCallback, useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Watch } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { Dialog } from '@/components/dialog/Dialog';
import { EmptyState } from '@/components/EmptyState';
import { InlineError } from '@/components/InlineError';
import { ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { BrandGuide } from '@/components/devices/BrandGuide';
import { StrapCard } from '@/components/devices/StrapCard';
import { HubCard } from '@/components/devices/HubCard';
import { Text } from '@/components/Text';
import { providerLabels } from '@/lib/healthHubLabels';
import { useHealthHub } from '@/hooks/useHealthHub';
import { bleSupported } from '@/lib/platform/heartRateBle';
import { openHubSettings, openStoreForUpdate } from '@/lib/platform/healthHub';
import { layout, sizes, spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

const REVOKE_HINT = 'Para revogar as permissões, toque em Gerenciar permissões.';

export default function DevicesScreen(): ReactElement {
  const { colors } = useTheme();
  const router = useRouter();
  const hub = useHealthHub();
  const [disconnectOpen, setDisconnectOpen] = useState<boolean>(false);
  const [showRevokeHint, setShowRevokeHint] = useState<boolean>(false);
  const { refresh } = hub;
  const now = new Date();

  useFocusEffect(
    useCallback(() => {
      void refresh();
    }, [refresh]),
  );

  const { provider } = hub;
  const label = provider ? providerLabels[provider] : '';
  const emptyIcon = <Watch size={sizes.iconXl} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />;

  const disconnect = (removeData: boolean): void => {
    setDisconnectOpen(false);
    void hub.disconnect(removeData).then(() => {
      if (provider === 'health_connect') setShowRevokeHint(true);
    });
  };

  return (
    <Screen scroll flush>
      <ScreenHeader showBack title="Dispositivos conectados" />
      {provider === null ? (
        <View style={styles.body}>
          <EmptyState
            icon={emptyIcon}
            title="Dispositivos conectados"
            description="Conecte o Apple Saúde ou o Health Connect pelo app no celular."
          />
        </View>
      ) : hub.availability === 'unsupported' ? (
        <View style={styles.body}>
          <EmptyState
            icon={emptyIcon}
            title="Indisponível neste aparelho"
            description={
              provider === 'healthkit'
                ? 'O app Saúde não está disponível neste aparelho.'
                : 'Seu Android não é compatível com o Health Connect.'
            }
          />
        </View>
      ) : hub.availability !== null ? (
        <View style={styles.body}>
          <HubCard
            provider={provider}
            availability={hub.availability}
            connection={hub.connection}
            syncing={hub.syncing}
            lastImported={hub.lastImported}
            now={now}
            onConnect={(): void => {
              router.push('/profile/health-consent');
            }}
            onSync={(): void => {
              void hub.sync();
            }}
            onDisconnect={(): void => {
              setDisconnectOpen(true);
            }}
            onOpenStore={(): void => {
              void openStoreForUpdate();
            }}
          />
          <InlineError message={hub.error} />
          {showRevokeHint ? (
            <Text variant="caption" color={colors.textSecondary}>
              {REVOKE_HINT}
            </Text>
          ) : null}
          <Card flush>
            <ListRow
              title="Gerenciar permissões"
              external
              onPress={(): void => {
                void openHubSettings();
              }}
            />
          </Card>
          <BrandGuide provider={provider} />
        </View>
      ) : null}
      {bleSupported() ? (
        <View style={styles.body}>
          <StrapCard />
        </View>
      ) : null}
      <Dialog
        visible={disconnectOpen}
        title={`Desconectar ${label}?`}
        message={`O Paceless para de importar e de gravar treinos. Os dados que já estão no ${label} continuam lá.`}
        actions={[
          { label: 'Desconectar e apagar importados', variant: 'danger', onPress: (): void => { disconnect(true); } },
          { label: 'Desconectar e manter treinos', variant: 'secondary', onPress: (): void => { disconnect(false); } },
          { label: 'Cancelar', variant: 'text', onPress: (): void => { setDisconnectOpen(false); } },
        ]}
        onDismiss={(): void => {
          setDisconnectOpen(false);
        }}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.lg,
  },
});
