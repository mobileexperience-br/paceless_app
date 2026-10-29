import * as Linking from 'expo-linking';

export const authRedirectUrl = Linking.createURL('auth/callback');

export function parseAuthParams(url: string): URLSearchParams {
  const [beforeHash, hash = ''] = url.split('#');
  const query = beforeHash?.split('?')[1] ?? '';
  return new URLSearchParams(`${query}&${hash}`);
}
