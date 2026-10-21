import type { ReactElement } from 'react';
import { ActivityIndicator, Image, Modal, StyleSheet, View } from 'react-native';
import logoMark from '@/assets/logo-mark.png';
import { Text } from './Text';
import { createStyles, palettes, sizes, spacing } from '@/theme';
import { useThemedStyles } from '@/hooks/useTheme';

interface SignInOverlayProps {
  visible: boolean;
}

export function SignInOverlay({ visible }: SignInOverlayProps): ReactElement {
  const styles = useThemedStyles(makeStyles);
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={() => undefined}
    >
      <View style={styles.root} accessibilityViewIsModal accessibilityLiveRegion="polite">
        <Image source={logoMark} style={styles.logo} resizeMode="contain" />
        <View style={styles.status}>
          <ActivityIndicator color={palettes.dark.primary} size="small" />
          <Text variant="bodyStrong" color={palettes.dark.ink}>
            Entrando na sua conta...
          </Text>
        </View>
      </View>
    </Modal>
  );
}

const makeStyles = createStyles(() =>
  StyleSheet.create({
    root: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.xxl,
      backgroundColor: palettes.dark.background,
    },
    logo: {
      width: sizes.logoMarkWidth,
      height: sizes.logoMarkHeight,
    },
    status: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
  }),
);
