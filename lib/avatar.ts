import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { supabase } from '@/lib/supabase';

const BUCKET = 'avatars';
const AVATAR_SIZE = 512;
const JPEG_QUALITY = 0.8;

export type AvatarSource = 'library' | 'camera';

export class AvatarError extends Error {}

export function avatarPublicUrl(path: string | null): string | null {
  if (!supabase || !path) return null;
  return supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl;
}

async function ensurePermission(source: AvatarSource): Promise<void> {
  if (Platform.OS === 'web') return;
  const response =
    source === 'camera'
      ? await ImagePicker.requestCameraPermissionsAsync()
      : await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (response.granted) return;
  const target = source === 'camera' ? 'à câmera' : 'às fotos';
  throw new AvatarError(`Permita o acesso ${target} nos ajustes do aparelho para continuar.`);
}

export async function pickAvatar(source: AvatarSource): Promise<string | null> {
  await ensurePermission(source);
  const options: ImagePicker.ImagePickerOptions = {
    mediaTypes: ['images'],
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  };
  const result =
    source === 'camera'
      ? await ImagePicker.launchCameraAsync(options)
      : await ImagePicker.launchImageLibraryAsync(options);
  if (result.canceled) return null;
  return result.assets[0]?.uri ?? null;
}

async function toJpegBuffer(uri: string): Promise<ArrayBuffer> {
  const context = ImageManipulator.manipulate(uri);
  context.resize({ width: AVATAR_SIZE });
  const image = await context.renderAsync();
  const saved = await image.saveAsync({ format: SaveFormat.JPEG, compress: JPEG_QUALITY });
  const response = await fetch(saved.uri);
  return response.arrayBuffer();
}

export async function uploadAvatar(userId: string, uri: string): Promise<string> {
  if (!supabase) throw new AvatarError('Serviço não configurado.');
  const buffer = await toJpegBuffer(uri);
  const path = `${userId}/${Date.now()}.jpg`;
  const { error } = await supabase.storage
    .from(BUCKET)
    .upload(path, buffer, { contentType: 'image/jpeg', upsert: true });
  if (error) throw new AvatarError('Não foi possível enviar a foto. Tente novamente.');
  return path;
}

export async function removeAvatarFile(path: string): Promise<void> {
  if (!supabase) return;
  await supabase.storage.from(BUCKET).remove([path]);
}

export async function saveAvatarPath(userId: string, path: string | null): Promise<void> {
  if (!supabase) throw new AvatarError('Serviço não configurado.');
  const { data, error } = await supabase
    .from('profiles')
    .update({ avatar_path: path })
    .eq('id', userId)
    .select('id');
  if (error || data.length === 0) throw new AvatarError('Não foi possível salvar a foto. Tente novamente.');
}
