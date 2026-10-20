import { type ReactNode, type ReactElement } from 'react';
import { StyleSheet, View, type ViewStyle } from 'react-native';
import { useTheme } from '@/hooks/useTheme';
import { radius } from '@/theme';

type IconBadgeTone = 'primary' | 'soft' | 'neutral';

interface IconBadgeProps {
  children: ReactNode;
  tone?: IconBadgeTone;
  size?: number;
  style?: ViewStyle;
}

export function IconBadge({
  children,
  tone = 'soft',
  size = 44,
  style,
}: IconBadgeProps): ReactElement {
  const { colors } = useTheme();
  const backgrounds: Record<IconBadgeTone, string> = {
    primary: colors.primary,
    soft: colors.primarySoft,
    neutral: colors.track,
  };

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
