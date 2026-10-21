import { type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Button, ProgressBar, Screen, ScreenHeader, Text } from '@/components';
import { SelectableCard } from '@/components/paywall/SelectableCard';
import { useOnboarding } from '@/hooks/useOnboarding';
import { HEALTH_DISCLAIMER } from '@/lib/healthDisclaimer';
import { onboardingSteps, optionsForStep } from '@/lib/onboardingSteps';
import { createStyles, layout, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

export default function OnboardingScreen(): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { loading, step, stepCount, stepKey, answers, isFirst, isLast, answer, next, back } =
    useOnboarding();

  if (loading) return <Screen flush>{null}</Screen>;

  const current = onboardingSteps[step] ?? onboardingSteps[0];
  const selected = answers[stepKey];

  const goNext = (): void => {
    next();
    if (isLast) router.push('/paywall');
  };

  const goBack = (): void => {
    if (isFirst) router.back();
    else back();
  };

  return (
    <Screen flush>
      <ScreenHeader showBack onBack={goBack} centerLabel={`${step + 1} / ${stepCount}`} />
      <ProgressBar progress={(step + 1) / stepCount} style={styles.progress} />

      <View style={styles.body}>
        <View style={styles.intro}>
          <Text variant="title1">{current?.title}</Text>
          <Text variant="body" color={colors.textSecondary}>
            {current?.subtitle}
          </Text>
        </View>

        <View accessibilityRole="radiogroup" style={styles.options}>
          {(current ? optionsForStep(current, answers) : []).map((option) => (
            <SelectableCard
              key={option.id}
              active={selected === option.id}
              onPress={() => { answer(option.id); }}
            >
              <Text variant="bodyStrong">{option.label}</Text>
            </SelectableCard>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        {isLast ? (
          <Text variant="caption" color={colors.textSecondary} center>
            {HEALTH_DISCLAIMER}
          </Text>
        ) : null}
        <Button label="Continuar" disabled={!selected} onPress={goNext} />
      </View>
    </Screen>
  );
}

const makeStyles = createStyles(() =>
  StyleSheet.create({
    progress: {
      marginHorizontal: layout.screenPadding,
    },
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
    footer: {
      paddingHorizontal: layout.screenPadding,
      paddingBottom: spacing.xxl,
      gap: spacing.md,
    },
  }),
);
