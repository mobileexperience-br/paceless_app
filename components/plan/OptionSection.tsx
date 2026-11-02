import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { SelectableCard } from '@/components/paywall/SelectableCard';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';

interface OptionSectionProps<T extends string> {
  title: string;
  subtitle?: string;
  options: readonly { id: T; label: string; description?: string }[];
  selected: T | null;
  disabled?: boolean;
  onSelect: (id: T) => void;
}

export function OptionSection<T extends string>({
  title,
  subtitle,
  options,
  selected,
  disabled = false,
  onSelect,
}: OptionSectionProps<T>): ReactElement {
  const { colors } = useTheme();
  return (
    <View style={styles.section}>
      <Text variant="captionStrong">{title}</Text>
      {subtitle ? (
        <Text variant="caption" color={colors.textSecondary}>
          {subtitle}
        </Text>
      ) : null}
      <View accessibilityRole="radiogroup" accessibilityLabel={title} style={styles.section}>
        {options.map((option) => (
          <SelectableCard
            key={option.id}
            active={option.id === selected}
            disabled={disabled}
            accessibilityLabel={option.label}
            onPress={() => {
              onSelect(option.id);
            }}
          >
            <Text variant="bodyStrong" style={styles.shrink}>
              {option.label}
            </Text>
            {option.description ? (
              <Text variant="caption" color={colors.textSecondary} style={styles.shrink}>
                {option.description}
              </Text>
            ) : null}
          </SelectableCard>
        ))}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    gap: spacing.sm,
  },
  shrink: {
    flexShrink: 1,
  },
});
