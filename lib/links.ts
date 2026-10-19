export interface LegalLinks {
  termsUrl: string | null;
  privacyUrl: string | null;
  supportEmail: string | null;
  faqUrl: string | null;
}

const HTTPS_PREFIX = 'https://';
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const WHITESPACE_PATTERN = /\s/;

function validUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (
    !trimmed ||
    !trimmed.startsWith(HTTPS_PREFIX) ||
    trimmed.length === HTTPS_PREFIX.length ||
    WHITESPACE_PATTERN.test(trimmed)
  ) {
    return null;
  }
  return trimmed;
}

function validEmail(value: string | undefined): string | null {
  const trimmed = value?.trim();
  if (!trimmed || !EMAIL_PATTERN.test(trimmed)) {
    return null;
  }
  return trimmed;
}

export const links: LegalLinks = {
  termsUrl: validUrl(process.env.EXPO_PUBLIC_TERMS_URL),
  privacyUrl: validUrl(process.env.EXPO_PUBLIC_PRIVACY_URL),
  supportEmail: validEmail(process.env.EXPO_PUBLIC_SUPPORT_EMAIL),
  faqUrl: validUrl(process.env.EXPO_PUBLIC_FAQ_URL),
};

export function buildSupportMailto(email: string): string {
  return `mailto:${email}?subject=${encodeURIComponent('Suporte Paceless')}`;
}
