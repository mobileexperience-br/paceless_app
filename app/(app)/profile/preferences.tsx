import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, ListRow, Screen, ScreenHeader, Text } from '@/components';
import { colors, layout } from '@/theme';

const options = ['Unidades de distância', 'Tema'];

export default function PreferencesScreen(): ReactElement {
  return (
    <Screen scroll flush edges={['top', 'bottom']}>
      <ScreenHeader showBack title="Preferências" />
      <View style={styles.body}>
        <Card flush>
          {options.map((option, index) => (
            <ListRow
              key={option}
              title={option}
              value="Em breve"
              divider={index < options.length - 1}
            />
          ))}
        </Card>
        <Text variant="caption" color={colors.textSecondary}>
          As preferências estarão disponíveis em uma próxima versão.
        </Text>
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
