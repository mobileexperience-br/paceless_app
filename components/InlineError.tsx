import type { ReactElement } from 'react';
import type { ViewStyle } from 'react-native';
import { Text } from './Text';
import { useTheme } from '@/hooks/useTheme';

interface InlineErrorProps {
  message?: string | null | undefined;
  style?: ViewStyle;
}

export function InlineError({ message, style }: InlineErrorProps): ReactElement | null {
  const { colors } = useTheme();
  if (!message) return null;
  return (
    <Text
      variant="caption"
      color={colors.danger}
      accessibilityRole="alert"
      accessibilityLiveRegion="polite"
      style={style}
    >
      {message}
    </Text>
  );
}
