import { useCallback, useEffect, useState } from 'react';
import Purchases, { type PurchasesPackage } from 'react-native-purchases';
import { ensurePurchases } from '@/lib/purchases';

export type PlanId = 'annual' | 'monthly';
export type OfferingsStatus = 'loading' | 'ready' | 'unavailable' | 'error';

export interface Plan {
  id: PlanId;
  title: string;
  price: string;
  note: string;
  purchasePackage: PurchasesPackage;
}

interface UseOfferings {
  status: OfferingsStatus;
  plans: Plan[];
  reload: () => void;
}

function initialStatus(): OfferingsStatus {
  return ensurePurchases() ? 'loading' : 'unavailable';
}

export function useOfferings(): UseOfferings {
  const [status, setStatus] = useState<OfferingsStatus>(initialStatus);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!ensurePurchases()) {
      return;
    }
    let active = true;
    Purchases.getOfferings()
      .then((offerings) => {
        if (!active) {
          return;
        }
        const current = offerings.current;
        const next: Plan[] = [];
        if (current?.annual) {
          next.push({
            id: 'annual',
            title: 'Anual',
            price: current.annual.product.priceString,
            note: 'Melhor valor',
            purchasePackage: current.annual,
          });
        }
        if (current?.monthly) {
          next.push({
            id: 'monthly',
            title: 'Mensal',
            price: current.monthly.product.priceString,
            note: '',
            purchasePackage: current.monthly,
          });
        }
        setPlans(next);
        setStatus(next.length > 0 ? 'ready' : 'unavailable');
      })
      .catch(() => {
        if (active) {
          setStatus('error');
        }
      });
    return (): void => {
      active = false;
    };
  }, [attempt]);

  const reload = useCallback((): void => {
    setStatus('loading');
    setAttempt((value) => value + 1);
  }, []);

  return { status, plans, reload };
}
