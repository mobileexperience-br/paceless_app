import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowRight,
  Ellipsis,
  Lock,
  Pause,
  Square,
} from 'lucide-react-native';
import { StatRow, Text, type Stat } from '@/components';
import { colors, layout, radius, spacing } from '@/theme';

const stats: Stat[] = [
  { value: '—', label: 'Distância (km)' },
  { value: '—', label: 'Ritmo (min/km)' },
  { value: '—', label: 'FC média (bpm)' },
];

export default function WorkoutScreen(): ReactElement {
  const router = useRouter();

  return (
    <View style={styles.root}>
      <StatusBar style="light" />
      <SafeAreaView edges={['top', 'bottom']} style={styles.safe}>
        <View style={styles.topBar}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={12}
            onPress={() => { router.back(); }}
          >
            <ArrowLeft size={24} color={colors.dark.text} strokeWidth={2} />
          </Pressable>
          <View style={styles.grow} />
          <Pressable accessibilityRole="button" accessibilityLabel="Mais opções" hitSlop={12}>
            <Ellipsis size={24} color={colors.dark.text} strokeWidth={2} />
          </Pressable>
        </View>

        <View style={styles.heading}>
          <Text variant="title1" color={colors.dark.text}>
            Corrida leve
          </Text>
          <Text variant="caption" color={colors.dark.textSecondary}>
            Zona 2 • Base aeróbica
          </Text>
        </View>

        <View style={styles.timer}>
          <Text variant="timer" center color={colors.primary}>
            00:00:00
          </Text>
          <Text variant="caption" center color={colors.dark.textSecondary}>
            Duração
          </Text>
        </View>

        <StatRow stats={stats} dark style={styles.stats} />

        <View style={styles.controls}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Bloquear tela"
            style={styles.secondaryControl}
          >
            <Lock size={24} color={colors.dark.text} strokeWidth={1.75} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Pausar treino"
            style={styles.primaryControl}
          >
            <Pause size={36} color={colors.ink} fill={colors.ink} strokeWidth={0} />
          </Pressable>

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Parar treino"
            style={styles.secondaryControl}
          >
            <Square
              size={20}
              color={colors.dark.text}
              fill={colors.dark.text}
              strokeWidth={0}
            />
          </Pressable>
        </View>

        <View style={styles.slider}>
          <View style={styles.sliderThumb}>
            <ArrowRight size={20} color={colors.ink} strokeWidth={2.5} />
          </View>
          <Text variant="caption" center color={colors.dark.textSecondary} style={styles.grow}>
            Deslize para finalizar
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.dark.background,
  },
  safe: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  grow: {
    flex: 1,
  },
  heading: {
    gap: spacing.xs,
    marginTop: spacing.lg,
  },
  timer: {
    flex: 1,
    justifyContent: 'center',
    gap: spacing.sm,
  },
  stats: {
    marginBottom: spacing.huge,
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.huge,
  },
  secondaryControl: {
    width: 56,
    height: 56,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.dark.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryControl: {
    width: 96,
    height: 96,
    borderRadius: radius.full,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  slider: {
    height: 56,
    borderRadius: radius.md,
    backgroundColor: colors.dark.surface,
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.xs,
  },
  sliderThumb: {
    width: 64,
    height: 48,
    borderRadius: radius.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
