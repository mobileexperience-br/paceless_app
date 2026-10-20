import { useCallback, useState } from 'react';
import { useProfile } from '@/hooks/useProfile';
import { useSession } from '@/hooks/useSession';
import {
  AvatarError,
  pickAvatar,
  removeAvatarFile,
  saveAvatarPath,
  uploadAvatar,
  type AvatarSource,
} from '@/lib/avatar';

interface UseAvatar {
  avatarUrl: string | null;
  uploading: boolean;
  error: string | null;
  pickAndUpload: (source: AvatarSource) => Promise<void>;
  remove: () => Promise<void>;
}

function messageFrom(error: unknown): string {
  return error instanceof AvatarError
    ? error.message
    : 'Não foi possível atualizar a foto. Tente novamente.';
}

export function useAvatar(): UseAvatar {
  const { user } = useSession();
  const { profile, avatarUrl, refresh } = useProfile();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const userId = user?.id ?? null;
  const currentPath = profile?.avatar_path ?? null;

  const pickAndUpload = useCallback(
    async (source: AvatarSource): Promise<void> => {
      if (!userId) return;
      setError(null);
      try {
        const uri = await pickAvatar(source);
        if (!uri) return;
        setUploading(true);
        const path = await uploadAvatar(userId, uri);
        try {
          await saveAvatarPath(userId, path);
        } catch (saveError) {
          await removeAvatarFile(path).catch(() => undefined);
          throw saveError;
        }
        if (currentPath) await removeAvatarFile(currentPath);
        await refresh();
      } catch (caught) {
        setError(messageFrom(caught));
      } finally {
        setUploading(false);
      }
    },
    [userId, currentPath, refresh],
  );

  const remove = useCallback(async (): Promise<void> => {
    if (!userId || !currentPath) return;
    setError(null);
    setUploading(true);
    try {
      await saveAvatarPath(userId, null);
      await removeAvatarFile(currentPath);
      await refresh();
    } catch (caught) {
      setError(messageFrom(caught));
    } finally {
      setUploading(false);
    }
  }, [userId, currentPath, refresh]);

  return { avatarUrl, uploading, error, pickAndUpload, remove };
}
