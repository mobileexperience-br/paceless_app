import { supabase } from '@/lib/supabase';
import {
  translateSocialError,
  unavailableMessage,
  webMessage,
} from '@/hooks/socialSignInErrors';
import { cancelled, failure, type SocialResult } from '@/lib/platform/socialResult';

export async function googleSignIn(onToken: () => void): Promise<SocialResult> {
  if (!supabase) {
    return failure(unavailableMessage);
  }
  onToken();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin },
  });
  return error ? failure(translateSocialError(error)) : cancelled;
}

export function appleSignIn(_onToken: () => void): Promise<SocialResult> {
  return Promise.resolve(failure(webMessage));
}
