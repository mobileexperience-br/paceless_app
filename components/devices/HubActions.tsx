import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { RefreshCw } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { importedLabel } from '@/lib/healthHubStatus';
import { layout, sizes, spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import type { HubAvailability, HealthProvider } from '@/types/healthHub';

interface HubActionsProps {
  provider: HealthProvider;
  availability: HubAvailability | null;
  connected: boolean;
  syncing: boolean;
  lastImported: number | null;
  label: string;
  onConnect: () => void;
  onSync: () => void;
  onDisconnect: () => void;
  onOpenStore: () => void;
}

const IOS_HINT =
  'Se seus treinos não aparecem, confira em Ajustes > Saúde > Acesso a Dados e Dispositivos > Paceless.';

export function HubActions({
  provider,
  availability,
  connected,
  syncing,
  lastImported,
  label,
  onConnect,
  onSync,
  onDisconnect,
  onOpenStore,
}: HubActionsProps): ReactElement | null {
  const { colors } = useTheme();
  if (availability === 'needsUpdate') {
    return (
      <View style={styles.actions}>
        <Text variant="caption" color={colors.textSecondary}>
          Instale ou atualize o Health Connect para continuar.
        </Text>
        <Button label="Abrir Play Store" onPress={onOpenStore} />
      </View>
    );
  }
  if (!connected) {
    return (
      <View style={styles.actions}>
        <Button label={`Conectar ${label}`} onPress={onConnect} />
      </View>
    );
  }
  return (
    <View style={styles.actions}>
      <Button
        label="Sincronizar agora"
        disabled={syncing}
        icon={<RefreshCw size={sizes.iconMd} color={colors.onPrimary} strokeWidth={sizes.iconStroke} />}
        onPress={onSync}
      />
      {lastImported !== null ? (
        <Text variant="caption" color={colors.textSecondary}>
          {importedLabel(lastImported)}
        </Text>
      ) : null}
      {provider === 'healthkit' && lastImported === 0 ? (
        <Text variant="caption" color={colors.textSecondary}>
          {IOS_HINT}
        </Text>
      ) : null}
      <Button variant="danger" label="Desconectar" onPress={onDisconnect} />
    </View>
  );
}

const styles = StyleSheet.create({
  actions: {
    gap: spacing.sm,
    paddingHorizontal: layout.cardPadding,
    paddingBottom: layout.cardPadding,
  },
});
