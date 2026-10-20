import { useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Pencil } from 'lucide-react-native';
import { Button } from '@/components/Button';
import { Input } from '@/components/Input';
import { ListRow } from '@/components/ListRow';
import { Text } from '@/components/Text';
import { useUpdateName } from '@/hooks/useUpdateName';
import { createStyles, layout, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

interface NameFieldProps {
  name: string | null;
}

export function NameField({ name }: NameFieldProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const { saving, error, save, clearError } = useUpdateName();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState('');

  const start = (): void => {
    clearError();
    setDraft(name ?? '');
    setEditing(true);
  };

  const cancel = (): void => {
    clearError();
    setEditing(false);
  };

  const submit = (): void => {
    void save(draft).then((saved) => {
      if (saved) setEditing(false);
    });
  };

  if (!editing) {
    return (
      <ListRow
        title="Nome"
        subtitle={name ?? 'Não informado'}
        divider
        onPress={start}
        trailing={<Pencil size={sizes.iconSm} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="bodyStrong">Nome</Text>
      <Input
        value={draft}
        onChangeText={setDraft}
        editable={!saving}
        autoFocus
        autoCapitalize="words"
        autoComplete="name"
        maxLength={60}
        placeholder="Seu nome"
        returnKeyType="done"
        onSubmitEditing={submit}
      />
      {error ? (
        <Text variant="caption" color={colors.danger}>
          {error}
        </Text>
      ) : null}
      <View style={styles.actions}>
        <Button variant="text" label="Cancelar" disabled={saving} onPress={cancel} />
        <Button
          variant="primary"
          label={saving ? 'Salvando...' : 'Salvar'}
          disabled={saving}
          onPress={submit}
          style={styles.save}
        />
      </View>
    </View>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    container: {
      padding: layout.cardPadding,
      gap: spacing.sm,
      borderBottomWidth: sizes.hairline,
      borderBottomColor: colors.border,
    },
    actions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      alignItems: 'center',
      gap: spacing.md,
    },
    save: {
      paddingHorizontal: spacing.xxl,
    },
  }),
);
