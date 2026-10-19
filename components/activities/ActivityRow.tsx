import type { ReactElement } from 'react';
import { Dumbbell, Footprints } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { IconBadge } from '@/components/IconBadge';
import { ListRow } from '@/components/ListRow';
import type { Activity } from '@/lib/activities';
import { dayLabel, formatDuration } from '@/lib/activityStats';
import { formatKm } from '@/lib/geo';
import { colors, sizes } from '@/theme';

interface ActivityRowProps {
  activity: Activity;
  now: Date;
}

export function ActivityRow({ activity, now }: ActivityRowProps): ReactElement {
  const isRun = activity.type === 'run';
  const Icon = isRun ? Footprints : Dumbbell;
  const subtitle = `${dayLabel(activity.startedAt, now)} • ${formatDuration(activity.durationSeconds)}`;
  const distance =
    isRun && activity.distanceMeters > 0 ? `${formatKm(activity.distanceMeters, 2)} km` : undefined;

  return (
    <Card flush>
      <ListRow
        title={isRun ? 'Corrida' : 'Musculação'}
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
