import { useEffect, type ReactElement } from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import { PurchasesSync } from '@/components/PurchasesSync';
import { DialogProvider } from '@/providers/DialogProvider';
import '@/lib/trackingTask';
import { PreferencesProvider } from '@/providers/PreferencesProvider';
import { SessionProvider } from '@/providers/SessionProvider';
import { ThemeProvider } from '@/providers/ThemeProvider';
import { ThemedStack } from '@/components/ThemedStack';

void SplashScreen.preventAutoHideAsync();

export default function RootLayout(): ReactElement | null {
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    if (fontsLoaded) {
      void SplashScreen.hideAsync();
    }
  }, [fontsLoaded]);

  if (!fontsLoaded) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <SessionProvider>
        <PreferencesProvider>
          <ThemeProvider>
            <DialogProvider>
              <PurchasesSync />
              <ThemedStack>
                <Stack.Screen name="(pre-auth)" />
                <Stack.Screen name="(app)" />
                <Stack.Screen name="legal/terms" />
                <Stack.Screen name="legal/privacy" />
                <Stack.Screen name="auth/callback" />
              </ThemedStack>
            </DialogProvider>
          </ThemeProvider>
        </PreferencesProvider>
      </SessionProvider>
    </SafeAreaProvider>
  );
}
