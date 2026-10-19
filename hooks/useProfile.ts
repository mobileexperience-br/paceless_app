import { useSession } from '@/hooks/useSession';

interface Profile {
  name: string | null;
  email: string | null;
}

function nonEmpty(value: unknown): string | null {
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

export function useProfile(): Profile {
  const { user } = useSession();
  return {
    name: nonEmpty(user?.user_metadata['name']),
    email: nonEmpty(user?.email),
  };
}
