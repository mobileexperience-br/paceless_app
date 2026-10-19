import { useCallback, useEffect, useState } from 'react';
import Purchases, { type CustomerInfo, type PurchasesPackage } from 'react-native-purchases';
import { ensurePurchases, isUserCancelled, PREMIUM_ENTITLEMENT } from '@/lib/purchases';

export interface PurchaseResult {
  success: boolean;
  error: string | null;
}

interface UsePremium {
  isPremium: boolean;
  busy: boolean;
  purchase: (target: PurchasesPackage) => Promise<PurchaseResult>;
  restore: () => Promise<PurchaseResult>;
}

const PURCHASE_ERROR = 'Não foi possível concluir a compra. Tente novamente.';
const RESTORE_ERROR = 'Não foi possível restaurar as compras. Tente novamente.';
const NOT_CONFIGURED = 'Assinaturas indisponíveis no momento.';
const NO_PURCHASES = 'Nenhuma assinatura encontrada para restaurar.';

function hasPremium(info: CustomerInfo): boolean {
  return PREMIUM_ENTITLEMENT in info.entitlements.active;
}

export function usePremium(): UsePremium {
  const [isPremium, setIsPremium] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!ensurePurchases()) {
      return;
    }
    let active = true;
    const listener = (info: CustomerInfo): void => {
      setIsPremium(hasPremium(info));
    };
    Purchases.getCustomerInfo()
      .then((info) => {
        if (active) {
          setIsPremium(hasPremium(info));
        }
      })
      .catch(() => undefined);
    Purchases.addCustomerInfoUpdateListener(listener);
    return (): void => {
      active = false;
      Purchases.removeCustomerInfoUpdateListener(listener);
    };
  }, []);

  const purchase = useCallback(async (target: PurchasesPackage): Promise<PurchaseResult> => {
    if (!ensurePurchases()) {
      return { success: false, error: NOT_CONFIGURED };
    }
    setBusy(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(target);
      const premium = hasPremium(customerInfo);
      setIsPremium(premium);
      return { success: premium, error: premium ? null : PURCHASE_ERROR };
    } catch (error) {
      return { success: false, error: isUserCancelled(error) ? null : PURCHASE_ERROR };
    } finally {
      setBusy(false);
    }
  }, []);

  const restore = useCallback(async (): Promise<PurchaseResult> => {
    if (!ensurePurchases()) {
      return { success: false, error: NOT_CONFIGURED };
    }
    setBusy(true);
    try {
      const info = await Purchases.restorePurchases();
      const premium = hasPremium(info);
      setIsPremium(premium);
      return { success: premium, error: premium ? null : NO_PURCHASES };
    } catch {
      return { success: false, error: RESTORE_ERROR };
    } finally {
      setBusy(false);
    }
  }, []);

  return { isPremium, busy, purchase, restore };
}
