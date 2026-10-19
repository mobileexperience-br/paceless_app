import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, ListRow, Screen, ScreenHeader } from '@/components';
import { layout } from '@/theme';

const topics = [
  'Perguntas frequentes',
  'Fale conosco',
  'Termos de uso',
  'Política de privacidade',
];

export default function HelpScreen(): ReactElement {
  return (
    <Screen scroll flush>
      <ScreenHeader showBack title="Ajuda e suporte" />
      <View style={styles.body}>
        <Card flush>
          {topics.map((topic, index) => (
            <ListRow key={topic} title={topic} divider={index < topics.length - 1} />
          ))}
        </Card>
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
