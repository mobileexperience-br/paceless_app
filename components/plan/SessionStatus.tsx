import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Circle, CircleX } from 'lucide-react-native';
import { CheckCircle, Text } from '@/components';
import { layout, sizes, spacing, type Palette } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import type { PlanSessionState } from '@/types/training';

export const sessionStateLabels: Record<PlanSessionState, string> = {
  done: 'Concluído',
  today: 'Hoje',
  pending: 'Pendente',
  missed: 'Perdido',
};

interface SessionStatusProps {
  state: PlanSessionState;
}

export function SessionStatus({ state }: SessionStatusProps): ReactElement {
  const { colors } = useTheme();
  const icon = renderIcon(state, colors);
  const tone = toneOf(state, colors);
  return (
    <View style={styles.chip} accessible={false}>
      {icon}
      <Text
        variant={state === 'today' ? 'captionStrong' : 'caption'}
        color={tone}
      >
        {sessionStateLabels[state]}
      </Text>
    </View>
  );
}

function renderIcon(state: PlanSessionState, colors: Palette): ReactElement {
  if (state === 'done') return <CheckCircle checked size={sizes.iconMd} decorative />;
  if (state === 'missed') {
    return <CircleX size={sizes.iconMd} color={colors.danger} strokeWidth={sizes.iconStroke} />;
  }
  return (
    <Circle
      size={sizes.iconMd}
      color={state === 'today' ? colors.ink : colors.textSecondary}
      strokeWidth={sizes.iconStroke}
    />
  );
}

function toneOf(state: PlanSessionState, colors: Palette): string {
  if (state === 'done') return colors.primaryDeep;
  if (state === 'missed') return colors.danger;
  if (state === 'today') return colors.ink;
  return colors.textSecondary;
}

const styles = StyleSheet.create({
  chip: {
    flexShrink: 0,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    minHeight: layout.headerHeight,
  },
});
