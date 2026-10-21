import { useCallback, type ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import {
  Apple,
  Bell,
  ChevronRight,
  ClipboardList,
  Dumbbell,
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
import { LastWorkoutCard } from '@/components/home/LastWorkoutCard';
import { WeekProgressCard } from '@/components/home/WeekProgressCard';
import { useActivities } from '@/hooks/useActivities';
import { useProfile } from '@/hooks/useProfile';
import { createStyles, layout, radius, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

const quickAccess = [
  { label: 'Musculação', href: '/strength', Icon: Dumbbell },
  { label: 'Nutrição', href: '/nutrition', Icon: Apple },
  { label: 'Plano', href: '/plan', Icon: ClipboardList },
] as const;

export default function HomeScreen(): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const router = useRouter();
  const { name, avatarUrl } = useProfile();
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
          <Avatar uri={avatarUrl} size={sizes.badgeSm} />
          <View style={styles.spacer} />
          <Pressable accessibilityRole="button" accessibilityLabel="Notificações" hitSlop={sizes.hitSlop}>
            <Bell size={sizes.iconLg} color={colors.ink} strokeWidth={sizes.iconStroke} />
          </Pressable>
        </View>

        <View style={styles.greeting}>
          <Text variant="title2">{firstName ? `Olá, ${firstName}!` : 'Olá!'}</Text>
          <Text variant="body" color={colors.textSecondary}>
            Pronto para o seu treino de hoje?
          </Text>
        </View>

        <Pressable accessibilityRole="button" onPress={() => { router.push('/plan'); }}>
          <Card>
            <View style={styles.rowBetween}>
              <View style={styles.grow}>
                <Text variant="captionStrong">Plano atual</Text>
                <Text variant="title3" style={styles.planTitle}>
                  Nenhum plano ativo
                </Text>
                <View style={styles.planMeta}>
                  <ClipboardList size={sizes.iconSm} color={colors.primaryDeep} strokeWidth={sizes.iconStroke} />
                  <Text variant="caption" color={colors.textSecondary}>
                    Nenhuma semana em andamento
                  </Text>
                </View>
              </View>
              <ChevronRight size={sizes.iconMd} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />
            </View>
          </Card>
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
            <ChevronRight size={sizes.iconMd} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />
          </View>
        </Card>

        {lastActivity ? <LastWorkoutCard activity={lastActivity} /> : null}

        <Button label="Iniciar treino" onPress={() => { router.push('/workout/atual'); }} />

        <View style={styles.quickAccess}>
          <Text variant="captionStrong">Acesso rápido</Text>
          <View style={styles.tiles}>
            {quickAccess.map(({ label, href, Icon }) => (
              <Pressable
                key={label}
                accessibilityRole="button"
                onPress={() => { router.push(href); }}
                style={styles.tile}
              >
                <Icon size={sizes.iconLg} color={colors.ink} strokeWidth={sizes.iconStroke} />
                <Text variant="caption">{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
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
    nextWorkout: {
      marginTop: spacing.md,
    },
    quickAccess: {
      gap: spacing.md,
      marginTop: spacing.sm,
    },
    tiles: {
      flexDirection: 'row',
      gap: layout.cardGap,
    },
    tile: {
      flex: 1,
      aspectRatio: 1,
      borderRadius: radius.md,
      borderWidth: sizes.hairline,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
    },
  }),
);
