import { useState, type ReactElement } from 'react';
import { ActivityIndicator, Platform, StyleSheet, View } from 'react-native';
import { User } from 'lucide-react-native';
import { Avatar } from '@/components/Avatar';
import { Button } from '@/components/Button';
import { Text } from '@/components/Text';
import { useAvatar } from '@/hooks/useAvatar';
import type { AvatarSource } from '@/lib/avatar';
import { colors, radius, sizes, spacing } from '@/theme';

const canUseCamera = Platform.OS !== 'web';

export function AvatarEditor(): ReactElement {
  const { avatarUrl, uploading, error, pickAndUpload, remove } = useAvatar();
  const [menuOpen, setMenuOpen] = useState(false);

  const choose = (source: AvatarSource): void => {
    setMenuOpen(false);
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
      <View style={styles.avatarWrap}>
        <Avatar
          uri={avatarUrl}
          size={sizes.avatarXl}
          fallback={
            <View style={styles.fallback}>
              <User size={sizes.iconXl} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />
            </View>
          }
        />
        {uploading ? (
          <View style={styles.overlay}>
            <ActivityIndicator color={colors.white} />
          </View>
        ) : null}
      </View>
      <View style={styles.actions}>
        <Button variant="text" label="Alterar foto" disabled={uploading} onPress={change} />
        {avatarUrl ? (
          <Button
            variant="text"
            label="Remover foto"
            disabled={uploading}
            onPress={(): void => {
              void remove();
            }}
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
      {error ? (
        <Text variant="caption" color={colors.danger} center>
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: spacing.sm,
  },
  avatarWrap: {
    width: sizes.avatarXl,
    height: sizes.avatarXl,
  },
  fallback: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
  menuButton: {
    paddingHorizontal: spacing.lg,
  },
  actions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
