import { type ReactElement } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { Redirect, useRouter } from 'expo-router';
import { Button, InlineError, ProgressBar, Screen, ScreenHeader, Text } from '@/components';
import { SelectableCard } from '@/components/paywall/SelectableCard';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useProfile } from '@/hooks/useProfile';
import { HEALTH_DISCLAIMER } from '@/lib/healthDisclaimer';
import { onboardingSteps, optionsForStep } from '@/lib/onboardingSteps';
import { createStyles, layout, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

export default function OnboardingScreen(): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { profile, loading: profileLoading } = useProfile();
  const {
    loading,
    stepIndex,
    stepCount,
    answers,
    selected,
    isFirst,
    isLast,
    saving,
    error,
    answer,
    next,
    back,
  } = useOnboarding();

  if (!profileLoading && profile?.onboarding_completed_at) {
    return <Redirect href="/(app)" />;
  }
  if (loading) return <Screen flush>{null}</Screen>;

  const current = onboardingSteps[stepIndex] ?? onboardingSteps[0];

  const onContinue = async (): Promise<void> => {
    const saved = await next();
    if (saved && isLast) router.replace('/onboarding/plan-ready');
  };

  return (
    <Screen flush>
      <ScreenHeader showBack={!isFirst} onBack={back} centerLabel={`${stepIndex + 1} / ${stepCount}`} />
      <ProgressBar progress={(stepIndex + 1) / stepCount} style={styles.progress} />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.body}
        showsVerticalScrollIndicator={false}
      >
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
              onPress={() => {
                answer(option.id);
              }}
            >
              <Text variant="bodyStrong">{option.label}</Text>
              {option.description ? (
                <Text variant="caption" color={colors.textSecondary}>
                  {option.description}
                </Text>
              ) : null}
            </SelectableCard>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <InlineError message={error} />
        {isLast ? (
          <Text variant="caption" color={colors.textSecondary} center>
            {HEALTH_DISCLAIMER}
          </Text>
        ) : null}
        <Button
          label={saving ? 'Salvando...' : 'Continuar'}
          disabled={!selected || saving}
          onPress={() => {
            void onContinue();
          }}
        />
      </View>
    </Screen>
  );
}

const makeStyles = createStyles(() =>
  StyleSheet.create({
    progress: {
      marginHorizontal: layout.screenPadding,
    },
    scroll: {
      flex: 1,
    },
    body: {
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
