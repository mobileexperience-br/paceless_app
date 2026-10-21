import type { ReactElement } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from './Text';
import { MIN_TOUCH_TARGET } from './touch';
import { useTheme } from '@/hooks/useTheme';

interface LegalLinkProps {
  label: string;
  onPress: () => void;
}

export function LegalLink({ label, onPress }: LegalLinkProps): ReactElement {
  const { colors } = useTheme();
  return (
    <Pressable accessibilityRole="link" onPress={onPress} style={styles.link}>
      <Text variant="captionStrong" color={colors.primaryDeep}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  link: {
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
  },
});
