import { useCallback, type ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Bell,
  ChevronRight,
  ClipboardList,
  Footprints,
} from 'lucide-react-native';
import {
  Button,
  Card,
  Avatar,
  IconBadge,
  Screen,
  Text,
} from '@/components';
import { QuickAccess } from '@/components/home/QuickAccess';
import { LastWorkoutCard } from '@/components/home/LastWorkoutCard';
import { WeekProgressCard } from '@/components/home/WeekProgressCard';
import { useActivities } from '@/hooks/useActivities';
import { useProfile } from '@/hooks/useProfile';
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

        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Plano atual. Abrir plano"
          onPress={() => { router.push('/plan'); }}
        >
          {({ pressed }) => (
          <Card style={pressed ? styles.pressed : undefined}>
            <View style={styles.rowBetween}>
              <View style={styles.grow}>
                <Text variant="captionStrong">Plano atual</Text>
                <Text variant="title3" style={styles.planTitle}>
                  Nenhum plano ativo
                </Text>
                <View style={styles.planMeta}>
                  <ClipboardList size={sizes.iconSm} color={colors.primaryDeep} strokeWidth={sizes.iconStroke} />
                  <Text variant="caption" color={colors.textSecondary} style={styles.planText}>
                    Nenhuma semana em andamento
                  </Text>
                </View>
              </View>
              <ChevronRight size={sizes.iconMd} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />
            </View>
          </Card>
          )}
        </Pressable>

        <WeekProgressCard activities={activities} />

        <Card>
          <Text variant="captionStrong">Próximo treino</Text>
          <View style={[styles.rowBetween, styles.nextWorkout]}>
            <IconBadge tone="primary" size={sizes.badgeLg}>
              <Footprints size={sizes.iconLg} color={colors.onPrimary} strokeWidth={sizes.iconStroke} />
            </IconBadge>
            <View style={styles.grow}>
              <Text variant="bodyStrong">Nenhum treino agendado</Text>
              <Text variant="caption" color={colors.textSecondary}>
                Escolha um plano para começar
              </Text>
            </View>
          </View>
        </Card>

        {lastActivity ? <LastWorkoutCard activity={lastActivity} /> : null}

        <Button label="Iniciar treino" onPress={() => { router.push('/workout/atual'); }} />

        <QuickAccess />
      </View>
    </Screen>
  );
}

const makeStyles = createStyles((colors) =>
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
    pressed: {
      backgroundColor: colors.track,
    },
    rowBetween: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    grow: {
      flex: 1,
    },
    planTitle: {
      marginTop: spacing.xs,
    },
    planMeta: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      marginTop: spacing.sm,
    },
    planText: {
      flexShrink: 1,
    },
    nextWorkout: {
      marginTop: spacing.md,
    },
  }),
);
