import { useCallback } from 'react';
import { Platform } from 'react-native';
import Purchases from 'react-native-purchases';
import { useOpenLink } from './useOpenLink';
import { usePremium } from './usePremium';
import { ANDROID_SUBSCRIPTIONS_URL, IOS_SUBSCRIPTIONS_URL } from '@/lib/links';
import { ensurePurchases } from '@/lib/purchases';

interface ManageSubscription {
  isPremium: boolean;
  error: string | null;
  manage: () => Promise<void>;
}

function fallbackUrl(): string {
  return Platform.OS === 'ios' ? IOS_SUBSCRIPTIONS_URL : ANDROID_SUBSCRIPTIONS_URL;
}

async function resolveUrl(): Promise<string> {
  if (!ensurePurchases()) {
    return fallbackUrl();
  }
  try {
    const info = await Purchases.getCustomerInfo();
    return info.managementURL ?? fallbackUrl();
  } catch {
    return fallbackUrl();
  }
}

export function useManageSubscription(): ManageSubscription {
  const { isPremium } = usePremium();
  const { error, openUrl } = useOpenLink();

  const manage = useCallback(async (): Promise<void> => {
    await openUrl(await resolveUrl());
  }, [openUrl]);

  return { isPremium, error, manage };
}
