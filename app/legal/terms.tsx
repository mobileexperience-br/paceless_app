import type { ReactElement } from 'react';
import { LegalDocument } from '@/components/LegalDocument';
import { terms } from '@/content/legal/terms';

export default function TermsScreen(): ReactElement {
  return <LegalDocument content={terms} />;
}
