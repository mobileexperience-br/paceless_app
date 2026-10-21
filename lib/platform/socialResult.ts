export interface SocialResult {
  error: string | null;
  signedIn: boolean;
}

export const cancelled: SocialResult = { error: null, signedIn: false };
export const done: SocialResult = { error: null, signedIn: true };

export function failure(error: string): SocialResult {
  return { error, signedIn: false };
}
