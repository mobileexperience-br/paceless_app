import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface AuthResult {
  error: string | null;
}

export interface SignUpResult extends AuthResult {
  needsConfirmation: boolean;
}

export interface SessionValue {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (name: string, email: string, password: string) => Promise<SignUpResult>;
  signOut: () => Promise<AuthResult>;
}

const notConfigured: AuthResult = {
  error: 'Serviço de autenticação não configurado.',
};

function translateError(message: string): string {
  const text = message.toLowerCase();
  if (text.includes('invalid login credentials')) {
    return 'E-mail ou senha incorretos.';
  }
  if (text.includes('email not confirmed')) {
    return 'Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.';
  }
  if (text.includes('already registered')) {
    return 'Este e-mail já está cadastrado.';
  }
  if (text.includes('network') || text.includes('fetch')) {
    return 'Sem conexão. Tente novamente.';
  }
  return 'Não foi possível concluir. Tente novamente.';
}

function toResult(error: { message: string } | null): AuthResult {
  return { error: error ? translateError(error.message) : null };
}

export const SessionContext = createContext<SessionValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }): ReactElement {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(supabase !== null);

  useEffect(() => {
    if (!supabase) {
      return;
    }
    let active = true;
    void supabase.auth.getSession().then(({ data }) => {
      if (active) {
        setSession(data.session);
        setLoading(false);
      }
    });
    const { data } = supabase.auth.onAuthStateChange((_event, next): void => {
      setSession(next);
      setLoading(false);
    });
    return (): void => {
      active = false;
      data.subscription.unsubscribe();
    };
  }, []);

  const signIn = useCallback(async (email: string, password: string): Promise<AuthResult> => {
    if (!supabase) {
      return notConfigured;
    }
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return toResult(error);
  }, []);

  const signUp = useCallback(
    async (name: string, email: string, password: string): Promise<SignUpResult> => {
      if (!supabase) {
        return { ...notConfigured, needsConfirmation: false };
      }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      return {
        ...toResult(error),
        needsConfirmation: !error && data.user !== null && data.session === null,
      };
    },
    [],
  );

  const signOut = useCallback(async (): Promise<AuthResult> => {
    if (!supabase) {
      return notConfigured;
    }
    const { error } = await supabase.auth.signOut();
    return toResult(error);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({ session, user: session?.user ?? null, loading, signIn, signUp, signOut }),
    [session, loading, signIn, signUp, signOut],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
