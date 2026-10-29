import type { ReactElement } from 'react';
import { Pressable, StyleSheet } from 'react-native';
import { Text } from './Text';
import { MIN_TOUCH_TARGET } from './touch';
import { useTheme } from '@/hooks/useTheme';

interface FooterLinkProps {
  prompt?: string;
  action: string;
  disabled?: boolean;
  onPress: () => void;
}

export function FooterLink({ prompt, action, disabled, onPress }: FooterLinkProps): ReactElement {
  const { colors } = useTheme();
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={prompt ? `${prompt} ${action}` : action}
      disabled={disabled}
      onPress={onPress}
      style={styles.footer}
    >
      {prompt ? (
        <Text variant="caption" color={colors.textSecondary} style={styles.text}>
          {prompt}{' '}
        </Text>
      ) : null}
      <Text variant="captionStrong" color={colors.primaryDeep} style={styles.text}>
        {action}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: MIN_TOUCH_TARGET,
  },
  text: {
    flexShrink: 1,
  },
});
