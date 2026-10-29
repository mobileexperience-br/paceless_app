import { useState, type ReactElement } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { usePreventRemove, useRouter } from 'expo-router';
import { Button, InlineError, Screen, ScreenHeader, Text } from '@/components';
import { CheckCircle } from '@/components/CheckCircle';
import { OptionSection } from '@/components/plan/OptionSection';
import { useDialog } from '@/hooks/useDialog';
import { usePlanSettings } from '@/hooks/usePlanSettings';
import { useTheme } from '@/hooks/useTheme';
import { onboardingLabels } from '@/lib/onboardingSteps';
import { trainingDayCombos } from '@/lib/trainingDayCombos';
import { onboardingOptions } from '@/types/onboarding';
import { layout, sizes, spacing } from '@/theme';

const goalOptions = onboardingOptions.goal.map((id) => ({ id, label: onboardingLabels.goal[id] }));
const levelOptions = onboardingOptions.level.map((id) => ({ id, label: onboardingLabels.level[id] }));
const daysOptions = onboardingOptions.daysPerWeek.map((id) => ({
  id,
  label: onboardingLabels.daysPerWeek[id],
}));
const strengthOptions = onboardingOptions.strength.map((id) => ({
  id,
  label: onboardingLabels.strength[id],
}));

export default function PlanSettingsScreen(): ReactElement {
  const { colors } = useTheme();
  const router = useRouter();
  const { confirm, alert } = useDialog();
  const {
    loading,
    draft,
    dirty,
    complete,
    saving,
    regenerating,
    needsRegeneration,
    missingPlan,
    error,
    setGoal,
    setLevel,
    setDaysPerWeek,
    setTrainingDays,
    setStrength,
    save,
  } = usePlanSettings();
  const [discarding, setDiscarding] = useState(false);

  usePreventRemove(dirty && !saving && !discarding, ({ repeat }) => {
    void confirm({
      title: 'Descartar alterações?',
      message: 'Você tem alterações não salvas nas configurações do plano.',
      confirmLabel: 'Descartar',
      cancelLabel: 'Continuar editando',
      destructive: true,
    }).then((discard) => {
      if (!discard) return;
      setDiscarding(true);
      repeat();
    });
  });

  const trainingDayOptions = trainingDayCombos
    .filter((combo) => combo.group === draft.daysPerWeek)
    .map(({ id, label }) => ({ id, label }));
  const needsDays = dirty && draft.daysPerWeek !== null && draft.trainingDays === null;

  const onSave = async (): Promise<void> => {
    const outcome = await save();
    if (outcome !== 'saved') return;
    await alert({
      title: 'Configurações salvas',
      message: missingPlan ? 'Seu plano foi gerado.' : 'Seu plano foi atualizado.',
      icon: <CheckCircle checked decorative size={sizes.badgeLg} />,
    });
    router.back();
  };

  return (
    <Screen scroll flush>
      <ScreenHeader showBack title="Configurações do plano" />
      <View style={styles.body}>
        {loading ? (
          <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando configurações" />
        ) : (
          <>
            <OptionSection
              title="Objetivo"
              subtitle="Isso define o plano que vamos montar."
              options={goalOptions}
              selected={draft.goal}
              disabled={saving}
              onSelect={setGoal}
            />
            <OptionSection
              title="Preparo atual"
              options={levelOptions}
              selected={draft.level}
              disabled={saving}
              onSelect={setLevel}
            />
            <OptionSection
              title="Dias por semana"
              options={daysOptions}
              selected={draft.daysPerWeek}
              disabled={saving}
              onSelect={setDaysPerWeek}
            />
            <OptionSection
              title="Dias de treino"
              subtitle={
                draft.daysPerWeek
                  ? 'Escolha a combinação que cabe na sua semana.'
                  : 'Escolha primeiro quantos dias por semana.'
              }
              options={trainingDayOptions}
              selected={draft.trainingDays}
              disabled={saving}
              onSelect={setTrainingDays}
            />
            <OptionSection
              title="Musculação"
              subtitle="Treino de força reduz lesão e melhora o ritmo."
              options={strengthOptions}
              selected={draft.strength}
              disabled={saving}
              onSelect={setStrength}
            />
            <View style={styles.footer}>
              <InlineError message={error} />
              {needsDays ? (
                <Text variant="caption" color={colors.textSecondary}>
                  Escolha os dias de treino para salvar.
                </Text>
              ) : null}
              <Button
                label={
                  saving
                    ? regenerating
                      ? 'Atualizando plano...'
                      : 'Salvando...'
                    : !dirty && needsRegeneration
                      ? 'Tentar novamente'
                      : !dirty && missingPlan
                        ? 'Gerar plano'
                        : 'Salvar alterações'
                }
                disabled={(!dirty && !needsRegeneration && !missingPlan) || !complete || saving}
                onPress={() => {
                  void onSave();
                }}
              />
            </View>
          </>
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: layout.screenPadding,
    gap: layout.sectionGap,
    paddingBottom: layout.screenBottom,
  },
  footer: {
    gap: spacing.md,
  },
});
