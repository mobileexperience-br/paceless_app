import type { Goal, IntervalStage, Tier, WeekKind } from './types.ts';

export const sessionTitles = {
  easy: 'Corrida leve',
  long: 'Corrida longa',
  intervals: 'Caminhada e corrida',
  tempo: 'Treino de ritmo',
  fartlek: 'Fartlek',
  strength: 'Fortalecimento',
} as const;

const planNames: Record<Goal, string> = {
  start_running: 'Comece a correr',
  run_5k: 'Rumo aos 5 km',
  run_10k: 'Rumo aos 10 km',
  fitness: 'Condicionamento',
};

export const planDescription = 'Plano montado por regras a partir das suas configurações de treino.';

export function formatDuration(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = seconds % 60;
  if (minutes === 0) return `${rest} s`;
  if (rest === 0) return `${minutes} min`;
  return `${minutes} min ${rest} s`;
}

export function planName(goal: Goal, tier: Tier): string {
  return tier === 'free' ? `${planNames[goal]} (2 semanas)` : planNames[goal];
}

export function weekTitle(week: number, kind: WeekKind): string {
  if (kind === 'recovery') return `Semana ${week} · Recuperação`;
  if (kind === 'taper') return `Semana ${week} · Polimento`;
  return `Semana ${week}`;
}

export function easyDescription(minutes: number): string {
  const run = formatDuration((minutes - 10) * 60);
  return `Aqueça caminhando 5 min. Corra leve por ${run}, em um ritmo em que você consiga conversar. Termine com 5 min de caminhada.`;
}

export function longDescription(minutes: number): string {
  const run = formatDuration((minutes - 10) * 60);
  return `Corrida mais longa da semana, sempre em ritmo leve. Aqueça caminhando 5 min, corra ${run} e desacelere caminhando 5 min.`;
}

export function intervalDescription(stage: IntervalStage): string {
  const run = formatDuration(stage.runSec);
  const walk = formatDuration(stage.walkSec);
  return `Comece caminhando 5 minutos. Alterne ${run} de corrida leve com ${walk} de caminhada, ${stage.reps} vezes. Termine com 5 minutos de caminhada.`;
}

export const tempoDescription =
  'Aqueça caminhando 10 min. Faça 3 blocos de 5 min em ritmo moderado, cada um seguido de 2 min leves. Termine com 5 min de caminhada.';

export const fartlekDescription =
  'Aqueça caminhando 10 min. Faça 6 tiros de 1 min rápidos, cada um seguido de 2 min leves. Termine com 5 min de caminhada.';

export function goalTitle(meters: number): string {
  return meters === 5000 ? 'Prova de 5 km' : 'Prova de 10 km';
}

export function goalDescription(meters: number): string {
  return `Aqueça caminhando 10 min. Corra ${meters / 1000} km no ritmo moderado. Termine com 5 min de caminhada.`;
}

export function strengthDescription(seconds: number): string {
  return `Faça 3 rodadas: agachamento 45 s, elevação de quadril 45 s, prancha 30 s, panturrilha 45 s e descanse 60 s. Duração total: ${formatDuration(seconds)}.`;
}
