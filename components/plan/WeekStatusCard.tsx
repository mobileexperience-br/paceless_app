import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Button, Card, InlineError, Text } from '@/components';
import { createStyles, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';
import type { PlanWeekStatus } from '@/types/planWeek';

interface WeekStatusCardProps {
  status: PlanWeekStatus;
  busy: boolean;
  error: string | null;
  onAdvance: () => void;
  onRepeat: () => void;
  onUnlock: () => void;
}

function titleOf(status: PlanWeekStatus): string {
  const week = `Semana ${String(status.currentWeek)}`;
  return status.currentAttempt > 1 ? `${week} • tentativa ${String(status.currentAttempt)}` : week;
}

function summaryOf(status: PlanWeekStatus): string {
  const base = `${String(status.completed)} de ${String(status.eligible)} treinos concluídos`;
  if (status.adherence === null) return base;
  return `${base} • aderência ${String(Math.round(status.adherence * 100))}%`;
}

export function WeekStatusCard({
  status,
  busy,
  error,
  onAdvance,
  onRepeat,
  onUnlock,
}: WeekStatusCardProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const nextWeek = status.currentWeek + 1;

  return (
    <Card>
      <View style={styles.content}>
        <Text variant="captionStrong">
          {titleOf(status)}
        </Text>
        <Text variant="body">{summaryOf(status)}</Text>

        {!status.closed ? (
          <Text variant="caption" color={colors.textSecondary}>
            A próxima semana libera quando esta terminar.
          </Text>
        ) : null}

        {status.closed && status.canAdvance ? (
          <>
            <Text variant="bodyStrong">Semana encerrada.</Text>
            <View style={styles.actions}>
              <Button
                label={status.isLastWeek ? 'Concluir plano' : `Avançar para a semana ${String(nextWeek)}`}
                disabled={busy}
                onPress={onAdvance}
              />
              <Button label="Repetir semana" variant="secondary" disabled={busy} onPress={onRepeat} />
            </View>
          </>
        ) : null}

        {status.closed && !status.canAdvance && status.blockReason === 'below_minimum' ? (
          <>
            <Text variant="caption" color={colors.textSecondary}>
              {`Conclua pelo menos ${String(status.minimum)} treinos para avançar. Repita a semana para seguir no seu ritmo.`}
            </Text>
            <View style={styles.actions}>
              <Button label="Repetir semana" disabled={busy} onPress={onRepeat} />
            </View>
          </>
        ) : null}

        {status.closed && !status.canAdvance && status.blockReason === 'locked' ? (
          <>
            <Text variant="caption" color={colors.textSecondary}>
              As próximas semanas fazem parte do Premium.
            </Text>
            <View style={styles.actions}>
              <Button label="Ver planos" disabled={busy} onPress={onUnlock} />
              <Button label="Repetir semana" variant="secondary" disabled={busy} onPress={onRepeat} />
            </View>
          </>
        ) : null}

        <InlineError message={error} />
      </View>
    </Card>
  );
}

const makeStyles = createStyles(() =>
  StyleSheet.create({
    content: {
      gap: spacing.sm,
    },
    actions: {
      gap: spacing.sm,
      marginTop: spacing.xs,
    },
  }),
);
