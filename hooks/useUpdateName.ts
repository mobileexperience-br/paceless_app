import { useCallback, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useSession } from '@/hooks/useSession';
import { supabase } from '@/lib/supabase';

const MIN_LENGTH = 2;
const MAX_LENGTH = 60;

interface UseUpdateName {
  saving: boolean;
  error: string | null;
  save: (value: string) => Promise<boolean>;
  clearError: () => void;
}

export function validateName(value: string): string | null {
  const length = value.trim().length;
  if (length < MIN_LENGTH || length > MAX_LENGTH) {
    return `O nome deve ter entre ${MIN_LENGTH.toString()} e ${MAX_LENGTH.toString()} caracteres.`;
  }
  return null;
}

export function useUpdateName(): UseUpdateName {
  const { user } = useSession();
  const { refresh } = useProfile();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = user?.id ?? null;

  const save = useCallback(
    async (value: string): Promise<boolean> => {
      const invalid = validateName(value);
      if (invalid) {
        setError(invalid);
        return false;
      }
      if (!supabase || !userId) {
        setError('Serviço não configurado.');
        return false;
      }
      const name = value.trim();
      setError(null);
      setSaving(true);
      const profileResult = await supabase.from('profiles').update({ name }).eq('id', userId);
      const metadataResult = profileResult.error
        ? null
        : await supabase.auth.updateUser({ data: { name } });
      setSaving(false);
      if (profileResult.error || metadataResult?.error) {
        setError('Não foi possível salvar o nome. Tente novamente.');
        return false;
      }
      await refresh();
      return true;
    },
    [userId, refresh],
  );

  const clearError = useCallback((): void => {
    setError(null);
  }, []);

  return { saving, error, save, clearError };
}
