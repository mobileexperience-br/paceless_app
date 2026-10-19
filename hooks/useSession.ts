import { useContext } from 'react';
import { SessionContext, type SessionValue } from '@/providers/SessionProvider';

export type { AuthResult, SignUpResult } from '@/providers/SessionProvider';

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) {
    throw new Error('useSession must be used within SessionProvider');
  }
  return value;
}
