import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Card, Text } from '@/components';
import { createStyles, spacing } from '@/theme';
import { useThemedStyles } from '@/hooks/useTheme';
import type { AttemptSummary } from '@/types/training';

interface AttemptHistoryProps {
  history: AttemptSummary[];
}

export function AttemptHistory({ history }: AttemptHistoryProps): ReactElement {
  const styles = useThemedStyles(makeStyles);
  return (
    <Card>
      <View style={styles.content}>
        <Text variant="captionStrong">
          Tentativas anteriores
        </Text>
        {history.map((item) => (
          <Text key={item.attempt} variant="body">
            {`Tentativa ${String(item.attempt)}: ${String(item.completed)} de ${String(item.eligible)} treinos concluídos`}
          </Text>
        ))}
      </View>
    </Card>
  );
}

const makeStyles = createStyles(() =>
  StyleSheet.create({
    content: {
      gap: spacing.sm,
    },
  }),
);
