export const MOZAMBIQUE_BI_MESSAGE = 'O BI deve ter 13 a 15 caracteres: 12 a 14 números seguidos de uma letra. Ex: 110100005003S.';

export function normalizeMozambiqueBI(value: string) {
  return value.replace(/[\s.-]/g, '').replace(/[^0-9A-Za-z]/g, '').toUpperCase();
}

export function isValidMozambiqueBI(value: string) {
  const normalized = normalizeMozambiqueBI(value);
  return !normalized || /^\d{12,14}[A-Z]$/.test(normalized);
}
