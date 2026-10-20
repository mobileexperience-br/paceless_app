import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { useManageSubscription } from '@/hooks/useManageSubscription';
import { useProfile } from '@/hooks/useProfile';
import { useSession } from '@/hooks/useSession';
import { Avatar, AssetPlaceholder, Card, ListRow, Screen, ScreenTitle, Text } from '@/components';
import { colors, layout, radius, sizes } from '@/theme';

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
  const { name, avatarUrl } = useProfile();
  const { isPremium, error, manage } = useManageSubscription();

  return (
    <Screen scroll flush>
      <ScreenTitle
        title="Perfil"
        trailing={
          <Pressable accessibilityRole="button" accessibilityLabel="Configurações" hitSlop={sizes.hitSlop}>
            <Settings size={sizes.iconTab} color={colors.ink} strokeWidth={sizes.iconStroke} />
          </Pressable>
        }
      />
      <View style={styles.body}>
        <Card flush>
          <ListRow
            title={name ?? 'Sua conta'}
            subtitle="Ver perfil"
            leading={
              <Avatar
                uri={avatarUrl}
                size={sizes.avatar}
                fallback={<AssetPlaceholder iconSize={sizes.iconMd} style={styles.avatar} />}
              />
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
          {isPremium ? (
            <ListRow
              title="Gerenciar assinatura"
              showChevron
              divider
              onPress={(): void => {
                void manage();
              }}
            />
          ) : null}
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
        {error ? (
          <Text variant="caption" color={colors.danger}>
            {error}
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: layout.screenPadding,
    gap: layout.cardGap,
  },
  avatar: {
    flex: 0,
    width: sizes.avatar,
    height: sizes.avatar,
    borderRadius: radius.full,
  },
});
