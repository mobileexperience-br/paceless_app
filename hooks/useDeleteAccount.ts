import { useCallback, useState } from 'react';
import { cancelReminders } from '@/lib/platform/reminders';
import { clearHeartRateLocalData } from '@/lib/strapDevice';
import { supabase } from '@/lib/supabase';

interface DeleteAccountResult {
  error: string | null;
}

interface UseDeleteAccount {
  deleting: boolean;
  deleteAccount: () => Promise<DeleteAccountResult>;
}

export function useDeleteAccount(): UseDeleteAccount {
  const [deleting, setDeleting] = useState(false);

  const deleteAccount = useCallback(async (): Promise<DeleteAccountResult> => {
    if (!supabase) {
      return { error: 'Serviço de conta não configurado.' };
    }
    setDeleting(true);
    const response = await supabase.functions.invoke('delete-account');
    if (response.error) {
      setDeleting(false);
      return { error: 'Não foi possível excluir a conta. Tente novamente.' };
    }
    await cancelReminders();
    await clearHeartRateLocalData();
    await supabase.auth.signOut({ scope: 'local' });
    setDeleting(false);
    return { error: null };
  }, []);

  return { deleting, deleteAccount };
}
