import { type ReactNode } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { colors, radius } from '@/theme';

type IconBadgeTone = 'primary' | 'soft' | 'neutral';

type IconBadgeProps = {
  children: ReactNode;
  tone?: IconBadgeTone;
  size?: number;
  style?: ViewStyle;
};

const backgrounds: Record<IconBadgeTone, string> = {
  primary: colors.primary,
  soft: colors.primarySoft,
  neutral: colors.track,
};

/** Círculo colorido atrás de um ícone — usado nos cards e listas de treino. */
export function IconBadge({
  children,
  tone = 'soft',
  size = 44,
  style,
}: IconBadgeProps) {
  return (
    <View
      style={[
        styles.badge,
        {
          width: size,
          height: size,
          borderRadius: radius.full,
          backgroundColor: backgrounds[tone],
        },
        style,
      ]}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
