import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { useOpenLink } from '@/hooks/useOpenLink';
import { colors, spacing } from '@/theme';

interface LinkNameProps {
  label: string;
  onPress: () => void;
}

function LinkName({ label, onPress }: LinkNameProps): ReactElement {
  return (
    <Text
      variant="captionStrong"
      color={colors.primaryDeep}
      accessibilityRole="link"
      onPress={onPress}
    >
      {label}
    </Text>
  );
}

export function LegalNotice(): ReactElement {
  const { error, openLegal } = useOpenLink();

  return (
    <View style={styles.container}>
      <Text variant="caption" color={colors.textSecondary} center>
        Ao criar conta, você aceita os{' '}
        <LinkName label="Termos de uso" onPress={() => { openLegal('terms'); }} /> e a{' '}
        <LinkName label="Política de privacidade" onPress={() => { openLegal('privacy'); }} />
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
    gap: spacing.xs,
  },
});
