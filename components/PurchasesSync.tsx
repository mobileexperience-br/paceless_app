import type { ReactElement } from 'react';
import { usePurchasesUser } from '@/hooks/usePurchasesUser';

export function PurchasesSync(): ReactElement | null {
  usePurchasesUser();
  return null;
}
