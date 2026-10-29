import { useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Input, InlineError, Screen, ScreenHeader } from '@/components';
import { usePreferences } from '@/hooks/usePreferences';
import { layout, spacing } from '@/theme';
import { isValidMaxHeartRate, MAX_MAX_HR, MIN_MAX_HR } from '@/types/preferences';

const RANGE_ERROR = `Digite um valor entre ${MIN_MAX_HR} e ${MAX_MAX_HR}.`;
const HELPER =
  'Usada para calcular suas zonas de treino. Se não souber, deixe em branco e o Paceless mostra só os batimentos.';

export default function HeartRateScreen(): ReactElement {
  const router = useRouter();
  const { maxHeartRate, setMaxHeartRate } = usePreferences();
  const [text, setText] = useState<string>(maxHeartRate === null ? '' : String(maxHeartRate));
  const [invalid, setInvalid] = useState<boolean>(false);

  const save = async (): Promise<void> => {
    const trimmed = text.trim();
    if (trimmed === '') {
      await setMaxHeartRate(null);
      router.back();
      return;
    }
    const value = Number(trimmed);
    if (!isValidMaxHeartRate(value)) {
      setInvalid(true);
      return;
    }
    await setMaxHeartRate(value);
    router.back();
  };

  const remove = async (): Promise<void> => {
    await setMaxHeartRate(null);
    router.back();
  };

  return (
    <Screen scroll flush>
      <ScreenHeader showBack title="Frequência cardíaca máxima" />
      <View style={styles.body}>
        <Input
          label="FC máxima (bpm)"
          helper={HELPER}
          keyboardType="number-pad"
          maxLength={3}
          value={text}
          error={invalid}
          onChangeText={(value) => {
            setText(value.replace(/\D/g, ''));
            setInvalid(false);
          }}
        />
        <InlineError message={invalid ? RANGE_ERROR : null} />
        <Button label="Salvar" onPress={() => { void save(); }} />
        {maxHeartRate !== null ? (
          <Button label="Remover" variant="text" onPress={() => { void remove(); }} />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: layout.screenPadding,
    gap: spacing.md,
  },
});
