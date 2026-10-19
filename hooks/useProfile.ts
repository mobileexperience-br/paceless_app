import { useCallback, useEffect, useState } from 'react';
import { useSession } from '@/hooks/useSession';
import { avatarPublicUrl } from '@/lib/avatar';
import { parseProfileRow } from '@/lib/profileRow';
import { supabase } from '@/lib/supabase';
import type { ProfileRow } from '@/types/database';

interface Profile {
  name: string | null;
  email: string | null;
  avatarUrl: string | null;
  profile: ProfileRow | null;
  loading: boolean;
  refresh: () => Promise<void>;
}

interface Loaded {
  userId: string;
  row: ProfileRow | null;
}

type Listener = (loaded: Loaded) => void;

const listeners = new Set<Listener>();

function nonEmpty(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

async function fetchProfile(userId: string): Promise<ProfileRow | null> {
  if (!supabase) return null;
  const result = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle();
  const raw: unknown = result.data;
  return parseProfileRow(raw);
}

export function useProfile(): Profile {
  const { user } = useSession();
  const userId = user?.id ?? null;
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    listeners.add(setLoaded);
    return (): void => {
      listeners.delete(setLoaded);
    };
  }, []);

  useEffect(() => {
    if (!userId) return;
    let active = true;
    void fetchProfile(userId).then((row) => {
      if (active) setLoaded({ userId, row });
    });
    return (): void => {
      active = false;
    };
  }, [userId]);

  const refresh = useCallback(async (): Promise<void> => {
    if (!userId) return;
    const next: Loaded = { userId, row: await fetchProfile(userId) };
    listeners.forEach((listener) => {
      listener(next);
    });
  }, [userId]);

  const current = loaded?.userId === userId ? loaded : null;
  const profile = current?.row ?? null;

  return {
    name: nonEmpty(profile?.name) ?? nonEmpty(user?.user_metadata['name']),
    email: nonEmpty(user?.email),
    avatarUrl: avatarPublicUrl(profile?.avatar_path ?? null),
    profile,
    loading: userId !== null && current === null,
    refresh,
  };
}
