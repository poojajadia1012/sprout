export function validatePassword(password: string): { valid: boolean; error: string | null } {
  if (password.length < 8) {
    return { valid: false, error: 'Password must be at least 8 characters.' };
  }
  if (!/[\d!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(password)) {
    return { valid: false, error: 'Password must contain at least one number or symbol.' };
  }
  return { valid: true, error: null };
}

export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}

export function validateName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length > 0 && trimmed.length <= 100;
}
