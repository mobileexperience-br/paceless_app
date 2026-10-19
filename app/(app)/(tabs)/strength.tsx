import { useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import {
  Button,
  EmptyState,
  Screen,
  ScreenTitle,
  SegmentedTabs,
} from '@/components';
import { layout, spacing } from '@/theme';

const tabs = ['Treinos', 'Exercícios'] as const;

export default function StrengthScreen(): ReactElement {
  const [tab, setTab] = useState<string>(tabs[0]);

  return (
    <Screen flush>
      <ScreenTitle title="Musculação" />

      <SegmentedTabs items={tabs} value={tab} onChange={setTab} />

      <View style={styles.body}>
        <EmptyState
          title={tab === 'Treinos' ? 'Nenhum treino ainda' : 'Nenhum exercício ainda'}
          description={
            tab === 'Treinos'
              ? 'Crie seu primeiro treino de força.'
              : 'Os exercícios dos seus treinos aparecem aqui.'
          }
        />
      </View>

      <View style={styles.footer}>
        <Button label="Novo treino" />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.lg,
  },
});
