import { useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter, type Href } from 'expo-router';
import { LogOut } from 'lucide-react-native';
import { useManageSubscription } from '@/hooks/useManageSubscription';
import { useProfile } from '@/hooks/useProfile';
import { useDialog } from '@/hooks/useDialog';
import { useSession } from '@/hooks/useSession';
import { Avatar, Card, ListRow, Screen, ScreenTitle, Text } from '@/components';
import { layout, sizes } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

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
  const { colors } = useTheme();
  const router = useRouter();
  const { signOut } = useSession();
  const { confirm } = useDialog();
  const { name, avatarUrl } = useProfile();
  const { isPremium, error, manage } = useManageSubscription();
  const [signOutError, setSignOutError] = useState<string | null>(null);
  const [signingOut, setSigningOut] = useState(false);
  const [managing, setManaging] = useState(false);

  const runSignOut = (): void => {
    setSignOutError(null);
    setSigningOut(true);
    void signOut().then((result) => {
      setSigningOut(false);
      if (result.error) {
        setSignOutError(result.error);
        return;
      }
      router.replace('/(pre-auth)/welcome');
    });
  };

  const confirmSignOut = (): void => {
    void confirm({
      title: 'Sair da conta?',
      message: 'Você precisará entrar novamente para acessar seus dados.',
      confirmLabel: 'Sair',
      cancelLabel: 'Cancelar',
      icon: <LogOut size={sizes.iconMd} color={colors.danger} strokeWidth={sizes.iconStroke} />,
    }).then((confirmed) => {
      if (confirmed) runSignOut();
    });
  };

  const openSubscription = (): void => {
    setManaging(true);
    void manage().finally(() => {
      setManaging(false);
    });
  };

  return (
    <Screen scroll flush>
      <ScreenTitle title="Perfil" />
      <View style={styles.body}>
        <Card flush>
          <ListRow
            title={name ?? 'Sua conta'}
            subtitle="Minha conta"
            leading={
              <Avatar uri={avatarUrl} size={sizes.avatar} />
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
              external
              loading={managing}
              divider
              onPress={openSubscription}
            />
          ) : null}
          <ListRow
            title={signingOut ? 'Saindo...' : 'Sair'}
            tone="danger"
            loading={signingOut}
            onPress={confirmSignOut}
          />
        </Card>
        {error ?? signOutError ? (
          <Text variant="caption" color={colors.danger}>
            {error ?? signOutError}
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
});
