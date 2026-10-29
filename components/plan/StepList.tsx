import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Dumbbell, Footprints, Zap, type LucideIcon } from 'lucide-react-native';
import { Text } from '@/components';
import { formatStepDuration } from '@/lib/planProgress';
import { createStyles, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';
import type { PlanStep } from '@/types/training';

interface StepListProps {
  steps: PlanStep[];
  distanceLabel: string | null;
}

export function StepList({ steps, distanceLabel }: StepListProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  if (steps.length === 0) {
    return (
      <Text variant="caption" color={colors.textSecondary}>
        Sem passos detalhados.
      </Text>
    );
  }
  return (
    <View style={styles.list}>
      {steps.map((step, index) => (
        <StepRow key={`${String(index)}-${step.kind}`} step={step} distanceLabel={distanceLabel} />
      ))}
    </View>
  );
}

interface StepRowProps {
  step: PlanStep;
  distanceLabel: string | null;
}

function StepRow({ step, distanceLabel }: StepRowProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);

  if (step.kind === 'repeat') {
    return (
      <View style={styles.repeat}>
        <Text variant="captionStrong">{`${String(step.times)}x`}</Text>
        <View style={styles.nested}>
          {step.steps.map((child, index) => (
            <StepRow key={`${String(index)}-${child.kind}`} step={child} distanceLabel={distanceLabel} />
          ))}
        </View>
      </View>
    );
  }

  const Icon = stepIcons[step.kind];
  const duration = step.durationSec === 0 ? distanceLabel : formatStepDuration(step.durationSec);

  return (
    <View style={styles.step} accessibilityLabel={stepLabel(step.label, duration)} accessible>
      <Icon size={sizes.iconMd} color={colors.primaryDeep} strokeWidth={sizes.iconStroke} />
      <Text variant="body" style={styles.label}>
        {step.label}
      </Text>
      {duration ? (
        <Text variant="captionStrong" color={colors.textSecondary} style={styles.duration}>
          {duration}
        </Text>
      ) : null}
    </View>
  );
}

const stepIcons: Record<Exclude<PlanStep, { kind: 'repeat' }>['kind'], LucideIcon> = {
  warmup: Footprints,
  cooldown: Footprints,
  walk: Footprints,
  run: Zap,
  strength: Dumbbell,
};

function stepLabel(label: string, duration: string | null): string {
  return duration ? `${label}, ${duration}` : label;
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    list: {
      gap: spacing.md,
    },
    repeat: {
      gap: spacing.sm,
    },
    nested: {
      gap: spacing.md,
      marginLeft: spacing.lg,
      paddingLeft: spacing.lg,
      borderLeftWidth: sizes.hairline,
      borderLeftColor: colors.border,
    },
    step: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    label: {
      flexGrow: 1,
      flexShrink: 1,
    },
    duration: {
      flexShrink: 0,
    },
  }),
);
