import { useMemo, type ReactElement } from 'react';
import { CircleHelp, Flag, Play, Trash2, type LucideIcon } from 'lucide-react-native';
import { useDialog } from '@/hooks/useDialog';
import { palettes, sizes } from '@/theme';

interface WorkoutDialogs {
  confirmDiscard: (onConfirm: () => void) => void;
  confirmStop: (onConfirm: () => void) => void;
  showGpsHelp: () => void;
  askResume: () => Promise<boolean>;
}

const gpsHelpMessage = [
  'Fique ao ar livre, com céu aberto, e aguarde alguns segundos até o sinal estabilizar.',
  'Mantenha a localização ativada e permita o acesso ao Paceless durante o treino.',
  'Se a distância parar de contar com a tela bloqueada, desative a economia de bateria para o Paceless.',
  'O ritmo atual aparece após 100 m ou 30 s de treino.',
].join('\n\n');

function renderIcon(Icon: LucideIcon): ReactElement {
  return <Icon size={sizes.iconMd} color={palettes.dark.onPrimary} strokeWidth={sizes.iconStroke} />;
}

export function useWorkoutDialogs(): WorkoutDialogs {
  const { confirm, alert } = useDialog();

  return useMemo(
    () => ({
      confirmDiscard: (onConfirm: () => void): void => {
        void confirm({
          title: 'Descartar treino?',
          message: 'O treino em andamento será descartado.',
          confirmLabel: 'Descartar',
          cancelLabel: 'Continuar',
          destructive: true,
          icon: renderIcon(Trash2),
          tone: 'dark',
        }).then((confirmed) => {
          if (confirmed) onConfirm();
        });
      },
      confirmStop: (onConfirm: () => void): void => {
        void confirm({
          title: 'Parar treino?',
          message: 'O treino será encerrado e salvo.',
          confirmLabel: 'Parar',
          cancelLabel: 'Continuar',
          icon: renderIcon(Flag),
          tone: 'dark',
        }).then((confirmed) => {
          if (confirmed) onConfirm();
        });
      },
      askResume: async (): Promise<boolean> => {
        const resume = await confirm({
          title: 'Retomar treino?',
          message: 'Você tem um treino em andamento que foi interrompido.',
          confirmLabel: 'Retomar treino',
          cancelLabel: 'Descartar',
          icon: renderIcon(Play),
          tone: 'dark',
        });
        if (resume) return true;
        const discard = await confirm({
          title: 'Descartar treino?',
          message: 'O treino interrompido será descartado e não poderá ser recuperado.',
          confirmLabel: 'Descartar',
          cancelLabel: 'Voltar',
          destructive: true,
          icon: renderIcon(Trash2),
          tone: 'dark',
        });
        return !discard;
      },
      showGpsHelp: (): void => {
        void alert({
          title: 'Ajuda com GPS',
          message: gpsHelpMessage,
          icon: renderIcon(CircleHelp),
          tone: 'dark',
        });
      },
    }),
    [confirm, alert],
  );
}
