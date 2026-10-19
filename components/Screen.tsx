import { type ReactNode } from 'react';
import { ScrollView, StyleSheet, View, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, layout, spacing } from '@/theme';

type ScreenProps = {
  children: ReactNode;
  /** Envolve o conteúdo num ScrollView com o padding lateral padrão. */
  scroll?: boolean;
  /** Remove o padding lateral — para conteúdo full-bleed. */
  flush?: boolean;
  dark?: boolean;
  /** Bordas seguras aplicadas. Telas com tab bar não precisam da de baixo. */
  edges?: ('top' | 'bottom')[];
  style?: ViewStyle;
};

export function Screen({
  children,
  scroll = false,
  flush = false,
  dark = false,
  edges = ['top'],
  style,
}: ScreenProps) {
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
    paddingBottom: spacing.xxxl,
  },
});
