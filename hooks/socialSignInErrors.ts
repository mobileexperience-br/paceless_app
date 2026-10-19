export const unavailableMessage = 'Login social indisponível no momento.';
export const webMessage = 'Disponível no app.';
export const genericMessage = 'Não foi possível entrar. Tente novamente.';
export const networkMessage = 'Sem conexão. Tente novamente.';

export function hasCode(error: unknown): error is { code: string | number } {
  return typeof error === 'object' && error !== null && 'code' in error;
}

export function translateSocialError(error: unknown): string {
  const text = error instanceof Error ? error.message.toLowerCase() : '';
  if (text.includes('network') || text.includes('fetch')) {
    return networkMessage;
  }
  return genericMessage;
}
