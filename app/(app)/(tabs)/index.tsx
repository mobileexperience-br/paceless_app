import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
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
  IconBadge,
  ProgressBar,
  Screen,
  Text,
} from '@/components';
import { colors, layout, radius, spacing } from '@/theme';

const quickAccess = [
  { label: 'Musculação', href: '/strength', Icon: Dumbbell },
  { label: 'Nutrição', href: '/nutrition', Icon: Apple },
  { label: 'Plano', href: '/plan', Icon: ClipboardList },
] as const;

export default function HomeScreen(): ReactElement {
  const router = useRouter();

  return (
    <Screen scroll flush>
      <View style={styles.body}>
        <View style={styles.topBar}>
          <IconBadge tone="primary" size={36}>
            <Text variant="captionStrong">A</Text>
          </IconBadge>
          <View style={styles.spacer} />
          <Pressable accessibilityRole="button" accessibilityLabel="Notificações" hitSlop={12}>
            <Bell size={24} color={colors.ink} strokeWidth={1.75} />
          </Pressable>
        </View>

        <View style={styles.greeting}>
          <Text variant="title2">Olá, Alex!</Text>
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
                  New To Running Plan
                </Text>
                <View style={styles.planMeta}>
                  <ClipboardList size={16} color={colors.primaryDeep} strokeWidth={1.75} />
                  <Text variant="caption" color={colors.textSecondary}>
                    Semana 1 de 8
                  </Text>
                </View>
              </View>
              <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.75} />
            </View>
          </Card>
        </Pressable>

        <Card>
          <Text variant="captionStrong">Progresso da semana</Text>
          <Text variant="caption" color={colors.textSecondary} style={styles.progressLabel}>
            0 / 0 treinos concluídos
          </Text>
          <ProgressBar progress={0} style={styles.progressBar} />
        </Card>

        <Card>
          <Text variant="captionStrong">Próximo treino</Text>
          <View style={[styles.rowBetween, styles.nextWorkout]}>
            <IconBadge tone="primary" size={48}>
              <Footprints size={24} color={colors.ink} strokeWidth={1.75} />
            </IconBadge>
            <View style={styles.grow}>
              <Text variant="bodyStrong">Nenhum treino agendado</Text>
              <Text variant="caption" color={colors.textSecondary}>
                Escolha um plano para começar
              </Text>
            </View>
            <ChevronRight size={20} color={colors.textSecondary} strokeWidth={1.75} />
          </View>
        </Card>

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
                <Icon size={24} color={colors.ink} strokeWidth={1.75} />
                <Text variant="caption">{label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
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
  progressLabel: {
    marginTop: spacing.xs,
  },
  progressBar: {
    marginTop: spacing.md,
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
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
