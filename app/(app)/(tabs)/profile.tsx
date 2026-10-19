import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { useProfile } from '@/hooks/useProfile';
import { useSession } from '@/hooks/useSession';
import { AssetPlaceholder, Card, ListRow, Screen, Text } from '@/components';
import { colors, layout, radius, sizes, spacing } from '@/theme';

interface MenuItem {
  label: string;
  href: Href;
}

const menu: MenuItem[] = [
  { label: 'Minha conta', href: '/profile/account' },
  { label: 'Preferências', href: '/profile/preferences' },
  { label: 'Dispositivos conectados', href: '/profile/devices' },
  { label: 'Notificações', href: '/profile/notifications' },
  { label: 'Ajuda e suporte', href: '/profile/help' },
];

export default function ProfileScreen(): ReactElement {
  const router = useRouter();
  const { signOut } = useSession();
  const { name } = useProfile();

  return (
    <Screen scroll flush>
      <View style={styles.body}>
        <View style={styles.header}>
          <Text variant="title2" style={styles.grow}>
            Perfil
          </Text>
          <Pressable accessibilityRole="button" accessibilityLabel="Configurações" hitSlop={12}>
            <Settings size={22} color={colors.ink} strokeWidth={1.75} />
          </Pressable>
        </View>

        <Card flush>
          <ListRow
            title={name ?? 'Sua conta'}
            subtitle="Ver perfil"
            leading={
              <AssetPlaceholder iconSize={20} style={styles.avatar} />
            }
            showChevron
            onPress={(): void => {
              router.push('/profile/account');
            }}
          />
        </Card>

        <Card flush>
          {menu.map((item) => (
            <ListRow
              key={item.label}
              title={item.label}
              showChevron
              divider
              onPress={(): void => {
                router.push(item.href);
              }}
            />
          ))}
          <ListRow
            title="Sair"
            showChevron
            onPress={(): void => {
              void signOut().then(() => {
                router.replace('/(pre-auth)/welcome');
              });
            }}
          />
        </Card>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: layout.screenPadding,
    gap: layout.cardGap,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  grow: {
    flex: 1,
  },
  avatar: {
    flex: 0,
    width: sizes.avatar,
    height: sizes.avatar,
    borderRadius: radius.full,
  },
});
