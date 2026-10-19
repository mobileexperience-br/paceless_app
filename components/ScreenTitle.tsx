import { type ReactNode, type ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Text } from './Text';
import { layout, spacing } from '@/theme';

interface ScreenTitleProps {
  title: string;
  trailing?: ReactNode;
}

export function ScreenTitle({ title, trailing }: ScreenTitleProps): ReactElement {
  return (
    <View style={styles.container}>
      <Text variant="title2" style={styles.title}>
        {title}
      </Text>
      {trailing}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: layout.screenPadding,
    paddingTop: spacing.md,
    paddingBottom: layout.titleGap,
  },
  title: {
    flex: 1,
  },
});
