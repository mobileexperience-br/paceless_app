import { useMemo, useRef, type ComponentRef, type ReactElement, type ReactNode } from 'react';
import {
  AccessibilityInfo,
  Modal,
  Platform,
  Pressable,
  StyleSheet,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModalSafeArea } from '../ModalSafeArea';
import { Button } from '../Button';
import { IconBadge } from '../IconBadge';
import { Text } from '../Text';
import { createStyles, palettes, radius, shadows, spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import { ThemeScope } from '@/providers/ThemeProvider';

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
  tone,
  actions,
  onDismiss,
}: DialogProps): ReactElement {
  const { scheme } = useTheme();
  const effectiveScheme = tone ?? scheme;
  const colors = palettes[effectiveScheme];
  const styles = useMemo(() => makeStyles(colors), [colors]);
  const insets = useSafeAreaInsets();
  const titleRef = useRef<ComponentRef<typeof View>>(null);
  const isDark = effectiveScheme === 'dark';

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
      navigationBarTranslucent
      onRequestClose={onDismiss}
      onShow={focusTitle}
    >
      <ModalSafeArea>
      <ThemeScope scheme={effectiveScheme}>
        <View
          accessibilityViewIsModal
          style={[
            styles.overlay,
            {
              paddingTop: insets.top + spacing.xxl,
              paddingBottom: insets.bottom + spacing.xxl,
              paddingLeft: insets.left + spacing.xxl,
              paddingRight: insets.right + spacing.xxl,
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
              <IconBadge tone={tone === 'dark' ? 'primary' : 'soft'} style={styles.badge}>
                {icon}
              </IconBadge>
            ) : null}
            <View ref={titleRef} accessible accessibilityRole="header">
              <Text variant="title3" center color={colors.ink}>
                {title}
              </Text>
            </View>
            {message ? (
              <Text
                variant="body"
                center
                color={colors.textSecondary}
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
      </ThemeScope>
      </ModalSafeArea>
    </Modal>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    overlay: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
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
      backgroundColor: colors.background,
      borderWidth: 1,
      borderColor: colors.border,
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
  }),
);
