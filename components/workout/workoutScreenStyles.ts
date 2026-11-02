import { StyleSheet } from 'react-native';
import { layout, palettes, spacing } from '@/theme';

export const workoutScreenStyles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: palettes.dark.background,
  },
  safe: {
    flex: 1,
    paddingHorizontal: layout.screenPadding,
  },
  controls: {
    marginBottom: spacing.huge,
  },
});
