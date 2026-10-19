import { useState, type ReactElement, type ReactNode } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { colors, radius } from '@/theme';

interface AvatarProps {
  uri: string | null;
  size: number;
  fallback: ReactNode;
}

export function Avatar({ uri, size, fallback }: AvatarProps): ReactElement {
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
        fallback
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  frame: {
    borderRadius: radius.full,
    overflow: 'hidden',
    backgroundColor: colors.track,
  },
  image: {
    width: '100%',
    height: '100%',
  },
});
