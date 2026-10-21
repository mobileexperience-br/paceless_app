import { useRouter } from 'expo-router';
import { useDialog } from '@/hooks/useDialog';
import { useFinishWorkout } from '@/hooks/useFinishWorkout';

interface WorkoutFinish {
  finishing: boolean;
  saving: boolean;
  finishWorkout: () => void;
}

export function useWorkoutFinish(options: Parameters<typeof useFinishWorkout>[0]): WorkoutFinish {
  const router = useRouter();
  const { alert } = useDialog();
  const { finishing, saving, finish } = useFinishWorkout(options);

  const finishWorkout = (): void => {
    void finish().then(async (outcome) => {
      if (outcome !== 'tooShort') return;
      await alert({
        title: 'Treino muito curto',
        message: 'Treinos com menos de 10 segundos não são salvos.',
        tone: 'dark',
      });
      router.back();
    });
  };

  return { finishing, saving, finishWorkout };
}
