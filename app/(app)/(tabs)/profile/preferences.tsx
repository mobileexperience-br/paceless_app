import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { Card, ListRow, Screen, ScreenHeader, Text } from '@/components';
import { usePreferences } from '@/hooks/usePreferences';
import { layout, sizes, spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import type { DistanceUnit, ThemePreference } from '@/types/preferences';

interface Option<T extends string> {
  value: T;
  label: string;
}

const unitOptions: readonly Option<DistanceUnit>[] = [
  { value: 'km', label: 'Quilômetros' },
  { value: 'mi', label: 'Milhas' },
];

const themeOptions: readonly Option<ThemePreference>[] = [
  { value: 'system', label: 'Sistema' },
  { value: 'light', label: 'Claro' },
  { value: 'dark', label: 'Escuro' },
];

interface OptionGroupProps<T extends string> {
  title: string;
  options: readonly Option<T>[];
  selected: T;
  onSelect: (value: T) => void;
}

function OptionGroup<T extends string>({
  title,
  options,
  selected,
  onSelect,
}: OptionGroupProps<T>): ReactElement {
  const { colors } = useTheme();
  return (
    <View style={styles.group}>
      <Text variant="captionStrong">{title}</Text>
      <Card flush>
        {options.map((option, index) => (
          <ListRow
            key={option.value}
            title={option.label}
            divider={index < options.length - 1}
            onPress={() => {
              onSelect(option.value);
            }}
            trailing={
              option.value === selected ? (
                <Check size={sizes.iconLg} color={colors.primary} strokeWidth={sizes.iconStroke} />
              ) : null
            }
          />
        ))}
      </Card>
    </View>
  );
}

export default function PreferencesScreen(): ReactElement {
  const { colors } = useTheme();
  const { distanceUnit, theme, error, setDistanceUnit, setTheme } = usePreferences();

  return (
    <Screen scroll flush edges={['top', 'bottom']}>
      <ScreenHeader showBack title="Preferências" />
      <View style={styles.body}>
        <OptionGroup
          title="Unidades de distância"
          options={unitOptions}
          selected={distanceUnit}
          onSelect={(value) => {
            void setDistanceUnit(value);
          }}
        />
        <OptionGroup
          title="Tema"
          options={themeOptions}
          selected={theme}
          onSelect={(value) => {
            void setTheme(value);
          }}
        />
        {error ? (
          <Text variant="caption" color={colors.danger}>
            {error}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: layout.screenPadding,
    gap: layout.cardGap,
  },
  group: {
    gap: spacing.sm,
  },
});
