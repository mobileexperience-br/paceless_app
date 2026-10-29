import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from '@/components/Text';
import { spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface ConsentSectionProps {
  heading: string;
  text: string;
}

export function ConsentSection({ heading, text }: ConsentSectionProps): ReactElement {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text variant="captionStrong">{heading}</Text>
      <Text variant="body" color={colors.textSecondary}>
        {text}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.xs,
  },
});
