import {
  createContext,
  useCallback,
  useMemo,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { Dialog, type DialogAction, type DialogTone } from '@/components/dialog/Dialog';

export interface ConfirmOptions {
  title: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  icon?: ReactNode;
  tone?: DialogTone;
}

export interface AlertOptions {
  title: string;
  message?: string;
  okLabel?: string;
  icon?: ReactNode;
  tone?: DialogTone;
}

export interface DialogContextValue {
  confirm: (options: ConfirmOptions) => Promise<boolean>;
  alert: (options: AlertOptions) => Promise<void>;
}

interface DialogRequest {
  title: string;
  message?: string | undefined;
  icon?: ReactNode;
  tone?: DialogTone | undefined;
  actions: { label: string; variant: DialogAction['variant']; result: boolean }[];
  resolve: (result: boolean) => void;
}

export const DialogContext = createContext<DialogContextValue | null>(null);

export function DialogProvider({ children }: { children: ReactNode }): ReactElement {
  const queue = useRef<DialogRequest[]>([]);
  const active = useRef<DialogRequest | null>(null);
  const [shown, setShown] = useState<DialogRequest | null>(null);
  const [visible, setVisible] = useState(false);

  const showNext = useCallback((): void => {
    const next = queue.current.shift() ?? null;
    active.current = next;
    if (next) {
      setShown(next);
    }
    setVisible(next !== null);
  }, []);

  const enqueue = useCallback(
    (request: DialogRequest): void => {
      queue.current.push(request);
      if (!active.current) {
        showNext();
      }
    },
    [showNext],
  );

  const close = useCallback(
    (result: boolean): void => {
      const closing = active.current;
      if (!closing) {
        return;
      }
      closing.resolve(result);
      showNext();
    },
    [showNext],
  );

  const confirm = useCallback(
    (options: ConfirmOptions): Promise<boolean> =>
      new Promise((resolve) => {
        enqueue({
          title: options.title,
          message: options.message,
          icon: options.icon,
          tone: options.tone,
          actions: [
            {
              label: options.confirmLabel ?? 'Confirmar',
              variant: options.destructive ? 'danger' : 'primary',
              result: true,
            },
            { label: options.cancelLabel ?? 'Cancelar', variant: 'secondary', result: false },
          ],
          resolve,
        });
      }),
    [enqueue],
  );

  const alert = useCallback(
    (options: AlertOptions): Promise<void> =>
      new Promise((resolve) => {
        enqueue({
          title: options.title,
          message: options.message,
          icon: options.icon,
          tone: options.tone,
          actions: [{ label: options.okLabel ?? 'OK', variant: 'primary', result: true }],
          resolve: (): void => {
            resolve();
          },
        });
      }),
    [enqueue],
  );

  const value = useMemo<DialogContextValue>(() => ({ confirm, alert }), [confirm, alert]);

  return (
    <DialogContext.Provider value={value}>
      {children}
      <Dialog
        visible={visible}
        title={shown?.title ?? ''}
        message={shown?.message}
        icon={shown?.icon}
        tone={shown?.tone}
        actions={(shown?.actions ?? []).map((action) => ({
          label: action.label,
          variant: action.variant,
          onPress: (): void => {
            close(action.result);
          },
        }))}
        onDismiss={() => {
          close(false);
        }}
      />
    </DialogContext.Provider>
  );
}
