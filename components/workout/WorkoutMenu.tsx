import { useState, type ReactElement } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { Check, ChevronRight, CircleHelp, Footprints, Trash2, type LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Text } from '@/components/Text';
import { activityLabels, workoutTypes, type WorkoutType } from '@/lib/activities';
import { colors, radius, spacing, workout } from '@/theme';

interface WorkoutMenuProps {
  visible: boolean;
  type: WorkoutType;
  onClose: () => void;
  onSelectType: (type: WorkoutType) => void;
  onDiscard: () => void;
  onHelp: () => void;
}

interface RowProps {
  Icon: LucideIcon;
  label: string;
  value?: string;
  color?: string;
  onPress: () => void;
}

function MenuRow({ Icon, label, value, color = colors.dark.text, onPress }: RowProps): ReactElement {
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <Icon size={workout.menuIconSize} color={color} strokeWidth={1.75} />
      <Text variant="body" color={color} style={styles.rowLabel}>
        {label}
      </Text>
      {value ? (
        <Text variant="caption" color={colors.dark.textSecondary}>
          {value}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function WorkoutMenu({
  visible,
  type,
  onClose,
  onSelectType,
  onDiscard,
  onHelp,
}: WorkoutMenuProps): ReactElement {
  const insets = useSafeAreaInsets();
  const [choosing, setChoosing] = useState<boolean>(false);

  const close = (): void => {
    setChoosing(false);
    onClose();
  };

  const pickType = (next: WorkoutType): void => {
    onSelectType(next);
    close();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={close}>
      <Pressable accessibilityLabel="Fechar menu" style={styles.backdrop} onPress={close} />
      <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
        {choosing ? (
          workoutTypes.map((option) => (
            <MenuRow
              key={option}
              Icon={option === type ? Check : ChevronRight}
              label={activityLabels[option]}
              color={option === type ? colors.primary : colors.dark.text}
              onPress={() => {
                pickType(option);
              }}
            />
          ))
        ) : (
          <>
            <MenuRow
              Icon={Footprints}
              label="Tipo de atividade"
              value={activityLabels[type]}
              onPress={() => {
                setChoosing(true);
              }}
            />
            <MenuRow
              Icon={CircleHelp}
              label="Ajuda com GPS"
              onPress={() => {
                close();
                onHelp();
              }}
            />
            <MenuRow
              Icon={Trash2}
              label="Descartar treino"
              color={colors.danger}
              onPress={() => {
                close();
                onDiscard();
              }}
            />
          </>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: colors.scrim,
  },
  sheet: {
    backgroundColor: colors.dark.background,
    borderTopLeftRadius: radius.xl,
    borderTopRightRadius: radius.xl,
    borderWidth: 1,
    borderColor: colors.dark.border,
    paddingTop: spacing.sm,
    paddingHorizontal: spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    minHeight: workout.menuRowHeight,
  },
  rowLabel: {
    flex: 1,
  },
});
