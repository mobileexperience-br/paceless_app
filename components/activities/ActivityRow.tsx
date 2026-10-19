import type { ReactElement } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { Dumbbell, Footprints, PersonStanding } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { IconBadge } from '@/components/IconBadge';
import { ListRow } from '@/components/ListRow';
import { activityLabels, type Activity } from '@/lib/activities';
import { dayLabel, formatDuration } from '@/lib/activityStats';
import { usePreferences } from '@/hooks/usePreferences';
import { distanceLabel, formatDistance } from '@/lib/units';
import { colors, sizes } from '@/theme';

interface ActivityRowProps {
  activity: Activity;
  now: Date;
}

const activityIcons: Record<Activity['type'], LucideIcon> = {
  run: Footprints,
  walk: PersonStanding,
  strength: Dumbbell,
};

export function ActivityRow({ activity, now }: ActivityRowProps): ReactElement {
  const { distanceUnit } = usePreferences();
  const hasDistance = activity.type !== 'strength';
  const Icon = activityIcons[activity.type];
  const subtitle = `${dayLabel(activity.startedAt, now)} • ${formatDuration(activity.durationSeconds)}`;
  const distance =
    hasDistance && activity.distanceMeters > 0
      ? `${formatDistance(activity.distanceMeters, distanceUnit, 2)} ${distanceLabel(distanceUnit)}`
      : undefined;

  return (
    <Card flush>
      <ListRow
        title={activityLabels[activity.type]}
        subtitle={subtitle}
        {...(distance ? { value: distance } : {})}
        leading={
          <IconBadge size={sizes.badgeLg}>
            <Icon size={sizes.iconLg} color={colors.ink} strokeWidth={sizes.iconStroke} />
          </IconBadge>
        }
      />
    </Card>
  );
}
