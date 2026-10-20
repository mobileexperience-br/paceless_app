import { useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Trash2, UserRound } from 'lucide-react-native';
import { Button, Card, EmptyState, ListRow, Screen, ScreenHeader, Text } from '@/components';
import { AvatarEditor } from '@/components/profile/AvatarEditor';
import { NameField } from '@/components/profile/NameField';
import { useDeleteAccount } from '@/hooks/useDeleteAccount';
import { useDialog } from '@/hooks/useDialog';
import { useProfile } from '@/hooks/useProfile';
import { colors, layout, sizes } from '@/theme';

export default function AccountScreen(): ReactElement {
  const router = useRouter();
  const { confirm } = useDialog();
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
    void confirm({
      title: 'Excluir conta',
      message:
        'Esta ação é permanente. Sua conta e todos os seus dados serão apagados e não poderão ser recuperados. Uma assinatura ativa não é cancelada ao excluir a conta: cancele-a nos ajustes de assinaturas da App Store ou do Google Play.',
      confirmLabel: 'Excluir',
      cancelLabel: 'Cancelar',
      destructive: true,
      icon: <Trash2 size={sizes.iconMd} color={colors.danger} strokeWidth={sizes.iconStroke} />,
    }).then((confirmed) => {
      if (confirmed) runDeletion();
    });
  };

  return (
    <Screen scroll flush edges={['top', 'bottom']}>
      <ScreenHeader showBack title="Minha conta" />
      <View style={styles.body}>
        {empty ? (
          <EmptyState
            icon={<UserRound size={sizes.iconXl} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />}
            title="Dados indisponíveis"
            description="Não encontramos informações da sua conta."
          />
        ) : (
          <>
          <AvatarEditor />
          <Card flush>
            <NameField name={name} />
            <ListRow title="E-mail" subtitle={email ?? 'Não informado'} />
          </Card>
          </>
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
