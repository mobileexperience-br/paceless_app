import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { Watch } from 'lucide-react-native';
import { EmptyState, Screen, ScreenHeader } from '@/components';
import { colors, layout, sizes } from '@/theme';

export default function DevicesScreen(): ReactElement {
  return (
    <Screen scroll flush edges={['top', 'bottom']}>
      <ScreenHeader showBack title="Dispositivos conectados" />
      <View style={styles.body}>
        <EmptyState
          icon={<Watch size={sizes.iconXl} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />}
          title="Nenhum dispositivo conectado"
          description="Conecte um relógio ou sensor para sincronizar seus treinos."
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    paddingHorizontal: layout.screenPadding,
  },
});
