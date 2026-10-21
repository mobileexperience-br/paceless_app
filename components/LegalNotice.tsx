import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { LegalLink } from './LegalLink';
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
        Ao criar conta, você aceita os
      </Text>
      <View style={styles.links}>
        <LegalLink label="Termos de uso" onPress={() => { openLegal('terms'); }} />
        <Text variant="caption" color={colors.textSecondary}>
          e a
        </Text>
        <LegalLink label="Política de privacidade" onPress={() => { openLegal('privacy'); }} />
      </View>
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
  },
  links: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: spacing.xs,
  },
});
