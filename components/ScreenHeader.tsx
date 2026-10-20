import { type ReactNode, type ReactElement } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Text } from './Text';
import { layout, palettes, sizes, spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface ScreenHeaderProps {
  title?: string;
  centerLabel?: string;
  showBack?: boolean;
  onBack?: () => void;
  trailing?: ReactNode;
  dark?: boolean;
  style?: ViewStyle;
}

export function ScreenHeader({
  title,
  centerLabel,
  showBack,
  onBack,
  trailing,
  dark,
  style,
}: ScreenHeaderProps): ReactElement {
  const { colors } = useTheme();
  const router = useRouter();
  const tint = dark ? palettes.dark.ink : colors.ink;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.bar}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={sizes.hitSlop}
            onPress={onBack ?? ((): void => { router.back(); })}
          >
            <ArrowLeft size={sizes.iconLg} color={tint} strokeWidth={sizes.iconStroke} />
          </Pressable>
        ) : null}

        {centerLabel ? (
          <Text variant="body" center color={tint} style={styles.centerLabel}>
            {centerLabel}
          </Text>
        ) : null}

        <View style={styles.spacer} />
        {trailing}
      </View>

      {title ? (
        <Text variant="title2" color={tint} style={styles.title}>
          {title}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: layout.screenPadding,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: layout.headerHeight,
    gap: spacing.md,
  },
  centerLabel: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  spacer: {
    flex: 1,
  },
  title: {
    marginTop: spacing.sm,
    marginBottom: layout.titleGap,
  },
});
