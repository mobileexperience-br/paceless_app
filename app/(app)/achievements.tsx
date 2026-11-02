import type { ReactElement } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import {
  Button,
  Card,
  EmptyState,
  InlineError,
  Screen,
  ScreenHeader,
  Text,
} from '@/components';
import { AchievementRow } from '@/components/achievements/AchievementRow';
import { useAchievements } from '@/hooks/useAchievements';
import { layout, spacing } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

const EMPTY_TITLE = 'Nenhuma conquista disponível ainda';
const LOAD_ERROR_TITLE = 'Não foi possível carregar suas conquistas';

export default function AchievementsScreen(): ReactElement {
  const { colors } = useTheme();
  const { achievements, loading, error, reload } = useAchievements();
  const earnedCount = achievements.filter((item) => item.earnedAt !== null).length;

  const renderBody = (): ReactElement => {
    if (achievements.length === 0 && loading) {
      return (
        <ActivityIndicator
          color={colors.primaryDeep}
          style={styles.loader}
          accessibilityLabel="Carregando conquistas"
        />
      );
    }
    if (achievements.length === 0 && error) {
      return (
        <EmptyState
          title={LOAD_ERROR_TITLE}
          description="Verifique sua conexão e tente novamente."
          action={
            <Button
              label="Tentar novamente"
              variant="secondary"
              onPress={() => { void reload(); }}
            />
          }
        />
      );
    }
    if (achievements.length === 0) {
      return <EmptyState title={EMPTY_TITLE} />;
    }
    return (
      <View style={styles.list}>
        <Text variant="captionStrong" color={colors.textSecondary}>
          {`${String(earnedCount)} de ${String(achievements.length)} conquistadas`}
        </Text>
        <InlineError message={error} />
        <Card flush>
          {achievements.map((achievement, index) => (
            <AchievementRow
              key={achievement.id}
              achievement={achievement}
              divider={index < achievements.length - 1}
            />
          ))}
        </Card>
      </View>
    );
  };

  return (
    <Screen scroll flush>
      <ScreenHeader title="Conquistas" showBack />
      <View style={styles.body}>{renderBody()}</View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: layout.screenPadding,
    paddingBottom: layout.screenBottom,
  },
  list: {
    gap: layout.cardGap,
    marginTop: spacing.sm,
  },
  loader: {
    paddingVertical: spacing.huge,
  },
});
