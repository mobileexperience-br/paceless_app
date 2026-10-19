import type { ReactElement } from 'react';
import { Pressable, StyleSheet, View, type ViewStyle } from 'react-native';
import { Text } from './Text';
import { colors, spacing } from '@/theme';

interface SegmentedTabsProps {
  items: readonly string[];
  value: string;
  onChange: (value: string) => void;
  style?: ViewStyle;
}

export function SegmentedTabs({
  items,
  value,
  onChange,
  style,
}: SegmentedTabsProps): ReactElement {
  return (
    <View style={[styles.container, style]}>
      {items.map((item) => {
        const active = item === value;
        return (
          <Pressable
            key={item}
            accessibilityRole="tab"
            accessibilityState={{ selected: active }}
            onPress={() => { onChange(item); }}
            style={[styles.tab, active && styles.tabActive]}
          >
            <Text
              variant={active ? 'captionStrong' : 'caption'}
              color={active ? colors.primaryDeep : colors.textSecondary}
            >
              {item}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
    marginBottom: -1,
  },
  tabActive: {
    borderBottomColor: colors.primary,
  },
});
