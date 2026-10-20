import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Card, ListRow, Screen, ScreenHeader, Text } from '@/components';
import { useOpenLink } from '@/hooks/useOpenLink';
import { HEALTH_DISCLAIMER } from '@/lib/healthDisclaimer';
import { links } from '@/lib/links';
import { layout } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface Topic {
  title: string;
  onPress: () => void;
}

export default function HelpScreen(): ReactElement {
  const { colors } = useTheme();
  const router = useRouter();
  const { error, openUrl, openSupportEmail, openLegal } = useOpenLink();
  const { faqUrl, supportEmail, accountDeletionUrl } = links;

  const topics: Topic[] = [
    {
      title: 'Perguntas frequentes',
      onPress: (): void => {
        if (faqUrl) {
          void openUrl(faqUrl);
          return;
        }
        router.push('/profile/faq');
      },
    },
    ...(supportEmail
      ? [{ title: 'Fale conosco', onPress: (): void => void openSupportEmail(supportEmail) }]
      : []),
    { title: 'Termos de uso', onPress: (): void => { openLegal('terms'); } },
    { title: 'Política de privacidade', onPress: (): void => { openLegal('privacy'); } },
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
              onPress={topic.onPress}
              showChevron
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
