import type { ReactElement } from 'react';
import { useRouter } from 'expo-router';
import { Button } from '@/components/Button';
import { EmptyState } from '@/components/EmptyState';

interface ActivitiesEmptyProps {
  filter: string;
  allFilter: string;
  failed: boolean;
  onRetry: () => void;
}

const filteredTitles: Record<string, string> = {
  Corrida: 'Nenhuma corrida registrada',
  Caminhada: 'Nenhuma caminhada registrada',
  Musculação: 'Nenhum treino de musculação registrado',
};

export function ActivitiesEmpty({
  filter,
  allFilter,
  failed,
  onRetry,
}: ActivitiesEmptyProps): ReactElement {
  const router = useRouter();

  if (failed) {
    return (
      <EmptyState
        title="Não foi possível carregar seus treinos."
        description="Verifique sua conexão e tente novamente."
        action={<Button label="Tentar novamente" variant="secondary" onPress={onRetry} />}
      />
    );
  }

  if (filter !== allFilter) {
    return (
      <EmptyState
        title={filteredTitles[filter] ?? 'Nenhuma atividade registrada'}
        description="Inicie um treino para vê-lo aqui."
        action={
          <Button
            label="Iniciar treino"
            onPress={() => {
              router.push('/workout/atual');
            }}
          />
        }
      />
    );
  }

  return (
    <EmptyState
      title="Nenhuma atividade ainda"
      description="Seus treinos concluídos aparecem aqui."
    />
  );
}
