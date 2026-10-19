import { useRef, type ComponentRef, type ReactElement, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button } from '../Button';
import { IconBadge } from '../IconBadge';
import { Text } from '../Text';
import { colors, radius, shadows, spacing } from '@/theme';

export type DialogTone = 'light' | 'dark';
export type DialogActionVariant = 'primary' | 'secondary' | 'danger' | 'text';

export interface DialogAction {
  label: string;
  variant: DialogActionVariant;
  onPress: () => void;
}

interface DialogProps {
  visible: boolean;
  title: string;
  message?: string | undefined;
  icon?: ReactNode;
  tone?: DialogTone | undefined;
  actions: DialogAction[];
  onDismiss: () => void;
}

const maxWidth = 360;

export function Dialog({
  visible,
  title,
  message,
  icon,
  tone = 'light',
  actions,
  onDismiss,
}: DialogProps): ReactElement {
  const insets = useSafeAreaInsets();
  const titleRef = useRef<ComponentRef<typeof View>>(null);
  const isDark = tone === 'dark';

  const focusTitle = (): void => {
    if (titleRef.current && Platform.select({ web: false, default: true })) {
      AccessibilityInfo.sendAccessibilityEvent(titleRef.current, 'focus');
    }
  };

  return (
    <Modal
      transparent
      visible={visible}
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onDismiss}
      onShow={focusTitle}
    >
      <View
        accessibilityViewIsModal
        style={[
          styles.overlay,
          {
            paddingTop: insets.top + spacing.xxl,
            paddingBottom: insets.bottom + spacing.xxl,
          },
        ]}
      >
        <Pressable
          accessible={false}
          focusable={false}
          style={styles.scrim}
          onPress={onDismiss}
        />
        <View style={[styles.card, isDark ? styles.cardDark : styles.cardLight]}>
          {icon ? (
            <IconBadge tone={isDark ? 'primary' : 'soft'} style={styles.badge}>
              {icon}
            </IconBadge>
          ) : null}
          <View ref={titleRef} accessible accessibilityRole="header">
            <Text variant="title3" center color={isDark ? colors.dark.text : colors.ink}>
              {title}
            </Text>
          </View>
          {message ? (
            <Text
              variant="body"
              center
              color={isDark ? colors.dark.textSecondary : colors.textSecondary}
              style={styles.message}
            >
              {message}
            </Text>
          ) : null}
          <View style={styles.actions}>
            {actions.map((action) => (
              <Button
                key={action.label}
                label={action.label}
                variant={action.variant}
                onPress={action.onPress}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xxl,
  },
  scrim: {
    ...StyleSheet.absoluteFill,
    backgroundColor: colors.scrim,
  },
  card: {
    width: '100%',
    maxWidth,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    alignItems: 'stretch',
    ...shadows.fab,
  },
  cardLight: {
    backgroundColor: colors.surface,
  },
  cardDark: {
    backgroundColor: colors.dark.background,
    borderWidth: 1,
    borderColor: colors.dark.border,
  },
  badge: {
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  message: {
    marginTop: spacing.sm,
  },
  actions: {
    marginTop: spacing.xxl,
    gap: spacing.md,
  },
});
