import { type ReactNode, type ReactElement } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';
import { layout, palettes } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

interface ScreenProps {
  children: ReactNode;
  scroll?: boolean;
  flush?: boolean;
  dark?: boolean;
  edges?: Edge[];
  style?: ViewStyle;
}

const defaultEdges: Edge[] = ['top', 'bottom', 'left', 'right'];

export function Screen({
  children,
  scroll = false,
  flush = false,
  dark = false,
  edges = defaultEdges,
  style,
}: ScreenProps): ReactElement {
  const { colors } = useTheme();
  const background = dark ? palettes.dark.background : colors.background;
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
