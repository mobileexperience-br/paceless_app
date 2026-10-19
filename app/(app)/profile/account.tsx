import { useState, type ReactElement } from 'react';
import { Alert, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Trash2, UserRound } from 'lucide-react-native';
import { Button, Card, EmptyState, ListRow, Screen, ScreenHeader, Text } from '@/components';
import { useDeleteAccount } from '@/hooks/useDeleteAccount';
import { useProfile } from '@/hooks/useProfile';
import { colors, layout, sizes } from '@/theme';

export default function AccountScreen(): ReactElement {
  const router = useRouter();
  const { name, email } = useProfile();
  const { deleting, deleteAccount } = useDeleteAccount();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const empty = name === null && email === null;

  const runDeletion = (): void => {
    setErrorMessage(null);
    void deleteAccount().then(({ error }) => {
      if (error) {
        setErrorMessage(error);
        return;
      }
      router.replace('/welcome');
    });
  };

  const confirmDeletion = (): void => {
    Alert.alert(
      'Excluir conta',
      'Esta ação é permanente. Sua conta e todos os seus dados serão apagados e não poderão ser recuperados.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Excluir', style: 'destructive', onPress: runDeletion },
      ],
    );
  };

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
        {errorMessage ? (
          <Text variant="caption" color={colors.danger} center>
            {errorMessage}
          </Text>
        ) : null}
        <Button
          variant="danger"
          label={deleting ? 'Excluindo...' : 'Excluir conta'}
          disabled={deleting}
          icon={<Trash2 size={sizes.iconMd} color={colors.danger} strokeWidth={sizes.iconStroke} />}
          onPress={confirmDeletion}
        />
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
