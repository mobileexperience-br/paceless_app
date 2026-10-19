import { useCallback, useState } from 'react';
import { Linking } from 'react-native';
import { useRouter } from 'expo-router';
import { buildSupportMailto, links } from '@/lib/links';

const OPEN_ERROR = 'Não foi possível abrir o link. Tente novamente mais tarde.';
const MAIL_ERROR = 'Não foi possível abrir o aplicativo de e-mail.';

export type LegalDocumentKind = 'terms' | 'privacy';

interface OpenLink {
  error: string | null;
  openUrl: (url: string) => Promise<void>;
  openSupportEmail: (email: string) => Promise<void>;
  openLegal: (kind: LegalDocumentKind) => void;
}

export function useOpenLink(): OpenLink {
  const router = useRouter();
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

  const openLegal = useCallback(
    (kind: LegalDocumentKind): void => {
      const url = kind === 'terms' ? links.termsUrl : links.privacyUrl;
      if (url) {
        void openUrl(url);
        return;
      }
      router.push(kind === 'terms' ? '/legal/terms' : '/legal/privacy');
    },
    [openUrl, router],
  );

  return { error, openUrl, openSupportEmail, openLegal };
}
