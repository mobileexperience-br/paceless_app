import { useCallback, useState } from 'react';
import { localToday } from '@/lib/planDates';
import { supabase } from '@/lib/supabase';

export interface GeneratePlanResult {
  error: string | null;
}

export interface UseGeneratePlan {
  generating: boolean;
  generate: (force?: boolean) => Promise<GeneratePlanResult>;
}

const regenerationError = 'Não foi possível atualizar seu plano. Tente novamente.';
const incompleteProfileError = 'Complete as configurações do plano para gerar seus treinos.';

function statusOf(error: unknown): number | null {
  if (typeof error !== 'object' || error === null || !('context' in error)) return null;
  return error.context instanceof Response ? error.context.status : null;
}

export function useGeneratePlan(): UseGeneratePlan {
  const [generating, setGenerating] = useState(false);

  const generate = useCallback(async (force = false): Promise<GeneratePlanResult> => {
    if (!supabase) return { error: regenerationError };
    setGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-plan', {
        body: { startDate: localToday(), force },
      });
      if (!response.error) return { error: null };
      return { error: statusOf(response.error) === 422 ? incompleteProfileError : regenerationError };
    } catch {
      return { error: regenerationError };
    } finally {
      setGenerating(false);
    }
  }, []);

  return { generating, generate };
}
