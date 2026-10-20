import { useState, type ReactElement } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { createStyles, layout, radius, typography } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

type InputProps = Omit<TextInputProps, 'style'> & {
  secure?: boolean;
  style?: ViewStyle;
};

export function Input({ secure, style, ...rest }: InputProps): ReactElement {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [hidden, setHidden] = useState(true);

  return (
    <View style={[styles.container, style]}>
      <TextInput
        placeholderTextColor={colors.textSecondary}
        keyboardAppearance={isDark ? 'dark' : 'light'}
        secureTextEntry={secure && hidden}
        style={styles.input}
        {...rest}
      />
      {secure ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={hidden ? 'Mostrar senha' : 'Ocultar senha'}
          hitSlop={12}
          onPress={() => { setHidden((value) => !value); }}
        >
          {hidden ? (
            <EyeOff size={20} color={colors.textSecondary} strokeWidth={1.75} />
          ) : (
            <Eye size={20} color={colors.textSecondary} strokeWidth={1.75} />
          )}
        </Pressable>
      ) : null}
    </View>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    container: {
      height: layout.controlHeight,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.border,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: layout.cardPadding,
      gap: 12,
    },
    input: {
      flex: 1,
      height: '100%',
      color: colors.ink,
      ...typography.body,
    },
  }),
);
