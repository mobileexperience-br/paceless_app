const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateEmail(email: string): string | null {
  return emailPattern.test(email.trim()) ? null : 'Informe um e-mail válido.';
}

export function validateCredentials(email: string, password: string): string | null {
  const invalidEmail = validateEmail(email);
  if (invalidEmail) {
    return invalidEmail;
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
