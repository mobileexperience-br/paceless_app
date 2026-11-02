import { useState, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Check, CloudOff } from 'lucide-react-native';
import { Button, Text } from '@/components';
import { SelectableCard } from '@/components/paywall/SelectableCard';
import { useTheme } from '@/hooks/useTheme';
import type { PerceivedEffort } from '@/lib/activities';
import { perceivedEffortLabels, perceivedEffortOptions } from '@/lib/perceivedEffort';
import { savePerceivedEffort } from '@/lib/saveEffort';
import { sizes, spacing, workout } from '@/theme';

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
      <Text variant="caption" color={colors.textSecondary}>
        Sensação não registrada.
      </Text>
    );
  }

  if (phase === 'saved' && choice !== null) {
    return (
      <View style={styles.result}>
        <Check size={workout.statusIconSize} color={colors.primary} strokeWidth={sizes.iconStroke} />
        <Text variant="caption" color={colors.ink} style={styles.resultText}>
          {`Sensação registrada: ${perceivedEffortLabels[choice]}`}
        </Text>
      </View>
    );
  }

  if (phase === 'queued') {
    return (
      <View style={styles.result}>
        <CloudOff size={workout.statusIconSize} color={colors.primary} strokeWidth={sizes.iconStroke} />
        <Text variant="caption" color={colors.ink} style={styles.resultText}>
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
      <Text variant="title3" color={colors.ink}>Como você se sentiu?</Text>
      <Text variant="caption" color={colors.textSecondary}>
        Opcional. Ajuda a acompanhar sua tolerância ao esforço.
      </Text>
      <View style={styles.options} accessibilityRole="radiogroup" accessibilityLabel="Como você se sentiu?">
        {perceivedEffortOptions.map((effort) => (
          <SelectableCard
            key={effort}
            active={choice === effort}
            disabled={busy}
            accessibilityLabel={perceivedEffortLabels[effort]}
            onPress={() => {
              setChoice(effort);
            }}
          >
            <Text variant="body">{perceivedEffortLabels[effort]}</Text>
          </SelectableCard>
        ))}
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
  result: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  resultText: {
    flex: 1,
  },
});
