import type { ReactElement } from 'react';
import { Lock, Trophy } from 'lucide-react-native';
import { IconBadge } from '@/components/IconBadge';
import { ListRow } from '@/components/ListRow';
import { formatEarnedDate } from '@/lib/achievements';
import { sizes } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import type { Achievement } from '@/types/achievements';

interface AchievementRowProps {
  achievement: Achievement;
  divider: boolean;
}

export function AchievementRow({ achievement, divider }: AchievementRowProps): ReactElement {
  const { colors } = useTheme();
  const { earnedAt, title, description } = achievement;
  const meta = earnedAt
    ? `Conquistada em ${formatEarnedDate(earnedAt)}`
    : 'Ainda não conquistada';
  const leading = earnedAt ? (
    <IconBadge tone="primary" size={sizes.badgeSm}>
      <Trophy size={sizes.iconMd} color={colors.onPrimary} strokeWidth={sizes.iconStroke} />
    </IconBadge>
  ) : (
    <IconBadge tone="neutral" size={sizes.badgeSm}>
      <Lock size={sizes.iconMd} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />
    </IconBadge>
  );

  return (
    <ListRow
      title={title}
      subtitle={description ?? ''}
      meta={meta}
      leading={leading}
      showChevron={false}
      divider={divider}
      accessibilityLabel={`${title}. ${meta}`}
    />
  );
}
