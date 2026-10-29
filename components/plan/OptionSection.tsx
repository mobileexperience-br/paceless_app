import type { ReactElement } from 'react';
import { View } from 'react-native';
import { SelectableCard } from '@/components/paywall/SelectableCard';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import { spacing } from '@/theme';

interface OptionSectionProps<T extends string> {
  title: string;
  subtitle?: string;
  options: readonly { id: T; label: string }[];
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
    <View style={{ gap: spacing.sm }}>
      <Text variant="captionStrong">{title}</Text>
      {subtitle ? (
        <Text variant="caption" color={colors.textSecondary}>
          {subtitle}
        </Text>
      ) : null}
      <View accessibilityRole="radiogroup" accessibilityLabel={title} style={{ gap: spacing.sm }}>
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
            <Text variant="bodyStrong" style={{ flexShrink: 1 }}>
              {option.label}
            </Text>
          </SelectableCard>
        ))}
      </View>
    </View>
  );
}
