import type { IntervalStage, Tier } from './types.ts';

export const sessionTitles = {
  easy: 'Corrida leve',
  intervals: 'Caminhada e corrida',
  strength: 'Fortalecimento',
} as const;

export const planDescription = 'Plano montado por regras a partir das suas configurações de treino.';

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${rest} s`;
  if (rest === 0) return `${minutes} min`;
  return `${minutes} min ${rest} s`;
}

export function planName(tier: Tier): string {
  return tier === 'free' ? 'Rumo aos 5 km (2 semanas)' : 'Rumo aos 5 km';
}

export function weekTitle(week: number): string {
  return `Semana ${week}`;
}

export function easyDescription(minutes: number): string {
  const run = formatDuration((minutes - 10) * 60);
  return `Aqueça caminhando 5 min. Corra leve por ${run}, em um ritmo em que você consiga conversar. Termine com 5 min de caminhada.`;
}

export function intervalDescription(stage: IntervalStage): string {
  const run = formatDuration(stage.runSec);
  const walk = formatDuration(stage.walkSec);
  return `Comece caminhando 5 minutos. Alterne ${run} de corrida leve com ${walk} de caminhada, ${stage.reps} vezes. Termine com 5 minutos de caminhada.`;
}

export function goalTitle(): string {
  return 'Corrida de 5 km';
}

export function goalDescription(meters: number): string {
  return `Aqueça caminhando 10 min. Corra ${meters / 1000} km em ritmo leve, sem se cobrar tempo. Se precisar, caminhe e retome. Termine com 5 min de caminhada.`;
}

export function strengthDescription(seconds: number): string {
  return `Faça 3 rodadas: agachamento 45 s, elevação de quadril 45 s, prancha 30 s, panturrilha 45 s e descanse 60 s. Duração total: ${formatDuration(seconds)}.`;
}
