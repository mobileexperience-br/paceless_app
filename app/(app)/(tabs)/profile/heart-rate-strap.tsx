import { useCallback, useState, type ReactElement } from 'react';
import { ActivityIndicator, Linking, Platform, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Bluetooth } from 'lucide-react-native';
import { Button, Card, EmptyState, InlineError, Screen, ScreenHeader, Text } from '@/components';
import { StrapDeviceList } from '@/components/devices/StrapDeviceList';
import { useHeartRateStrap } from '@/hooks/useHeartRateStrap';
import { useStrapPairing, type PairingPhase } from '@/hooks/useStrapPairing';
import { openBluetoothSettings } from '@/lib/platform/heartRateBle';
import { layout, sizes, spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

const INTRO_TEXT =
  'Ligue a cinta e molhe os eletrodos, ou ative a transmissão de frequência cardíaca no relógio. Mantenha o aparelho perto do celular.';
const DATA_TEXT =
  'Durante o treino, o Paceless registra sua frequência cardíaca (batimentos por minuto, média e máxima) junto com a atividade e guarda esses dados na sua conta. Você pode remover a cinta a qualquer momento em Dispositivos conectados.';
const CONSENT_TEXT =
  'O Paceless usa o Bluetooth só nesta tela e durante o treino. Ao tocar em Procurar cinta, você concorda com o registro desses dados.';
const PERMISSION_TEXT =
  'Permita o acesso ao Bluetooth (Dispositivos próximos) para o Paceless encontrar sua cinta.';

export default function HeartRateStrapScreen(): ReactElement {
  const { colors } = useTheme();
  const router = useRouter();
  const { phase, devices, selectedId, bpm, readingTimedOut, scanEnded, start, rescan, select, stop } =
    useStrapPairing();
  const { save, error } = useHeartRateStrap();
  const [saving, setSaving] = useState<boolean>(false);
  const selected = devices.find((device) => device.id === selectedId) ?? null;

  useFocusEffect(useCallback((): (() => void) => stop, [stop]));

  const confirmSelection = async (): Promise<void> => {
    if (selected === null || saving) return;
    setSaving(true);
    const saved = await save({ id: selected.id, name: selected.name });
    setSaving(false);
    if (!saved) return;
    stop();
    router.back();
  };

  const retry = (): void => {
    void start();
  };

  const permissionAction = (current: PairingPhase): ReactElement => {
    if (current === 'unauthorized' && Platform.OS === 'android') {
      return <Button label="Permitir" onPress={retry} />;
    }
    return <Button label="Abrir configurações" onPress={() => { void Linking.openSettings(); }} />;
  };

  const renderPhase = (): ReactElement | null => {
    if (phase === 'intro') {
      return (
        <Card>
          <View style={styles.intro}>
            <Text variant="body">{INTRO_TEXT}</Text>
            <Text variant="body">{DATA_TEXT}</Text>
            <Text variant="caption" color={colors.textSecondary}>{CONSENT_TEXT}</Text>
            <Button label="Procurar cinta" onPress={retry} />
          </View>
        </Card>
      );
    }
    if (phase === 'bluetoothOff') {
      return (
        <View style={styles.panel}>
          <Text variant="bodyStrong">O Bluetooth está desligado.</Text>
          <Button label="Abrir ajustes do Bluetooth" onPress={() => { void openBluetoothSettings(); }} />
          <Button label="Tentar de novo" variant="text" onPress={retry} />
        </View>
      );
    }
    if (phase === 'unauthorized' || phase === 'blocked') {
      return (
        <View style={styles.panel}>
          <Text variant="body">{PERMISSION_TEXT}</Text>
          <Text variant="body">{DATA_TEXT}</Text>
          {permissionAction(phase)}
        </View>
      );
    }
    if (phase === 'unsupported') {
      return (
        <EmptyState
          icon={<Bluetooth size={sizes.iconXl} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />}
          title="Bluetooth indisponível neste aparelho."
        />
      );
    }
    if (phase === 'failed' || phase === 'notFound') {
      const message = phase === 'failed' ? 'Não foi possível procurar cintas.' : 'Nenhuma cinta encontrada.';
      return (
        <View style={styles.panel}>
          <Text variant="bodyStrong">{message}</Text>
          <Button label={phase === 'failed' ? 'Tentar de novo' : 'Procurar de novo'} onPress={retry} />
        </View>
      );
    }
    if (phase === 'scanning') {
      return (
        <View style={styles.panel}>
          {scanEnded ? (
            <Button label="Procurar de novo" variant="text" onPress={rescan} />
          ) : (
            <View style={styles.scanning}>
              <ActivityIndicator color={colors.primary} />
              <Text variant="caption" color={colors.textSecondary}>Procurando cintas...</Text>
            </View>
          )}
          <StrapDeviceList
            devices={devices}
            selectedId={selectedId}
            bpm={bpm}
            readingTimedOut={readingTimedOut}
            onSelect={select}
          />
          <InlineError message={error} />
          <Button label="Usar esta cinta" disabled={selected === null || saving} onPress={() => { void confirmSelection(); }} />
        </View>
      );
    }
    return null;
  };

  return (
    <Screen scroll flush>
      <ScreenHeader showBack title="Parear cinta cardíaca" />
      <View style={styles.body}>{renderPhase()}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: layout.screenPadding,
  },
  panel: {
    gap: spacing.md,
    marginTop: spacing.sm,
  },
  intro: {
    gap: spacing.md,
    padding: layout.cardPadding,
  },
  scanning: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
});
