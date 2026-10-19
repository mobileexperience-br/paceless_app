import type { ReactElement } from 'react';
import { Redirect } from 'expo-router';
import { useSession } from '@/hooks/useSession';

export default function Index(): ReactElement | null {
  const { session, loading } = useSession();

  if (loading) {
    return null;
  }
  return <Redirect href={session ? '/(app)' : '/welcome'} />;
}
