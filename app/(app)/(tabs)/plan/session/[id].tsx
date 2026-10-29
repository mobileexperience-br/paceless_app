import { useCallback, useState, type ReactElement } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Button, CheckCircle, EmptyState, Screen, ScreenHeader, Text } from '@/components';
import { StepList } from '@/components/plan/StepList';
import { NoPlanState, PlanError, PlanLoading } from '@/components/plan/PlanStates';
import { useActivePlan } from '@/hooks/useActivePlan';
import { loadResumableSession } from '@/lib/activeSession';
import { formatLongDate } from '@/lib/planCalendar';
import { localToday } from '@/lib/planDates';
import {
  distanceTargetLabel,
  findSession,
  intensityLabel,
  sessionTargetLabel,
  stateOn,
  zoneLabel,
} from '@/lib/planProgress';
import { createStyles, layout, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';
import type { PlanSession } from '@/types/training';

export default function PlanSessionScreen(): ReactElement {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { plan, loading, error, reload } = useActivePlan();
  const [resumable, setResumable] = useState<boolean>(false);

  useFocusEffect(
    useCallback((): void => {
      void loadResumableSession().then((saved) => {
        setResumable(saved !== null);
      });
    }, []),
  );

  if (plan === null) {
    if (loading) return <Centered><PlanLoading /></Centered>;
    if (error) return <Centered><PlanError message={error} onRetry={() => { void reload(); }} /></Centered>;
    return <Centered><NoPlanState /></Centered>;
  }

  const session = id ? findSession(plan, id) : null;
  if (session === null) return <Centered><SessionNotFound /></Centered>;

  return <SessionContent session={session} resumable={resumable} />;
}

function Centered({ children }: { children: ReactElement }): ReactElement {
  return (
    <Screen flush>
      <ScreenHeader showBack title="Treino" />
      {children}
    </Screen>
  );
}

function SessionNotFound(): ReactElement {
  const router = useRouter();
  return (
    <EmptyState
      title="Treino não encontrado"
      action={
        <Button
          label="Voltar ao plano"
          onPress={() => {
            router.replace('/plan');
          }}
        />
      }
    />
  );
}

interface SessionContentProps {
  session: PlanSession;
  resumable: boolean;
}

function SessionContent({ session, resumable }: SessionContentProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const today = localToday();
  const { workout } = session;
  const state = stateOn(session, today);
  const isRun = workout.kind === 'run';
  const isDone = state === 'done';
  const meta = [
    formatLongDate(session.date),
    intensityLabel(workout.intensity),
    zoneLabel(workout.zone),
    sessionTargetLabel(workout),
  ].filter((part): part is string => part !== null);
  const completedOn = session.completedAt
    ? formatLongDate(localToday(new Date(session.completedAt)))
    : formatLongDate(session.date);

  const startPlanSession = (): void => {
    if (resumable) {
      router.push({ pathname: '/workout/[id]', params: { id: 'atual', resume: '1' } });
      return;
    }
    router.push({ pathname: '/workout/[id]', params: { id: 'plano', session: session.id } });
  };

  return (
    <Screen flush edges={['top', 'left', 'right']}>
      <ScreenHeader showBack title={workout.title} />
      <ScrollView style={styles.scroll} contentContainerStyle={styles.body} showsVerticalScrollIndicator={false}>
        <Text variant="caption" color={colors.textSecondary}>
          {meta.join(' • ')}
        </Text>
        {workout.description ? (
          <Text variant="body" color={colors.textSecondary}>
            {workout.description}
          </Text>
        ) : null}
        <Text variant="title3" style={styles.sectionTitle}>
          Passos
        </Text>
        <StepList steps={workout.steps} distanceLabel={distanceTargetLabel(workout)} />
      </ScrollView>

      <View style={[styles.footer, { paddingBottom: insets.bottom + spacing.lg }]}>
        {isDone ? (
          <View style={styles.doneRow}>
            <CheckCircle checked size={sizes.iconLg} decorative />
            <Text variant="captionStrong" color={colors.primaryDeep} style={styles.grow}>
              {`Concluído em ${completedOn}`}
            </Text>
          </View>
        ) : null}
        {isDone && isRun ? (
          <Button
            label="Fazer de novo"
            variant="secondary"
            onPress={() => {
              router.push('/workout/atual');
            }}
          />
        ) : null}
        {!isDone && isRun ? (
          <Button label={resumable ? 'Retomar treino' : 'Começar treino'} onPress={startPlanSession} />
        ) : null}
        {!isDone && !isRun ? (
          <Text variant="caption" color={colors.textSecondary} center>
            Musculação ainda não tem treino guiado. Registre como concluído pelo app em breve.
          </Text>
        ) : null}
      </View>
    </Screen>
  );
}

const makeStyles = createStyles(() =>
  StyleSheet.create({
    scroll: {
      flex: 1,
    },
    body: {
      paddingHorizontal: layout.screenPadding,
      paddingBottom: layout.screenBottom,
      gap: spacing.md,
    },
    sectionTitle: {
      marginTop: spacing.sm,
    },
    footer: {
      paddingHorizontal: layout.screenPadding,
      paddingTop: spacing.md,
      gap: spacing.sm,
    },
    doneRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
    },
    grow: {
      flexGrow: 1,
      flexShrink: 1,
    },
  }),
);
