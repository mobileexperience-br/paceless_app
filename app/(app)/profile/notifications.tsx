import type { ReactElement } from 'react';
import { StyleSheet, View } from 'react-native';
import { BellOff } from 'lucide-react-native';
import { EmptyState, Screen, ScreenHeader } from '@/components';
import { colors, layout, sizes } from '@/theme';

export default function NotificationsScreen(): ReactElement {
  return (
    <Screen scroll flush>
      <ScreenHeader showBack title="Notificações" />
      <View style={styles.body}>
        <EmptyState
          icon={<BellOff size={sizes.iconXl} color={colors.textSecondary} strokeWidth={sizes.iconStroke} />}
          title="Nenhuma notificação"
          description="Você será avisado aqui quando houver novidades."
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
