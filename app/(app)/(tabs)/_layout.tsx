import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import type { BottomTabBarButtonProps } from 'expo-router/tabs';
import {
  Apple,
  ClipboardList,
  House,
  Play,
  User,
} from 'lucide-react-native';
import { createStyles, fonts, layout, radius, shadows, sizes, spacing } from '@/theme';
import { useTheme, useThemedStyles } from '@/hooks/useTheme';

function ActivitiesTabButton({
  onPress,
  onLongPress,
  accessibilityState,
  style,
}: BottomTabBarButtonProps): ReactElement {
  const { colors } = useTheme();
  const styles = useThemedStyles(makeStyles);
  return (
    <View style={[style, styles.fabSlot]}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Atividades"
        accessibilityState={accessibilityState}
        hitSlop={sizes.hitSlop}
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Play size={sizes.iconXl} color={colors.onPrimary} fill={colors.onPrimary} strokeWidth={0} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout(): ReactElement {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, spacing.sm);
  const tabBarContentHeight = Math.max(layout.tabBarHeight, sizes.fab + sizes.fabLift);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        sceneStyle: { backgroundColor: colors.background },
        tabBarActiveTintColor: colors.primaryDeep,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: tabBarContentHeight + bottomInset,
          paddingBottom: bottomInset,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.medium,
          fontSize: sizes.tabLabel,
        },
        tabBarIconStyle: {
          marginTop: sizes.micro,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => (
            <House
              size={layout.tabIconSize}
              color={color}
              strokeWidth={sizes.iconStroke}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plano',
          tabBarIcon: ({ color }) => (
            <ClipboardList
              size={layout.tabIconSize}
              color={color}
              strokeWidth={sizes.iconStroke}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="activities"
        options={{
          title: 'Atividades',
          tabBarButton: (props) => <ActivitiesTabButton {...props} />,
        }}
      />
      <Tabs.Screen
        name="nutrition"
        options={{
          title: 'Nutrição',
          tabBarIcon: ({ color }) => (
            <Apple
              size={layout.tabIconSize}
              color={color}
              strokeWidth={sizes.iconStroke}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <User
              size={layout.tabIconSize}
              color={color}
              strokeWidth={sizes.iconStroke}
            />
          ),
        }}
      />
    </Tabs>
  );
}

const makeStyles = createStyles((colors) =>
  StyleSheet.create({
    fabSlot: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    fab: {
      width: sizes.fab,
      height: sizes.fab,
      borderRadius: radius.full,
      backgroundColor: colors.primary,
      alignItems: 'center',
      justifyContent: 'center',
      ...shadows.fab,
    },
    fabPressed: {
      backgroundColor: colors.primaryPressed,
    },
  }),
);
