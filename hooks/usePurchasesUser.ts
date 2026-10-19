import { useEffect } from 'react';
import { syncPurchasesUser } from '@/lib/purchases';
import { useSession } from '@/hooks/useSession';

export function usePurchasesUser(): void {
  const { user, loading } = useSession();
  const userId = user?.id ?? null;

  useEffect(() => {
    if (loading) {
      return;
    }
    void syncPurchasesUser(userId);
  }, [userId, loading]);
}
