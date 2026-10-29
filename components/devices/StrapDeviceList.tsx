import type { ReactElement } from 'react';
import { ActivityIndicator, StyleSheet } from 'react-native';
import { Card } from '@/components/Card';
import { ListRow } from '@/components/ListRow';
import { Text } from '@/components/Text';
import { useTheme } from '@/hooks/useTheme';
import type { ScannedStrap } from '@/types/heartRate';
import { layout } from '@/theme';

interface StrapDeviceListProps {
  devices: ScannedStrap[];
  selectedId: string | null;
  bpm: number | null;
  readingTimedOut: boolean;
  onSelect: (device: ScannedStrap) => void;
}

function previewSubtitle(bpm: number | null, timedOut: boolean): string {
  if (bpm !== null) return `${bpm} bpm`;
  return timedOut ? 'Sem leitura. Verifique se a cinta está no peito.' : 'Conectando...';
}

export function StrapDeviceList({
  devices,
  selectedId,
  bpm,
  readingTimedOut,
  onSelect,
}: StrapDeviceListProps): ReactElement {
  const { colors } = useTheme();
  return (
    <Card flush>
      {devices.map((device, index) => {
        const selected = device.id === selectedId;
        return (
          <ListRow
            key={device.id}
            title={device.name}
            subtitle={selected ? previewSubtitle(bpm, readingTimedOut) : ''}
            divider={index < devices.length - 1}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            onPress={() => {
              onSelect(device);
            }}
            trailing={
              selected ? (
                bpm !== null ? (
                  <Text variant="metric" color={colors.primary}>
                    {bpm}
                  </Text>
                ) : (
                  <ActivityIndicator color={colors.primary} style={styles.spinner} />
                )
              ) : null
            }
          />
        );
      })}
    </Card>
  );
}

const styles = StyleSheet.create({
  spinner: {
    marginHorizontal: layout.cardPadding / 2,
  },
});
