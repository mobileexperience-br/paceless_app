import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Circle, CircleMinus, CirclePlay, CircleSlash, CircleX } from 'lucide-react-native';
import { CheckCircle, Text } from '@/components';
import { sizes, spacing, type Palette } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import type { PlanSessionState } from '@/types/training';

export const sessionStateLabels: Record<PlanSessionState, string> = {
  completed: 'Concluído',
  in_progress: 'Em andamento',
  interrupted: 'Interrompido',
  cancelled: 'Cancelado',
  missed: 'Não realizado',
  today: 'Hoje',
  pending: 'Pendente',
};

interface SessionStatusProps {
  state: PlanSessionState;
}

export function SessionStatus({ state }: SessionStatusProps): ReactElement {
  const { colors } = useTheme();
  const tone = toneOf(state, colors);
  return (
    <View style={styles.chip} accessible={false}>
      {renderIcon(state, colors)}
      <Text variant={state === 'today' ? 'captionStrong' : 'caption'} color={tone}>
        {sessionStateLabels[state]}
      </Text>
    </View>
  );
}

function renderIcon(state: PlanSessionState, colors: Palette): ReactElement {
  const strokeWidth = sizes.iconStroke;
  const size = sizes.iconMd;
  switch (state) {
    case 'completed':
      return <CheckCircle checked size={size} decorative />;
    case 'in_progress':
      return <CirclePlay size={size} color={colors.ink} strokeWidth={strokeWidth} />;
    case 'interrupted':
      return <CircleSlash size={size} color={colors.danger} strokeWidth={strokeWidth} />;
    case 'missed':
      return <CircleX size={size} color={colors.danger} strokeWidth={strokeWidth} />;
    case 'cancelled':
      return <CircleMinus size={size} color={colors.textSecondary} strokeWidth={strokeWidth} />;
    case 'today':
      return <Circle size={size} color={colors.ink} strokeWidth={strokeWidth} />;
    case 'pending':
      return <Circle size={size} color={colors.textSecondary} strokeWidth={strokeWidth} />;
  }
}

function toneOf(state: PlanSessionState, colors: Palette): string {
  switch (state) {
    case 'completed':
      return colors.primaryDeep;
    case 'interrupted':
    case 'missed':
      return colors.danger;
    case 'in_progress':
    case 'today':
      return colors.ink;
    case 'cancelled':
    case 'pending':
      return colors.textSecondary;
  }
}

const styles = StyleSheet.create({
  chip: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
});
