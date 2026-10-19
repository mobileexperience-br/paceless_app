import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Settings } from 'lucide-react-native';
import { useSession } from '@/hooks/useSession';
import { AssetPlaceholder, Card, ListRow, Screen, Text } from '@/components';
import { colors, layout, radius, spacing } from '@/theme';

const menu = [
  'Minha conta',
  'Preferências',
  'Dispositivos conectados',
  'Notificações',
  'Ajuda e suporte',
  'Sair',
];

export default function ProfileScreen(): ReactElement {
  const router = useRouter();
  const { signOut } = useSession();

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
            title="Alex"
            subtitle="Ver perfil"
            leading={
              <AssetPlaceholder iconSize={20} style={styles.avatar} />
            }
            showChevron
          />
        </Card>

        <Card flush>
          {menu.map((item, index) => (
            <ListRow
              key={item}
              title={item}
              showChevron
              divider={index < menu.length - 1}
              {...(item === 'Sair' && {
                onPress: (): void => {
                  void signOut().then(() => {
                    router.replace('/(pre-auth)/welcome');
                  });
                },
              })}
            />
          ))}
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
    width: 56,
    height: 56,
    borderRadius: radius.full,
  },
});
