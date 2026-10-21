import { useEffect, useRef, useState, type ReactElement } from 'react';
import { ActivityIndicator, Platform, Pressable, StyleSheet, View } from 'react-native';
import { Trash2 } from 'lucide-react-native';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useDialog } from '@/hooks/useDialog';
import { useAvatar } from '@/hooks/useAvatar';
import type { AvatarSource } from '@/lib/avatar';
import { createStyles, radius, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

const canUseCamera = Platform.OS !== 'web';
const minTouchTarget = 44;

export function AvatarEditor(): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { avatarUrl, uploading, error, pickAndUpload, remove } = useAvatar();
  const { confirm } = useDialog();
  const [menuOpen, setMenuOpen] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const previous = useRef({ uploading: false, avatarUrl });

  useEffect(() => {
    const before = previous.current;
    previous.current = { uploading, avatarUrl };
    if (before.uploading && !uploading && !error && before.avatarUrl !== avatarUrl) {
      setNotice(avatarUrl ? 'Foto atualizada' : 'Foto removida');
    }
  }, [uploading, avatarUrl, error]);

  const confirmRemoval = (): void => {
    void confirm({
      title: 'Remover foto?',
      message: 'Sua foto de perfil será apagada.',
      confirmLabel: 'Remover',
      cancelLabel: 'Cancelar',
      destructive: true,
      icon: <Trash2 size={sizes.iconMd} color={colors.danger} strokeWidth={sizes.iconStroke} />,
    }).then((confirmed) => {
      if (confirmed) void remove();
    });
  };

  const choose = (source: AvatarSource): void => {
    setMenuOpen(false);
    setNotice(null);
    void pickAndUpload(source);
  };

  const change = (): void => {
    if (canUseCamera) {
      setMenuOpen((open) => !open);
      return;
    }
    choose('library');
  };

  return (
    <View style={styles.container}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Alterar foto"
        disabled={uploading}
        onPress={change}
        style={styles.avatarWrap}
      >
        <Avatar uri={avatarUrl} size={sizes.avatarXl} />
        {uploading ? (
          <View style={styles.overlay}>
            <ActivityIndicator color={colors.white} accessibilityLabel="Enviando foto" />
          </View>
        ) : null}
      </Pressable>
      <View style={styles.actions}>
        <Button variant="text" label="Alterar foto" disabled={uploading} onPress={change} style={styles.touch} />
        {avatarUrl ? (
          <Button
            variant="text"
            label="Remover foto"
            disabled={uploading}
            onPress={confirmRemoval}
            style={styles.touch}
          />
        ) : null}
      </View>
      {menuOpen ? (
        <View style={styles.actions}>
          <Button
            variant="secondary"
            label="Escolher da galeria"
            style={styles.menuButton}
            onPress={(): void => {
              choose('library');
            }}
          />
          <Button
            variant="secondary"
            label="Tirar foto"
            style={styles.menuButton}
            onPress={(): void => {
              choose('camera');
            }}
          />
        </View>
      ) : null}
      {notice ? (
        <Text variant="caption" color={colors.textSecondary} center accessibilityLiveRegion="polite">
          {notice}
        </Text>
      ) : null}
      {error ? (
        <Text variant="caption" color={colors.danger} center>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    container: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    avatarWrap: {
      width: sizes.avatarXl,
      height: sizes.avatarXl,
    },
    overlay: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      borderRadius: radius.full,
      backgroundColor: colors.scrim,
      alignItems: 'center',
      justifyContent: 'center',
    },
    touch: {
      minHeight: minTouchTarget,
    },
    menuButton: {
      paddingHorizontal: spacing.lg,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'center',
      gap: spacing.sm,
    },
  }),
);
