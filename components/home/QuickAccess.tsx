import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Apple, ClipboardList, Dumbbell } from 'lucide-react-native';
import { Text } from '@/components/Text';
import { createStyles, layout, radius, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

const quickAccess = [
  { label: 'Musculação', href: '/strength', Icon: Dumbbell },
  { label: 'Nutrição', href: '/nutrition', Icon: Apple },
  { label: 'Plano', href: '/plan', Icon: ClipboardList },
] as const;

export function QuickAccess(): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();

  return (
    <View style={styles.quickAccess}>
      <Text variant="captionStrong">Acesso rápido</Text>
      <View style={styles.tiles}>
        {quickAccess.map(({ label, href, Icon }) => (
          <Pressable
            key={label}
            accessibilityRole="button"
            accessibilityLabel={label}
            onPress={() => { router.push(href); }}
            style={({ pressed }) => [styles.tile, pressed && styles.pressed]}
          >
            <Icon size={sizes.iconLg} color={colors.ink} strokeWidth={sizes.iconStroke} />
            <Text variant="caption" center>{label}</Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    quickAccess: {
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    tiles: {
      flexDirection: 'row',
      gap: layout.cardGap,
    },
    tile: {
      flex: 1,
      minHeight: sizes.avatarXl,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderRadius: radius.md,
      borderWidth: sizes.hairline,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
    pressed: {
      backgroundColor: colors.track,
    },
  }),
);
