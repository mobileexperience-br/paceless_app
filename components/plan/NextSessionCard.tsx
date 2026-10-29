import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { CalendarCheck, Dumbbell, Footprints } from 'lucide-react-native';
import { Card, IconBadge, Text } from '@/components';
import { formatLongDate } from '@/lib/planCalendar';
import { sessionTargetLabel } from '@/lib/planProgress';
import { createStyles, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';
import type { PlanSession } from '@/types/training';

interface NextSessionCardProps {
  session: PlanSession | null;
  isToday: boolean;
  locked: boolean;
}

export function NextSessionCard({ session, isToday, locked }: NextSessionCardProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const heading = isToday ? 'Treino de hoje' : 'Próximo treino';

  if (!session) {
    return (
      <Pressable
        accessibilityRole={locked ? 'button' : undefined}
        disabled={!locked}
        onPress={() => {
          router.push('/plan-paywall');
        }}
      >
        <Card>
          <Text variant="captionStrong">Próximo treino</Text>
          <View style={styles.row}>
            <IconBadge tone="primary" size={sizes.badgeLg}>
              <CalendarCheck size={sizes.iconLg} color={colors.onPrimary} strokeWidth={sizes.iconStroke} />
            </IconBadge>
            <View style={styles.texts}>
              <Text variant="bodyStrong">{locked ? 'Continue no Premium' : 'Plano concluído'}</Text>
              <Text variant="caption" color={colors.textSecondary}>
                {locked
                  ? 'Assine para liberar as próximas semanas do plano.'
                  : 'Gere um novo plano nas configurações.'}
              </Text>
            </View>
          </View>
        </Card>
      </Pressable>
    );
  }

  const Icon = session.workout.kind === 'strength' ? Dumbbell : Footprints;
  const target = sessionTargetLabel(session.workout);
  const details = [formatLongDate(session.date), target].filter((part) => part !== null).join(' • ');

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${heading}: ${session.workout.title}, ${formatLongDate(session.date)}`}
      onPress={() => {
        router.push(`/plan/session/${session.id}`);
      }}
      style={({ pressed }) => (pressed ? styles.pressed : null)}
    >
      <Card>
        <Text variant="captionStrong">{heading}</Text>
        <View style={styles.row}>
          <IconBadge tone="primary" size={sizes.badgeLg}>
            <Icon size={sizes.iconLg} color={colors.onPrimary} strokeWidth={sizes.iconStroke} />
          </IconBadge>
          <View style={styles.texts}>
            <Text variant="bodyStrong" numberOfLines={2}>
              {session.workout.title}
            </Text>
            <Text variant="caption" color={colors.textSecondary} numberOfLines={2}>
              {details}
            </Text>
          </View>
        </View>
      </Card>
    </Pressable>
  );
}

const makeStyles = createStyles(() =>
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
    pressed: {
      opacity: 0.85,
    },
  }),
);
