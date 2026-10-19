import type { ReactElement } from 'react';
import { StyleSheet } from 'react-native';
import { Text } from '@/components/Text';
import type { LocationState } from '@/hooks/useRunTracker';
import { colors, spacing } from '@/theme';

interface GpsNoticeProps {
  state: LocationState;
}

const messages: Record<LocationState, string | null> = {
  checking: null,
  granted: null,
  denied: 'Localização desativada. Ative nas configurações para medir distância e ritmo.',
  unavailable: 'Distância e ritmo só estão disponíveis no app para celular.',
};

export function GpsNotice({ state }: GpsNoticeProps): ReactElement | null {
  const message = messages[state];
  if (!message) return null;
  return (
    <Text variant="caption" center color={colors.dark.textSecondary} style={styles.notice}>
      {message}
    </Text>
  );
}

const styles = StyleSheet.create({
  notice: {
    marginTop: spacing.md,
  },
});
