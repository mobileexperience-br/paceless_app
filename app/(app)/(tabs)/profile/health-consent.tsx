import { useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { ShieldCheck } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { IconBadge } from '@/components/IconBadge';
import { InlineError } from '@/components/InlineError';
import { LegalLink } from '@/components/LegalLink';
import { Screen } from '@/components/Screen';
import { ScreenHeader } from '@/components/ScreenHeader';
import { Text } from '@/components/Text';
import { ConsentSection } from '@/components/devices/ConsentSection';
import { providerLabels } from '@/lib/healthHubLabels';
import { useHealthHub } from '@/hooks/useHealthHub';
import { useOpenLink } from '@/hooks/useOpenLink';
import { layout, sizes, spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

export default function HealthConsentScreen(): ReactElement {
  const { colors } = useTheme();
  const router = useRouter();
  const hub = useHealthHub();
  const { openLegal } = useOpenLink();
  const [busy, setBusy] = useState<boolean>(false);
  const provider = hub.provider;
  const label = provider ? providerLabels[provider] : 'Apple Saúde';
  const disconnectPlace =
    provider === 'health_connect' ? 'Health Connect' : 'Ajustes > Saúde';

  const agree = (): void => {
    setBusy(true);
    void hub.connect().then((connected) => {
      setBusy(false);
      if (connected) router.back();
    });
  };

  return (
    <Screen scroll flush>
      <ScreenHeader showBack title="Dados de saúde" />
      <View style={styles.body}>
        <IconBadge size={sizes.badgeLg}>
          <ShieldCheck size={sizes.iconLg} color={colors.ink} strokeWidth={sizes.iconStroke} />
        </IconBadge>
        <Text variant="title2">{`Conectar ${label}`}</Text>
        {provider === null ? (
          <Text variant="body" color={colors.textSecondary}>
            Disponível apenas no app do celular.
          </Text>
        ) : (
          <>
            <ConsentSection
              heading="O que o Paceless lê"
              text="Corridas e caminhadas dos últimos 30 dias: horário, duração, distância e frequência cardíaca média e máxima."
            />
            <ConsentSection
              heading="O que o Paceless grava"
              text="As corridas e caminhadas que você registra no app, com distância, duração e rota."
            />
            <ConsentSection
              heading="Para que usamos"
              text="Mostrar seu histórico em Atividades e acompanhar seu plano de treino. Não vendemos nem compartilhamos seus dados de saúde com terceiros nem usamos para publicidade."
            />
            <ConsentSection
              heading="Como desconectar"
              text={`Em Perfil > Dispositivos conectados > Desconectar. Você pode apagar os treinos importados na hora. Também dá para revogar o acesso a qualquer momento em ${disconnectPlace}.`}
            />
            <LegalLink label="Política de privacidade" onPress={(): void => { openLegal('privacy'); }} />
          </>
        )}
        <InlineError message={hub.error} />
        <View style={styles.actions}>
          {provider !== null ? (
            <Button
              label="Concordar e conectar"
              disabled={busy}
              onPress={agree}
            />
          ) : null}
          <Button variant="text" label="Agora não" onPress={(): void => { router.back(); }} />
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: layout.screenPadding,
    paddingVertical: spacing.lg,
    gap: spacing.lg,
  },
  actions: {
    gap: spacing.sm,
  },
});
