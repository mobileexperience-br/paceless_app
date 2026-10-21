import { supabase } from '@/lib/supabase';
import {
  genericMessage,
  hasCode,
  translateSocialError,
  unavailableMessage,
} from '@/hooks/socialSignInErrors';
import { cancelled, done, failure, type SocialResult } from '@/lib/platform/socialResult';

export async function googleSignIn(onToken: () => void): Promise<SocialResult> {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;
  if (!supabase || !webClientId) {
    return failure(unavailableMessage);
  }
  const { GoogleSignin, isSuccessResponse, statusCodes } = await import(
    '@react-native-google-signin/google-signin'
  );
  GoogleSignin.configure({ webClientId, ...(iosClientId ? { iosClientId } : {}) });
  try {
    await GoogleSignin.hasPlayServices();
    const response = await GoogleSignin.signIn();
    if (!isSuccessResponse(response)) {
      return cancelled;
    }
    const token = response.data.idToken;
    if (!token) {
      return failure(genericMessage);
    }
    onToken();
    const { error } = await supabase.auth.signInWithIdToken({ provider: 'google', token });
    return error ? failure(translateSocialError(error)) : done;
  } catch (error) {
    if (hasCode(error) && error.code === statusCodes.SIGN_IN_CANCELLED) {
      return cancelled;
    }
    if (hasCode(error) && error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      return failure('Serviços do Google Play indisponíveis neste aparelho.');
    }
    return failure(translateSocialError(error));
  }
}

export async function appleSignIn(onToken: () => void): Promise<SocialResult> {
  if (!supabase) {
    return failure(unavailableMessage);
  }
  const AppleAuthentication = await import('expo-apple-authentication');
  const Crypto = await import('expo-crypto');
  if (!(await AppleAuthentication.isAvailableAsync())) {
    return failure(unavailableMessage);
  }
  try {
    const nonce = Crypto.randomUUID() + Crypto.randomUUID();
    const hashedNonce = await Crypto.digestStringAsync(
      Crypto.CryptoDigestAlgorithm.SHA256,
      nonce,
    );
    const credential = await AppleAuthentication.signInAsync({
      requestedScopes: [
        AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
        AppleAuthentication.AppleAuthenticationScope.EMAIL,
      ],
      nonce: hashedNonce,
    });
    if (!credential.identityToken) {
      return failure(genericMessage);
    }
    onToken();
    const { error } = await supabase.auth.signInWithIdToken({
      provider: 'apple',
      token: credential.identityToken,
      nonce,
    });
    if (error) {
      return failure(translateSocialError(error));
    }
    const fullName = [credential.fullName?.givenName, credential.fullName?.familyName]
      .filter((part): part is string => Boolean(part))
      .join(' ');
    if (fullName) {
      await supabase.auth.updateUser({ data: { name: fullName, full_name: fullName } });
    }
    return done;
  } catch (error) {
    if (hasCode(error) && error.code === 'ERR_REQUEST_CANCELED') {
      return cancelled;
    }
    return failure(translateSocialError(error));
  }
}
