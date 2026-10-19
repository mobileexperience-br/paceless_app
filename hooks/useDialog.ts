import { useContext } from 'react';
import { DialogContext, type DialogContextValue } from '@/providers/DialogProvider';

export function useDialog(): DialogContextValue {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within DialogProvider');
  }
  return context;
}
