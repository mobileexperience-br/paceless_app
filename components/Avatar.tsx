import { useState, type ReactElement } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { User } from 'lucide-react-native';
import { createStyles, radius, sizes } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

const iconRatio = 0.5;

interface AvatarProps {
  uri?: string | null;
  size: number;
}

export function Avatar({ uri = null, size }: AvatarProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [failedUri, setFailedUri] = useState<string | null>(null);
  const showImage = uri !== null && uri !== failedUri;

  return (
    <View style={[styles.frame, { width: size, height: size }]}>
      {showImage ? (
        <Image
          source={{ uri }}
          accessibilityIgnoresInvertColors
          onError={(): void => {
            setFailedUri(uri);
          }}
          style={styles.image}
        />
      ) : (
        <User size={Math.round(size * iconRatio)} color={colors.onPrimary} strokeWidth={sizes.iconStroke} />
      )}
    </View>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    frame: {
      borderRadius: radius.full,
      overflow: 'hidden',
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    image: {
      width: '100%',
      height: '100%',
    },
  }),
);
