import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';
import { Tabs } from 'expo-router';
import type { BottomTabBarButtonProps } from 'expo-router/tabs';
import {
  Apple,
  ClipboardList,
  House,
  Play,
  User,
} from 'lucide-react-native';
import { colors, fonts, layout, radius, shadows } from '@/theme';

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
        <Play size={28} color={colors.ink} fill={colors.ink} strokeWidth={0} />
      </Pressable>
    </View>
  );
}

export default function TabsLayout(): ReactElement {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primaryDeep,
        tabBarInactiveTintColor: colors.textSecondary,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          height: layout.tabBarHeight,
        },
        tabBarLabelStyle: {
          fontFamily: fonts.medium,
          fontSize: 11,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Início',
          tabBarIcon: ({ color, focused }) => (
            <House
              size={layout.tabIconSize}
              color={color}
              fill={focused ? color : 'none'}
              strokeWidth={1.75}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="plan"
        options={{
          title: 'Plano',
          tabBarIcon: ({ color, focused }) => (
            <ClipboardList
              size={layout.tabIconSize}
              color={color}
              fill={focused ? color : 'none'}
              strokeWidth={1.75}
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
          tabBarIcon: ({ color, focused }) => (
            <Apple
              size={layout.tabIconSize}
              color={color}
              fill={focused ? color : 'none'}
              strokeWidth={1.75}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color, focused }) => (
            <User
              size={layout.tabIconSize}
              color={color}
              fill={focused ? color : 'none'}
              strokeWidth={1.75}
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
    top: -8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fab: {
    width: 64,
    height: 64,
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
