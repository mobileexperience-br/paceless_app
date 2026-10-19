import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { UserRound } from 'lucide-react-native';
import { Card, EmptyState, ListRow, Screen, ScreenHeader } from '@/components';
import { useProfile } from '@/hooks/useProfile';
import { colors, layout, sizes } from '@/theme';

export default function AccountScreen(): ReactElement {
  const { name, email } = useProfile();
  const empty = name === null && email === null;

  return (
    <Screen scroll flush>
      <ScreenHeader showBack title="Minha conta" />
      <View style={styles.body}>
        {empty ? (
          <EmptyState
            icon={<UserRound size={sizes.iconXl} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />}
            title="Dados indisponíveis"
            description="Não encontramos informações da sua conta."
          />
        ) : (
          <Card flush>
            <ListRow title="Nome" subtitle={name ?? 'Não informado'} divider />
            <ListRow title="E-mail" subtitle={email ?? 'Não informado'} />
          </Card>
        )}
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
