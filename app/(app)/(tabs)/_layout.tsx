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
import { colors, fonts, layout, radius, shadows, sizes, spacing } from '@/theme';

function ActivitiesTabButton({
  onPress,
  onLongPress,
  accessibilityState,
  style,
}: BottomTabBarButtonProps): ReactElement {
  return (
    <View style={[style, styles.fabSlot]}>
      <Pressable
        accessibilityRole="button"
        accessibilityState={accessibilityState}
        onPress={onPress}
        onLongPress={onLongPress}
        style={({ pressed }) => [styles.fab, pressed && styles.fabPressed]}
      >
        <Play size={sizes.iconXl} color={colors.ink} fill={colors.ink} strokeWidth={0} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout(): ReactElement {
  const insets = useSafeAreaInsets();
  const bottomInset = Math.max(insets.bottom, spacing.sm);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDeep,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: layout.tabBarHeight + bottomInset,
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

      <Tabs.Screen name="strength" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  fabSlot: {
    top: -sizes.fabLift,
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
});
