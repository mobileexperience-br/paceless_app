import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import { buildSupportMailto } from '@/lib/links';

const OPEN_ERROR = 'Não foi possível abrir o link. Tente novamente mais tarde.';
const MAIL_ERROR = 'Não foi possível abrir o aplicativo de e-mail.';

interface OpenLink {
  error: string | null;
  openUrl: (url: string) => Promise<void>;
  openSupportEmail: (email: string) => Promise<void>;
}

export function useOpenLink(): OpenLink {
  const [error, setError] = useState<string | null>(null);

  const open = useCallback(async (target: string, message: string): Promise<void> => {
    try {
      await Linking.openURL(target);
      setError(null);
    } catch {
      setError(message);
    }
  }, []);

  const openUrl = useCallback((url: string): Promise<void> => open(url, OPEN_ERROR), [open]);

  const openSupportEmail = useCallback(
    (email: string): Promise<void> => open(buildSupportMailto(email), MAIL_ERROR),
    [open],
  );

  return { error, openUrl, openSupportEmail };
}
