import type { ReactElement } from 'react';
import { HeartPulse } from 'lucide-react-native';
import { Card } from '@/components/Card';
import { IconBadge } from '@/components/IconBadge';
import { ListRow } from '@/components/ListRow';
import { HubActions } from '@/components/devices/HubActions';
import type { DeviceConnection } from '@/lib/connectedDevices';
import { connectionSubtitle } from '@/lib/healthHubStatus';
import { providerLabels } from '@/lib/healthHubLabels';
import { sizes } from '@/theme';
import { useTheme } from '@/hooks/useTheme';
import type { HealthProvider, HubAvailability } from '@/types/healthHub';

interface HubCardProps {
  provider: HealthProvider;
  availability: HubAvailability | null;
  connection: DeviceConnection | null;
  syncing: boolean;
  lastImported: number | null;
  now: Date;
  onConnect: () => void;
  onSync: () => void;
  onDisconnect: () => void;
  onOpenStore: () => void;
}

export function HubCard({
  provider,
  availability,
  connection,
  syncing,
  lastImported,
  now,
  onConnect,
  onSync,
  onDisconnect,
  onOpenStore,
}: HubCardProps): ReactElement {
  const { colors } = useTheme();
  const label = providerLabels[provider];
  return (
    <Card flush>
      <ListRow
        title={label}
        subtitle={connectionSubtitle(connection, now)}
        leading={
          <IconBadge tone="soft">
            <HeartPulse size={sizes.iconLg} color={colors.ink} strokeWidth={sizes.iconStroke} />
          </IconBadge>
        }
      />
      <HubActions
        provider={provider}
        availability={availability}
        connected={connection?.status === 'connected'}
        syncing={syncing}
        lastImported={lastImported}
        label={label}
        onConnect={onConnect}
        onSync={onSync}
        onDisconnect={onDisconnect}
        onOpenStore={onOpenStore}
      />
    </Card>
  );
}
