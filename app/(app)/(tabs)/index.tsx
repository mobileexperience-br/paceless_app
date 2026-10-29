import { useCallback, type ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import { Button, Avatar, Screen, Text } from '@/components';
import { QuickAccess } from '@/components/home/QuickAccess';
import { LastWorkoutCard } from '@/components/home/LastWorkoutCard';
import { PlanCard } from '@/components/home/PlanCard';
import { TodayCard } from '@/components/home/TodayCard';
import { WeekProgressCard } from '@/components/home/WeekProgressCard';
import { useActivePlan } from '@/hooks/useActivePlan';
import { useActivities } from '@/hooks/useActivities';
import { useProfile } from '@/hooks/useProfile';
import { localToday } from '@/lib/planDates';
import { createStyles, layout, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

export default function HomeScreen(): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { name, avatarUrl, loading: profileLoading } = useProfile();
  const firstName = name?.split(/\s+/)[0];
  const { activities, load } = useActivities();
  const lastActivity = activities[0];
  const { plan, loading: planLoading } = useActivePlan();

  useFocusEffect(
    useCallback((): void => {
      void load();
    }, [load]),
  );

  return (
    <Screen scroll flush>
      <View style={styles.body}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Abrir perfil"
            hitSlop={sizes.hitSlop}
            onPress={() => { router.push('/profile'); }}
          >
            <Avatar uri={avatarUrl} size={sizes.badgeSm} />
          </Pressable>
          <View style={styles.spacer} />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Notificações"
            hitSlop={sizes.hitSlop}
            onPress={() => { router.push('/profile/notifications'); }}
          >
            <Bell size={sizes.iconLg} color={colors.ink} strokeWidth={sizes.iconStroke} />
          </Pressable>
        </View>

        <View style={styles.greeting}>
          <Text variant="title2" style={profileLoading ? styles.hidden : undefined}>
            {firstName ? `Olá, ${firstName}!` : 'Olá!'}
          </Text>
          <Text variant="body" color={colors.textSecondary}>
            Pronto para o seu treino de hoje?
          </Text>
        </View>

        <PlanCard plan={plan} loading={planLoading} />

        <WeekProgressCard activities={activities} />

        <TodayCard plan={plan} loading={planLoading} today={localToday()} />

        {lastActivity ? <LastWorkoutCard activity={lastActivity} /> : null}

        <Button label="Iniciar treino" onPress={() => { router.push('/workout/atual'); }} />

        <QuickAccess />
      </View>
    </Screen>
  );
}

const makeStyles = createStyles(() =>
  StyleSheet.create({
    body: {
      paddingHorizontal: layout.screenPadding,
      gap: layout.cardGap,
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingTop: spacing.sm,
    },
    spacer: {
      flex: 1,
    },
    greeting: {
      gap: spacing.xs,
      marginTop: spacing.sm,
      marginBottom: spacing.xs,
    },
    hidden: {
      opacity: 0,
    },
  }),
);
