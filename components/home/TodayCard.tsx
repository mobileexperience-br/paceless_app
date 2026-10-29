import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarCheck, Dumbbell, Footprints, Moon, type LucideIcon } from 'lucide-react-native';
import { Card, IconBadge, Text } from '@/components';
import { isPlanLocked, nextSession, sessionTargetLabel, stateOn, todaySessions } from '@/lib/planProgress';
import { weekdayName } from '@/lib/planCalendar';
import { createStyles, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';
import type { ActivePlan, PlanSession } from '@/types/training';

interface TodayCardProps {
  plan: ActivePlan | null;
  loading: boolean;
  today: string;
}

const lockedView: TodayView = {
  title: 'Continue no Premium',
  detail: 'Assine para liberar as próximas semanas do plano.',
  route: '/plan-paywall',
  icon: CalendarCheck,
};

interface TodayView {
  title: string;
  detail: string;
  route: string;
  icon: LucideIcon;
}

function sessionDetail(session: PlanSession): string {
  const target = sessionTargetLabel(session.workout);
  return target ? `${session.workout.title} • ${target}` : session.workout.title;
}

function sessionIcon(session: PlanSession): LucideIcon {
  return session.workout.kind === 'strength' ? Dumbbell : Footprints;
}

function todayViewOf(plan: ActivePlan | null, today: string): TodayView {
  if (plan === null) {
    return {
      title: 'Nenhum treino agendado',
      detail: 'Configure seu plano para começar',
      route: '/plan/settings',
      icon: Moon,
    };
  }
  const sessions = todaySessions(plan, today);
  const pending = sessions.find((session) => stateOn(session, today) !== 'done');
  if (pending) {
    return {
      title: 'Treino de hoje',
      detail: sessionDetail(pending),
      route: `/plan/session/${pending.id}`,
      icon: sessionIcon(pending),
    };
  }
  const finished = sessions.at(0);
  if (finished) {
    return {
      title: 'Treino de hoje concluído',
      detail: sessionDetail(finished),
      route: `/plan/session/${finished.id}`,
      icon: CalendarCheck,
    };
  }
  const next = nextSession(plan, today);
  if (next) {
    return {
      title: 'Hoje é dia de descanso',
      detail: `Próximo: ${next.workout.title}, ${weekdayName(next.date)}`,
      route: `/plan/session/${next.id}`,
      icon: Moon,
    };
  }
  if (isPlanLocked(plan)) return lockedView;
  return {
    title: 'Plano concluído',
    detail: 'Gere um novo plano nas configurações.',
    route: '/plan/settings',
    icon: CalendarCheck,
  };
}

export function TodayCard({ plan, loading, today }: TodayCardProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const view = todayViewOf(plan, today);
  const Icon = view.icon;
  const hidden = loading && plan === null ? styles.hidden : undefined;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${view.title}. ${view.detail}`}
      onPress={() => {
        router.push(view.route);
      }}
    >
      {({ pressed }) => (
        <Card style={pressed ? styles.pressed : undefined}>
          <Text variant="captionStrong">Próximo treino</Text>
          <View style={styles.row}>
            <IconBadge tone="primary" size={sizes.badgeLg}>
              <Icon size={sizes.iconLg} color={colors.onPrimary} strokeWidth={sizes.iconStroke} />
            </IconBadge>
            <View style={[styles.texts, hidden]}>
              <Text variant="bodyStrong" numberOfLines={2}>
                {view.title}
              </Text>
              <Text variant="caption" color={colors.textSecondary} numberOfLines={2}>
                {view.detail}
              </Text>
            </View>
          </View>
        </Card>
      )}
    </Pressable>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      marginTop: spacing.md,
    },
    texts: {
      flexGrow: 1,
      flexShrink: 1,
      gap: spacing.xs,
    },
    hidden: {
      opacity: 0,
    },
    pressed: {
      backgroundColor: colors.track,
    },
  }),
);
