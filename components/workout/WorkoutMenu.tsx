import type { ReactElement } from 'react';
import { Modal, Pressable, StyleSheet, View } from 'react-native';
import { ArrowLeft, Check, ChevronRight, CircleHelp, Footprints, Trash2, type LucideIcon } from 'lucide-react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ModalSafeArea } from '@/components/ModalSafeArea';
import { Text } from '@/components/Text';
import { activityLabels, workoutTypes, type WorkoutType } from '@/lib/activities';
import { createStyles, palettes, radius, spacing, workout } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

interface WorkoutMenuProps {
  visible: boolean;
  view: 'menu' | 'types';
  onViewChange: (view: 'menu' | 'types') => void;
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

function MenuRow({ Icon, label, value, color = palettes.dark.ink, onPress }: RowProps): ReactElement {
  const styles = useThemedStyles(makeStyles);
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={styles.row}>
      <Icon size={workout.menuIconSize} color={color} strokeWidth={1.75} />
      <Text variant="body" color={color} style={styles.rowLabel}>
        {label}
      </Text>
      {value ? (
        <Text variant="caption" color={palettes.dark.textSecondary}>
          {value}
        </Text>
      ) : null}
    </Pressable>
  );
}

export function WorkoutMenu({
  visible,
  view,
  onViewChange,
  type,
  onClose,
  onSelectType,
  onDiscard,
  onHelp,
}: WorkoutMenuProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const insets = useSafeAreaInsets();

  const pickType = (next: WorkoutType): void => {
    onSelectType(next);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      navigationBarTranslucent
      onRequestClose={onClose}
    >
      <ModalSafeArea>
      <Pressable accessibilityLabel="Fechar menu" style={styles.backdrop} onPress={onClose} />
      <View
        style={[
          styles.sheet,
          {
            paddingBottom: insets.bottom + spacing.xxl,
            paddingLeft: insets.left + spacing.xl,
            paddingRight: insets.right + spacing.xl,
          },
        ]}
      >
        {view === 'types' ? (
          <>
            <MenuRow
              Icon={ArrowLeft}
              label="Tipo de atividade"
              onPress={() => {
                onViewChange('menu');
              }}
            />
            {workoutTypes.map((option) => (
              <MenuRow
                key={option}
                Icon={option === type ? Check : ChevronRight}
                label={activityLabels[option]}
                color={option === type ? colors.primary : palettes.dark.ink}
                onPress={() => {
                  pickType(option);
                }}
              />
            ))}
          </>
        ) : (
          <>
            <MenuRow
              Icon={Footprints}
              label="Tipo de atividade"
              value={activityLabels[type]}
              onPress={() => {
                onViewChange('types');
              }}
            />
            <MenuRow
              Icon={CircleHelp}
              label="Ajuda com GPS"
              onPress={() => {
                onClose();
                onHelp();
              }}
            />
            <MenuRow
              Icon={Trash2}
              label="Descartar treino"
              color={colors.danger}
              onPress={() => {
                onClose();
                onDiscard();
              }}
            />
          </>
        )}
      </View>
      </ModalSafeArea>
    </Modal>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: colors.scrim,
    },
    sheet: {
      backgroundColor: palettes.dark.background,
      borderTopLeftRadius: radius.xl,
      borderTopRightRadius: radius.xl,
      borderWidth: 1,
      borderColor: palettes.dark.border,
      paddingTop: spacing.sm,
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
  }),
);
