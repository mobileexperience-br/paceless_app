import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, Card, Screen, ScreenHeader, Text } from '@/components';
import { colors, layout, radius, spacing } from '@/theme';

/**
 * Sem referência visual no mockup — layout construído a partir dos tokens do
 * design system, conforme combinado. Cada passo é uma pergunta com opções.
 */
const steps = [
  {
    title: 'Qual é o seu objetivo?',
    subtitle: 'Isso define o plano que vamos montar.',
    options: ['Começar a correr', 'Correr 5 km', 'Correr 10 km', 'Ganhar condicionamento'],
  },
  {
    title: 'Como está seu preparo hoje?',
    subtitle: 'Seja honesto — dá para evoluir de qualquer ponto.',
    options: ['Nunca corri', 'Corro de vez em quando', 'Corro toda semana'],
  },
  {
    title: 'Quantos dias por semana?',
    subtitle: 'Você pode ajustar isso depois.',
    options: ['2 dias', '3 dias', '4 dias', '5 dias ou mais'],
  },
  {
    title: 'Quer incluir musculação?',
    subtitle: 'Treino de força reduz lesão e melhora o ritmo.',
    options: ['Sim, quero', 'Talvez depois', 'Não, só corrida'],
  },
] as const;

export default function OnboardingScreen() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});

  const current = steps[step];
  const selected = answers[step];

  const goNext = () => {
    if (step < steps.length - 1) {
      setStep(step + 1);
    } else {
      router.push('/paywall');
    }
  };

  return (
    <Screen flush>
      <ScreenHeader showBack centerLabel={`${step + 1} / ${steps.length}`} />

      <View style={styles.body}>
        <View style={styles.intro}>
          <Text variant="title1">{current.title}</Text>
          <Text variant="body" color={colors.textSecondary}>
            {current.subtitle}
          </Text>
        </View>

        <View style={styles.options}>
          {current.options.map((option) => {
            const active = selected === option;
            return (
              <Pressable
                key={option}
                accessibilityRole="radio"
                accessibilityState={{ selected: active }}
                onPress={() => setAnswers({ ...answers, [step]: option })}
              >
                <Card style={active ? styles.optionActive : undefined}>
                  <Text variant="bodyStrong">{option}</Text>
                </Card>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          label={step < steps.length - 1 ? 'Continuar' : 'Ver meu plano'}
          disabled={!selected}
          onPress={goNext}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.xxl,
    gap: spacing.xxl,
  },
  intro: {
    gap: spacing.sm,
  },
  options: {
    gap: layout.cardGap,
  },
  optionActive: {
    borderColor: colors.primary,
    borderWidth: 2,
    borderRadius: radius.lg,
  },
  footer: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: spacing.xxl,
  },
});
