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
import { authRedirectUrl } from '@/lib/authRedirect';
import { cancelReminders } from '@/lib/platform/reminders';
import { unregisterPushToken } from '@/lib/pushTokens';

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
  resetPassword: (email: string) => Promise<AuthResult>;
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
  if (text.includes('rate limit') || text.includes('too many') || text.includes('security purposes')) {
    return 'Muitas tentativas. Aguarde um instante e tente novamente.';
  }
  if (text.includes('password should be')) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  if (text.includes('invalid email') || text.includes('unable to validate email')) {
    return 'Informe um e-mail válido.';
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
        options: { data: { name }, emailRedirectTo: authRedirectUrl },
      });
      if (!error && data.user?.identities?.length === 0) {
        return { error: translateError('already registered'), needsConfirmation: false };
      }
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
    await unregisterPushToken();
    await cancelReminders();
    const { error } = await supabase.auth.signOut();
    return toResult(error);
  }, []);

  const resetPassword = useCallback(async (email: string): Promise<AuthResult> => {
    if (!supabase) {
      return notConfigured;
    }
    const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: authRedirectUrl });
    return toResult(error);
  }, []);

  const value = useMemo<SessionValue>(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      signIn,
      signUp,
      signOut,
      resetPassword,
    }),
    [session, loading, signIn, signUp, signOut, resetPassword],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
