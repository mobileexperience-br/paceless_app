import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { ActivityRow } from '@/components/activities/ActivityRow';
import { Text } from '@/components/Text';
import type { Activity } from '@/lib/activities';
import { spacing } from '@/theme';

interface LastWorkoutCardProps {
  activity: Activity;
}

export function LastWorkoutCard({ activity }: LastWorkoutCardProps): ReactElement {
  return (
    <View style={styles.wrapper}>
      <Text variant="captionStrong">Último treino</Text>
      <ActivityRow activity={activity} now={new Date()} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    gap: spacing.sm,
  },
});
