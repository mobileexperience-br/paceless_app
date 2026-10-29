import type { ReactElement, ReactNode } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Minus, Plus } from 'lucide-react-native';
import { Text } from '@/components/Text';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';
import { padTwo, stepHour, stepMinute } from '@/lib/reminderTime';
import type { ReminderTime } from '@/types/notifications';
import { createStyles, layout, radius, sizes, spacing } from '@/theme';

interface ReminderTimeStepperProps {
  time: ReminderTime;
  onChange: (next: ReminderTime) => void;
}

interface StepButtonProps {
  label: string;
  onPress: () => void;
  children: ReactNode;
}

function StepButton({ label, onPress, children }: StepButtonProps): ReactElement {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      hitSlop={sizes.hitSlop}
      onPress={onPress}
      style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}
    >
      {children}
    </Pressable>
  );
}

interface ValueStepperProps {
  value: string;
  decreaseLabel: string;
  increaseLabel: string;
  onDecrease: () => void;
  onIncrease: () => void;
}

function ValueStepper({
  value,
  decreaseLabel,
  increaseLabel,
  onDecrease,
  onIncrease,
}: ValueStepperProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.group}>
      <StepButton label={increaseLabel} onPress={onIncrease}>
        <Plus size={sizes.iconLg} color={colors.ink} strokeWidth={sizes.iconStroke} />
      </StepButton>
      <Text variant="metric" center style={styles.value}>
        {value}
      </Text>
      <StepButton label={decreaseLabel} onPress={onDecrease}>
        <Minus size={sizes.iconLg} color={colors.ink} strokeWidth={sizes.iconStroke} />
      </StepButton>
    </View>
  );
}

export function ReminderTimeStepper({ time, onChange }: ReminderTimeStepperProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={styles.row}>
      <ValueStepper
        value={padTwo(time.hour)}
        decreaseLabel="Diminuir hora"
        increaseLabel="Aumentar hora"
        onDecrease={(): void => { onChange(stepHour(time, -1)); }}
        onIncrease={(): void => { onChange(stepHour(time, 1)); }}
      />
      <Text variant="metric" color={colors.ink}>
        :
      </Text>
      <ValueStepper
        value={padTwo(time.minute)}
        decreaseLabel="Diminuir minutos"
        increaseLabel="Aumentar minutos"
        onDecrease={(): void => { onChange(stepMinute(time, -1)); }}
        onIncrease={(): void => { onChange(stepMinute(time, 1)); }}
      />
    </View>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.md,
    },
    group: {
      alignItems: 'center',
      gap: spacing.sm,
    },
    button: {
      minHeight: layout.headerHeight,
      minWidth: layout.headerHeight,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: radius.md,
      backgroundColor: colors.track,
    },
    buttonPressed: {
      backgroundColor: colors.border,
    },
    value: {
      minWidth: layout.headerHeight,
    },
  }),
);
