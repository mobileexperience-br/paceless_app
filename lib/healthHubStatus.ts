import { dayLabel } from '@/lib/activityStats';
import type { DeviceConnection } from '@/lib/connectedDevices';

function pad(value: number): string {
  return String(value).padStart(2, '0');
}

export function clockLabel(date: Date): string {
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

export function connectionSubtitle(connection: DeviceConnection | null, now: Date): string {
  if (connection === null || connection.status === 'disconnected') return 'Desconectado';
  if (connection.status === 'error') return 'Permissão revogada. Conecte de novo.';
  if (connection.lastSyncAt === null) return 'Ainda não sincronizado';
  const day = dayLabel(connection.lastSyncAt, now);
  return `Conectado • Última sincronização: ${day} às ${clockLabel(connection.lastSyncAt)}`;
}

export function importedLabel(count: number): string {
  if (count === 0) return 'Nenhum treino novo nos últimos 30 dias.';
  return count === 1 ? '1 treino importado' : `${String(count)} treinos importados`;
}
