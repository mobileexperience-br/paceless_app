export type Weekday = 1 | 2 | 3 | 4 | 5 | 6 | 7;

export type TrainingDaysGroup = 'two' | 'three' | 'four' | 'five_plus';

interface TrainingDayCombo {
  id: string;
  group: TrainingDaysGroup;
  days: readonly Weekday[];
  label: string;
}

export const trainingDayCombos = [
  { id: 'two_tue_fri', group: 'two', days: [2, 5], label: 'Terça e sexta' },
  { id: 'two_mon_thu', group: 'two', days: [1, 4], label: 'Segunda e quinta' },
  { id: 'two_wed_sat', group: 'two', days: [3, 6], label: 'Quarta e sábado' },
  { id: 'three_tue_thu_sat', group: 'three', days: [2, 4, 6], label: 'Terça, quinta e sábado' },
  { id: 'three_wed_fri_sun', group: 'three', days: [3, 5, 7], label: 'Quarta, sexta e domingo' },
  { id: 'three_mon_wed_fri', group: 'three', days: [1, 3, 5], label: 'Segunda, quarta e sexta' },
  {
    id: 'four_mon_wed_fri_sun',
    group: 'four',
    days: [1, 3, 5, 7],
    label: 'Segunda, quarta, sexta e domingo',
  },
  {
    id: 'four_tue_wed_fri_sat',
    group: 'four',
    days: [2, 3, 5, 6],
    label: 'Terça, quarta, sexta e sábado',
  },
  {
    id: 'four_mon_tue_thu_sat',
    group: 'four',
    days: [1, 2, 4, 6],
    label: 'Segunda, terça, quinta e sábado',
  },
  {
    id: 'five_mon_tue_thu_fri_sat',
    group: 'five_plus',
    days: [1, 2, 4, 5, 6],
    label: 'Segunda, terça, quinta, sexta e sábado',
  },
  {
    id: 'five_tue_wed_fri_sat_sun',
    group: 'five_plus',
    days: [2, 3, 5, 6, 7],
    label: 'Terça, quarta, sexta, sábado e domingo',
  },
  {
    id: 'six_mon_to_sat',
    group: 'five_plus',
    days: [1, 2, 3, 4, 5, 6],
    label: 'Segunda a sábado',
  },
] as const satisfies readonly TrainingDayCombo[];

export type TrainingDayComboId = (typeof trainingDayCombos)[number]['id'];

export const trainingDayComboIds: readonly TrainingDayComboId[] = trainingDayCombos.map(
  (combo) => combo.id,
);

export function combosForGroup(group: string | undefined): readonly TrainingDayCombo[] {
  return trainingDayCombos.filter((combo) => combo.group === group);
}

export function trainingDaysFor(id: TrainingDayComboId): readonly Weekday[] {
  return trainingDayCombos.find((combo) => combo.id === id)?.days ?? [];
}

export function comboGroup(id: TrainingDayComboId): TrainingDaysGroup | null {
  return trainingDayCombos.find((combo) => combo.id === id)?.group ?? null;
}

export function comboIdForDays(days: readonly number[]): TrainingDayComboId | null {
  const found = trainingDayCombos.find(
    (combo) => combo.days.length === days.length && combo.days.every((day, i) => day === days[i]),
  );
  return found?.id ?? null;
}
