import { comboIdForDays, trainingDayCombos, type Weekday } from '@/lib/trainingDayCombos';

const reminderTitle = 'Hoje é dia de treino';

const reminderBodies = [
  'Seu treino de hoje está te esperando. No seu ritmo.',
  'Um passo de cada vez. Bora para o treino de hoje?',
  'Seu plano está pronto para hoje. Quando der, é só começar.',
];

const dayNames = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];

export function reminderMessage(day: Weekday): { title: string; body: string } {
  return { title: reminderTitle, body: reminderBodies[day % reminderBodies.length] ?? '' };
}

export function trainingDaysLabel(days: readonly Weekday[]): string {
  if (days.length === 0) return 'Nenhum dia definido';
  const comboId = comboIdForDays(days);
  const label = trainingDayCombos.find((combo) => combo.id === comboId)?.label;
  return label ?? days.map((day) => dayNames[day - 1] ?? '').join(', ');
}
