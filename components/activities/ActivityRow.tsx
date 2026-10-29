import type { ReactElement } from 'react';
import type { LucideIcon } from 'lucide-react-native';
import { Dumbbell, Footprints, PersonStanding } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { IconBadge } from '@/components/IconBadge';
import { ListRow } from '@/components/ListRow';
import { activityLabels, type Activity } from '@/lib/activities';
import { sourceLabel } from '@/lib/healthHubLabels';
import { dayLabel, formatDuration } from '@/lib/activityStats';
import { usePreferences } from '@/hooks/usePreferences';
import { distanceLabel, formatDistance } from '@/lib/units';
import { sizes } from '@/theme';
import { useTheme } from '@/hooks/useTheme';

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
  const { colors } = useTheme();
  const { distanceUnit } = usePreferences();
  const hasDistance = activity.type !== 'strength';
  const Icon = activityIcons[activity.type];
  const base = `${dayLabel(activity.startedAt, now)} • ${formatDuration(activity.durationSeconds)}`;
  const subtitle = activity.pending ? `${base} • Sincronizando` : base;
  const distance =
    hasDistance && activity.distanceMeters > 0
      ? `${formatDistance(activity.distanceMeters, distanceUnit, 2)} ${distanceLabel(distanceUnit)}`
      : undefined;
  const origin = sourceLabel(activity.source, activity.sourceName);

  return (
    <Card flush>
      <ListRow
        title={activityLabels[activity.type]}
        subtitle={subtitle}
        {...(distance ? { value: distance } : {})}
        {...(origin ? { meta: origin, accessibilityLabel: `${activityLabels[activity.type]}, importado de ${origin}` } : {})}
        leading={
          <IconBadge size={sizes.badgeLg}>
            <Icon size={sizes.iconLg} color={colors.ink} strokeWidth={sizes.iconStroke} />
          </IconBadge>
        }
      />
    </Card>
  );
}
