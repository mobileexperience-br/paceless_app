import { useEffect, useState, type ReactElement } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import * as Linking from 'expo-linking';
import { useRouter } from 'expo-router';
import { Button, Screen, Text } from '@/components';
import { supabase } from '@/lib/supabase';
import { parseAuthParams } from '@/lib/authRedirect';
import { useTheme } from '@/hooks/useTheme';
import { layout, spacing } from '@/theme';

const LINK_ERROR = 'Este link expirou ou já foi usado. Entre com seu e-mail e senha.';

async function completeAuth(url: string): Promise<boolean> {
  if (!supabase) return false;
  const params = parseAuthParams(url);
  const code = params.get('code');
  if (code) {
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    return !error;
  }
  const accessToken = params.get('access_token');
  const refreshToken = params.get('refresh_token');
  if (accessToken && refreshToken) {
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    });
    return !error;
  }
  return false;
}

export default function AuthCallbackScreen(): ReactElement {
  const { colors } = useTheme();
  const router = useRouter();
  const url = Linking.useLinkingURL();
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!url) return;
    void completeAuth(url).then((ok) => {
      if (ok) router.replace('/(app)');
      else setFailed(true);
    });
  }, [url, router]);

  return (
    <Screen>
      <View style={styles.body}>
        {failed ? (
          <>
            <Text variant="body" center>
              {LINK_ERROR}
            </Text>
            <Button label="Entrar" onPress={() => { router.replace('/login'); }} />
          </>
        ) : (
          <ActivityIndicator accessibilityLabel="Confirmando sua conta" color={colors.primaryDeep} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: layout.screenPadding,
    gap: spacing.lg,
  },
});
