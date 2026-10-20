import type { ReactElement, ReactNode } from 'react';
import { StyleSheet } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';

interface ModalSafeAreaProps {
  children: ReactNode;
}

export function ModalSafeArea({ children }: ModalSafeAreaProps): ReactElement {
  return <SafeAreaProvider style={styles.fill}>{children}</SafeAreaProvider>;
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
