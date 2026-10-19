import { useCallback, useEffect, useState } from 'react';
import type { Session, User } from '@supabase/supabase-js';
import { supabase } from '@/lib/supabase';

export interface AuthResult {
  error: string | null;
}

interface UseSession {
  session: Session | null;
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<AuthResult>;
  signUp: (name: string, email: string, password: string) => Promise<AuthResult>;
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

export function useSession(): UseSession {
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
    async (name: string, email: string, password: string): Promise<AuthResult> => {
      if (!supabase) {
        return notConfigured;
      }
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      return toResult(error);
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

  return { session, user: session?.user ?? null, loading, signIn, signUp, signOut };
}
