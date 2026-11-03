import { useCallback, useState } from 'react';
import { track } from '@/lib/analytics';
import { templateVersionLabel } from '@/lib/analyticsRules';
import { isRecord } from '@/lib/activities';
import { errorCodeOf } from '@/lib/functionErrorCode';
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

function resultFor(code: string | null): GeneratePlanResult {
  if (code === 'level_not_supported') return { error: levelNotSupportedError, code: 'level_not_supported' };
  if (code === 'profile_incomplete') return { error: incompleteProfileError, code: 'profile_incomplete' };
  return failedResult;
}

function generatedSummary(body: unknown): { weeks: number; generatorVersion: unknown } | null {
  if (!isRecord(body) || body['status'] !== 'generated') return null;
  const weeks = body['weeks'];
  return typeof weeks === 'number' ? { weeks, generatorVersion: body['generatorVersion'] } : null;
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
      if (!response.error) {
        const body: unknown = response.data;
        const summary = generatedSummary(body);
        if (summary) {
          track('plan_created', { template_version: templateVersionLabel(summary.generatorVersion), duration_weeks: summary.weeks });
        }
        return okResult;
      }
      return resultFor(await errorCodeOf(response.error));
    } catch {
      return failedResult;
    } finally {
      setGenerating(false);
    }
  }, []);

  return { generating, generate };
}
