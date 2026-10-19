import { type ReactNode } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { ArrowLeft } from 'lucide-react-native';
import { useRouter } from 'expo-router';
import { Text } from './Text';
import { colors, layout, spacing } from '@/theme';

type ScreenHeaderProps = {
  title?: string;
  /** Rótulo centralizado no lugar do título, como "1 / 4". */
  centerLabel?: string;
  showBack?: boolean;
  trailing?: ReactNode;
  dark?: boolean;
  style?: ViewStyle;
};

export function ScreenHeader({
  title,
  centerLabel,
  showBack,
  trailing,
  dark,
  style,
}: ScreenHeaderProps) {
  const router = useRouter();
  const tint = dark ? colors.dark.text : colors.ink;

  return (
    <View style={[styles.container, style]}>
      <View style={styles.bar}>
        {showBack ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={12}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color={tint} strokeWidth={2} />
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
    minHeight: 44,
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
  },
});
