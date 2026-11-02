import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { useOpenLink } from '@/hooks/useOpenLink';
import { spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

export function LegalNotice(): ReactElement {
  const { colors } = useTheme();
  const { error, openLegal } = useOpenLink();

  return (
    <View style={styles.container}>
      <Text variant="caption" color={colors.textSecondary} center>
        Ao criar conta, você aceita os{' '}
        <Text
          variant="captionStrong"
          color={colors.primaryDeep}
          accessibilityRole="link"
          onPress={() => { openLegal('terms'); }}
        >
          Termos de uso
        </Text>
        {' '}e a{' '}
        <Text
          variant="captionStrong"
          color={colors.primaryDeep}
          accessibilityRole="link"
          onPress={() => { openLegal('privacy'); }}
        >
          Política de privacidade
        </Text>
      </Text>
      {error ? (
        <Text variant="caption" color={colors.danger} center>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.xs,
  },
});
