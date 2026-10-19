const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateCredentials(email: string, password: string): string | null {
  if (!emailPattern.test(email.trim())) {
    return 'Informe um e-mail válido.';
  }
  if (password.length < 6) {
    return 'A senha deve ter pelo menos 6 caracteres.';
  }
  return null;
}

export function validateSignUp(name: string, email: string, password: string): string | null {
  if (name.trim().length === 0) {
    return 'Informe seu nome.';
  }
  return validateCredentials(email, password);
}
