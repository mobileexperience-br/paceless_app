import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { useOpenLink } from '@/hooks/useOpenLink';
import { links } from '@/lib/links';
import { colors, spacing } from '@/theme';

interface LinkNameProps {
  label: string;
  url: string | null;
  onOpen: (url: string) => Promise<void>;
}

function LinkName({ label, url, onOpen }: LinkNameProps): ReactElement {
  if (!url) {
    return <Text variant="caption" color={colors.textSecondary}>{label}</Text>;
  }
  return (
    <Text
      variant="captionStrong"
      color={colors.primaryDeep}
      accessibilityRole="link"
      onPress={() => { void onOpen(url); }}
    >
      {label}
    </Text>
  );
}

export function LegalNotice(): ReactElement {
  const { error, openUrl } = useOpenLink();

  return (
    <View style={styles.container}>
      <Text variant="caption" color={colors.textSecondary} center>
        Ao criar conta, você aceita os{' '}
        <LinkName label="Termos de uso" url={links.termsUrl} onOpen={openUrl} /> e a{' '}
        <LinkName label="Política de privacidade" url={links.privacyUrl} onOpen={openUrl} />
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
