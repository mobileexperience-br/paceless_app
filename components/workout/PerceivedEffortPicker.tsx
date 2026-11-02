import { useState, type ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Check, CloudOff } from 'lucide-react-native';
import { Button, Text } from '@/components';
import { useTheme } from '@/hooks/useTheme';
import type { PerceivedEffort } from '@/lib/activities';
import { perceivedEffortLabels, perceivedEffortOptions } from '@/lib/perceivedEffort';
import { savePerceivedEffort } from '@/lib/saveEffort';
import { palettes, radius, sizes, spacing, workout } from '@/theme';

type EffortPhase = 'choosing' | 'saving' | 'saved' | 'queued' | 'skipped' | 'failed';

interface PerceivedEffortPickerProps {
  activityId: string;
}

export function PerceivedEffortPicker({ activityId }: PerceivedEffortPickerProps): ReactElement {
  const { colors } = useTheme();
  const [phase, setPhase] = useState<EffortPhase>('choosing');
  const [choice, setChoice] = useState<PerceivedEffort | null>(null);
  const busy = phase === 'saving';

  const submit = async (effort: PerceivedEffort): Promise<void> => {
    setPhase('saving');
    const result = await savePerceivedEffort(activityId, effort);
    setPhase(result);
  };

  if (phase === 'skipped') {
    return (
      <Text variant="caption" color={palettes.dark.textSecondary}>
        Sensação não registrada.
      </Text>
    );
  }

  if (phase === 'saved' && choice !== null) {
    return (
      <View style={styles.result}>
        <Check size={workout.statusIconSize} color={colors.primary} strokeWidth={sizes.iconStroke} />
        <Text variant="caption" color={palettes.dark.ink} style={styles.resultText}>
          {`Sensação registrada: ${perceivedEffortLabels[choice]}`}
        </Text>
      </View>
    );
  }

  if (phase === 'queued') {
    return (
      <View style={styles.result}>
        <CloudOff size={workout.statusIconSize} color={colors.primary} strokeWidth={sizes.iconStroke} />
        <Text variant="caption" color={palettes.dark.ink} style={styles.resultText}>
          Sensação guardada. Será enviada quando houver conexão.
        </Text>
      </View>
    );
  }

  if (phase === 'failed') {
    return (
      <View style={styles.block}>
        <Text variant="caption" color={colors.danger}>Não foi possível guardar a sensação.</Text>
        <Button
          label="Tentar de novo"
          variant="text"
          onPress={() => {
            if (choice !== null) void submit(choice);
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.block}>
      <Text variant="title3" color={palettes.dark.ink}>Como você se sentiu?</Text>
      <Text variant="caption" color={palettes.dark.textSecondary}>
        Opcional. Ajuda a acompanhar sua tolerância ao esforço.
      </Text>
      <View style={styles.options} accessibilityRole="radiogroup">
        {perceivedEffortOptions.map((effort) => {
          const selected = choice === effort;
          return (
            <Pressable
              key={effort}
              accessibilityRole="radio"
              accessibilityState={{ selected, disabled: busy }}
              disabled={busy}
              onPress={() => {
                setChoice(effort);
              }}
              style={[
                styles.option,
                { borderColor: selected ? colors.primary : palettes.dark.border },
                selected && { backgroundColor: colors.primarySoft },
              ]}
            >
              <Text variant="body" color={palettes.dark.ink}>{perceivedEffortLabels[effort]}</Text>
            </Pressable>
          );
        })}
      </View>
      <Button
        label={busy ? 'Salvando...' : 'Salvar sensação'}
        disabled={choice === null || busy}
        onPress={() => {
          if (choice !== null) void submit(choice);
        }}
      />
      <Button
        label="Pular"
        variant="text"
        disabled={busy}
        onPress={() => {
          setPhase('skipped');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  block: {
    gap: spacing.sm,
  },
  options: {
    gap: spacing.sm,
    marginVertical: spacing.xs,
  },
  option: {
    justifyContent: 'center',
    height: workout.effortOptionHeight,
    paddingHorizontal: spacing.lg,
    borderWidth: sizes.hairline * 2,
    borderRadius: radius.md,
  },
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resultText: {
    flex: 1,
  },
});
