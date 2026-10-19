import type { ConfigContext, ExpoConfig } from 'expo/config';

const GOOGLE_CLIENT_SUFFIX = '.apps.googleusercontent.com';
const GOOGLE_SCHEME_PREFIX = 'com.googleusercontent.apps.';

function googleIosUrlScheme(clientId: string | undefined): string | null {
  if (!clientId?.endsWith(GOOGLE_CLIENT_SUFFIX)) {
    return null;
  }
  return GOOGLE_SCHEME_PREFIX + clientId.slice(0, -GOOGLE_CLIENT_SUFFIX.length);
}

export default ({ config }: ConfigContext): ExpoConfig => {
  const iosUrlScheme = googleIosUrlScheme(process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID);
  const plugins = config.plugins ?? [];
  return {
    ...config,
    name: config.name ?? 'Paceless',
    slug: config.slug ?? 'paceless',
    plugins: iosUrlScheme
      ? [...plugins, ['@react-native-google-signin/google-signin', { iosUrlScheme }]]
      : plugins,
  };
};
