import type { ReactElement } from 'react';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import type { GpsSignal, RunTracker } from '@/hooks/useRunTracker';
import { palettes, radius, spacing, workout } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface GpsNoticeProps {
  tracker: Pick<RunTracker, 'permission' | 'signal' | 'mode' | 'canAskAgain' | 'retryTracking'>;
}

const signalMessages: Record<GpsSignal, string | null> = {
  searching: 'Procurando sinal de GPS...',
  weak: 'Sinal fraco',
  good: null,
};

function openSettings(): void {
  void Linking.openSettings();
}

export function GpsNotice({ tracker }: GpsNoticeProps): ReactElement | null {
  const { permission: state, signal, mode, canAskAgain, retryTracking } = tracker;
  const { colors } = useTheme();

  if (state === 'unavailable') {
    return (
      <Text variant="caption" center color={palettes.dark.textSecondary} style={styles.notice}>
        Distância e ritmo só estão disponíveis no app para celular.
      </Text>
    );
  }

  if (state === 'denied') {
    return (
      <View style={styles.notice}>
        <Text variant="caption" center color={palettes.dark.textSecondary}>
          Localização desativada. Permita o acesso para medir distância e ritmo.
        </Text>
        <Pressable
          accessibilityRole="button"
          onPress={canAskAgain ? retryTracking : openSettings}
          style={[styles.action, { borderColor: colors.primary }]}
        >
          <Text variant="captionStrong" color={colors.primary}>
            {canAskAgain ? 'Permitir' : 'Abrir configurações'}
          </Text>
        </Pressable>
      </View>
    );
  }

  if (state !== 'granted') return null;

  const lines = [
    signalMessages[signal],
    mode === 'foreground' ? 'Mantenha a tela ligada' : null,
  ].filter((line): line is string => line !== null);
  if (lines.length === 0) return null;

  return (
    <View style={styles.notice}>
      {lines.map((line) => (
        <Text key={line} variant="caption" center color={palettes.dark.textSecondary}>
          {line}
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  notice: {
    marginTop: spacing.md,
    alignItems: 'center',
    gap: spacing.xs,
  },
  action: {
    minHeight: workout.topBarHeight,
    paddingHorizontal: spacing.xl,
    borderWidth: 1,
    borderRadius: radius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
