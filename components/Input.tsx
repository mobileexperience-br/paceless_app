import { useState, type ComponentRef, type ReactElement, type Ref } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';
import { Eye, EyeOff } from 'lucide-react-native';
import { Text } from './Text';
import { createStyles, layout, radius, sizes, spacing, typography } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

export type InputRef = ComponentRef<typeof TextInput>;

type InputProps = Omit<TextInputProps, 'style'> & {
  label?: string;
  helper?: string;
  error?: boolean;
  secure?: boolean;
  inputRef?: Ref<InputRef>;
  style?: ViewStyle;
};

export function Input({
  label,
  helper,
  error,
  secure,
  inputRef,
  style,
  ...rest
}: InputProps): ReactElement {
  const { colors, isDark } = useTheme();
  const styles = useThemedStyles(makeStyles);
  const [hidden, setHidden] = useState(true);

  return (
    <View style={[styles.wrapper, style]}>
      {label ? (
        <Text variant="captionStrong" color={colors.textSecondary}>
          {label}
        </Text>
      ) : null}
      <View style={[styles.container, error && { borderColor: colors.danger }]}>
        <TextInput
          ref={inputRef}
          accessibilityLabel={label ?? rest.placeholder}
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
            hitSlop={sizes.hitSlop}
            onPress={() => { setHidden((value) => !value); }}
          >
            {hidden ? (
              <EyeOff size={sizes.iconMd} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />
            ) : (
              <Eye size={sizes.iconMd} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />
            )}
          </Pressable>
        ) : null}
      </View>
      {helper ? (
        <Text variant="caption" color={colors.textSecondary}>
          {helper}
        </Text>
      ) : null}
    </View>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    wrapper: {
      gap: spacing.xs,
    },
    container: {
      height: layout.controlHeight,
      borderRadius: radius.md,
      borderWidth: 1,
      borderColor: colors.borderStrong,
      backgroundColor: colors.surface,
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: layout.cardPadding,
      gap: spacing.md,
    },
    input: {
      flex: 1,
      height: '100%',
      color: colors.ink,
      ...typography.body,
      lineHeight: undefined,
    },
  }),
);
