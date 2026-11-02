import { useCallback, useState } from 'react';
import { localToday } from '@/lib/planDates';
import { supabase } from '@/lib/supabase';

export type GenerateCode = 'ok' | 'level_not_supported' | 'profile_incomplete' | 'failed';

export interface GeneratePlanResult {
  error: string | null;
  code: GenerateCode;
}

export interface UseGeneratePlan {
  generating: boolean;
  generate: (force?: boolean) => Promise<GeneratePlanResult>;
}

const regenerationError = 'Não foi possível atualizar seu plano. Tente novamente.';
const incompleteProfileError = 'Complete as configurações do plano para gerar seus treinos.';
const levelNotSupportedError = 'Seu plano ainda não está disponível para o seu nível.';

const okResult: GeneratePlanResult = { error: null, code: 'ok' };
const failedResult: GeneratePlanResult = { error: regenerationError, code: 'failed' };

async function errorCodeOf(error: unknown): Promise<string | null> {
  if (typeof error !== 'object' || error === null || !('context' in error)) return null;
  if (!(error.context instanceof Response)) return null;
  const body: unknown = await error.context.clone().json().catch(() => null);
  if (typeof body !== 'object' || body === null || !('error' in body)) return null;
  return typeof body.error === 'string' ? body.error : null;
}

function resultFor(code: string | null): GeneratePlanResult {
  if (code === 'level_not_supported') return { error: levelNotSupportedError, code: 'level_not_supported' };
  if (code === 'profile_incomplete') return { error: incompleteProfileError, code: 'profile_incomplete' };
  return failedResult;
}

export function useGeneratePlan(): UseGeneratePlan {
  const [generating, setGenerating] = useState(false);

  const generate = useCallback(async (force = false): Promise<GeneratePlanResult> => {
    if (!supabase) return failedResult;
    setGenerating(true);
    try {
      const response = await supabase.functions.invoke('generate-plan', {
        body: { startDate: localToday(), force },
      });
      if (!response.error) return okResult;
      return resultFor(await errorCodeOf(response.error));
    } catch {
      return failedResult;
    } finally {
      setGenerating(false);
    }
  }, []);

  return { generating, generate };
}
