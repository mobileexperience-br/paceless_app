import type { ReactElement } from 'react';
import { ActivityIndicator, Modal, StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { palettes, spacing } from '@/theme';

interface SavingOverlayProps {
  visible: boolean;
}

export function SavingOverlay({ visible }: SavingOverlayProps): ReactElement {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => undefined}
    >
      <View style={styles.root} accessibilityViewIsModal accessibilityLiveRegion="polite">
        <ActivityIndicator color={palettes.dark.primary} size="small" />
        <Text variant="bodyStrong" color={palettes.dark.ink}>
          Salvando treino...
        </Text>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.md,
    backgroundColor: palettes.dark.scrim,
  },
});
