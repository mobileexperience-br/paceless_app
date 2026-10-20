import type { ReactElement } from 'react';
import { LegalDocument } from '@/components/LegalDocument';
import { terms } from '@/content/legal/terms';

export function TermsContent(): ReactElement {
  return <LegalDocument content={terms} />;
}
