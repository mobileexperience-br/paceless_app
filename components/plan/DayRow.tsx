import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Moon } from 'lucide-react-native';
import { Text } from '@/components';
import { SessionStatus, sessionStateLabels } from '@/components/plan/SessionStatus';
import { sessionTargetLabel, stateOn, type WeekDay } from '@/lib/planProgress';
import { createStyles, layout, radius, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

interface DayRowProps {
  day: WeekDay;
  todayDate: string;
  onSessionPress: (sessionId: string) => void;
}

export function DayRow({ day, todayDate, onSessionPress }: DayRowProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const isToday = day.date === todayDate;
  const heading = `${day.label}, ${day.caption}`;

  return (
    <View style={[styles.row, isToday && styles.today]}>
      <Text variant="captionStrong" color={colors.textSecondary}>
        {heading}
      </Text>
      {day.sessions.length === 0 ? (
        <View style={styles.rest}>
          <Moon size={sizes.iconMd} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />
          <Text variant="body" color={colors.textSecondary}>
            Descanso
          </Text>
        </View>
      ) : (
        day.sessions.map((session) => {
          const state = stateOn(session, todayDate);
          const target = sessionTargetLabel(session.workout);
          return (
            <Pressable
              key={session.id}
              accessibilityRole="button"
              accessibilityLabel={`${day.label}, ${session.workout.title}, ${sessionStateLabels[state]}`}
              hitSlop={sizes.hitSlop}
              onPress={() => {
                onSessionPress(session.id);
              }}
              style={({ pressed }) => [styles.session, pressed && styles.pressed]}
            >
              <View style={styles.sessionText}>
                <Text variant="bodyStrong" numberOfLines={2}>
                  {session.workout.title}
                </Text>
                {target ? (
                  <Text variant="caption" color={colors.textSecondary} numberOfLines={1}>
                    {target}
                  </Text>
                ) : null}
              </View>
              <SessionStatus state={state} />
            </Pressable>
          );
        })
      )}
    </View>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    row: {
      gap: spacing.xs,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.sm,
      borderBottomWidth: sizes.hairline,
      borderBottomColor: colors.border,
    },
    today: {
      backgroundColor: colors.primarySoft,
      borderRadius: radius.md,
      borderBottomWidth: 0,
    },
    rest: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      minHeight: layout.headerHeight,
    },
    session: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      minHeight: layout.headerHeight,
    },
    sessionText: {
      flexGrow: 1,
      flexShrink: 1,
      gap: sizes.micro,
    },
    pressed: {
      opacity: 0.7,
    },
  }),
);
