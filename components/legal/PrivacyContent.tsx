import type { ReactElement } from 'react';
import { LegalDocument } from '@/components/LegalDocument';
import { privacy } from '@/content/legal/privacy';

export function PrivacyContent(): ReactElement {
  return <LegalDocument content={privacy} />;
}
