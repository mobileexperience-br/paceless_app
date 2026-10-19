import { type ReactNode, type ReactElement } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout } from '@/theme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  flush?: boolean;
  dark?: boolean;
  edges?: ('top' | 'bottom')[];
  style?: ViewStyle;
}

export function Screen({
  children,
  scroll = false,
  flush = false,
  dark = false,
  edges = ['top'],
  style,
}: ScreenProps): ReactElement {
  const background = dark ? colors.dark.background : colors.background;
  const padding = flush ? undefined : layout.screenPadding;

  return (
    <SafeAreaView edges={edges} style={[styles.safe, { backgroundColor: background }]}>
      {scroll ? (
        <ScrollView
          contentContainerStyle={[
            styles.scrollContent,
            { paddingHorizontal: padding },
            style,
          ]}
          showsVerticalScrollIndicator={false}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={[styles.content, { paddingHorizontal: padding }, style]}>
          {children}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: layout.screenBottom,
  },
});
