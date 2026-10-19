import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, ListRow, Screen, ScreenHeader, Text } from '@/components';
import { useOpenLink } from '@/hooks/useOpenLink';
import { HEALTH_DISCLAIMER } from '@/lib/healthDisclaimer';
import { links } from '@/lib/links';
import { colors, layout } from '@/theme';

interface Topic {
  title: string;
  onPress: (() => void) | null;
}

export default function HelpScreen(): ReactElement {
  const { error, openUrl, openSupportEmail } = useOpenLink();
  const { faqUrl, supportEmail, termsUrl, privacyUrl, accountDeletionUrl } = links;

  const topics: Topic[] = [
    { title: 'Perguntas frequentes', onPress: faqUrl ? (): void => void openUrl(faqUrl) : null },
    {
      title: 'Fale conosco',
      onPress: supportEmail ? (): void => void openSupportEmail(supportEmail) : null,
    },
    { title: 'Termos de uso', onPress: termsUrl ? (): void => void openUrl(termsUrl) : null },
    {
      title: 'Política de privacidade',
      onPress: privacyUrl ? (): void => void openUrl(privacyUrl) : null,
    },
    ...(accountDeletionUrl
      ? [{ title: 'Excluir conta pela web', onPress: (): void => void openUrl(accountDeletionUrl) }]
      : []),
  ];

  return (
    <Screen scroll flush>
      <ScreenHeader showBack title="Ajuda e suporte" />
      <View style={styles.body}>
        <Card flush>
          {topics.map((topic, index) => (
            <ListRow
              key={topic.title}
              title={topic.title}
              divider={index < topics.length - 1}
              {...(topic.onPress
                ? { onPress: topic.onPress, showChevron: true }
                : { value: 'Em breve' })}
            />
          ))}
        </Card>
        <Text variant="caption" color={colors.textSecondary}>
          {HEALTH_DISCLAIMER}
        </Text>
        {error ? (
          <Text variant="caption" color={colors.danger}>
            {error}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: layout.screenPadding,
    gap: layout.cardGap,
  },
});
