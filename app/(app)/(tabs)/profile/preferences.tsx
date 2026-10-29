import { useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Check } from 'lucide-react-native';
import { useRouter } from 'expo-router';
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
  error?: string | null;
  onSelect: (value: T) => void;
}

function OptionGroup<T extends string>({
  title,
  options,
  selected,
  error = null,
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
            accessibilityRole="radio"
            accessibilityState={{ selected: option.value === selected }}
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
      {error ? (
        <Text variant="caption" color={colors.danger} accessibilityRole="alert" accessibilityLiveRegion="assertive">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

export default function PreferencesScreen(): ReactElement {
  const { distanceUnit, theme, error, setDistanceUnit, setTheme } = usePreferences();
  const [lastGroup, setLastGroup] = useState<'unit' | 'theme'>('unit');
  const router = useRouter();
  const { maxHeartRate } = usePreferences();

  return (
    <Screen scroll flush>
      <ScreenHeader showBack title="Preferências" />
      <View style={styles.body}>
        <OptionGroup
          title="Unidades de distância"
          options={unitOptions}
          selected={distanceUnit}
          error={lastGroup === 'unit' ? error : null}
          onSelect={(value) => {
            setLastGroup('unit');
            void setDistanceUnit(value);
          }}
        />
        <OptionGroup
          title="Tema"
          options={themeOptions}
          selected={theme}
          error={lastGroup === 'theme' ? error : null}
          onSelect={(value) => {
            setLastGroup('theme');
            void setTheme(value);
          }}
        />
        <View style={styles.group}>
          <Text variant="captionStrong">Treino</Text>
          <Card flush>
            <ListRow
              title="Frequência cardíaca máxima"
              value={maxHeartRate ? `${maxHeartRate} bpm` : 'Não definida'}
              showChevron
              onPress={() => {
                router.push('/profile/heart-rate');
              }}
            />
          </Card>
        </View>
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
