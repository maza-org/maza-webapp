const brand = {
  primary: '#1EAAF1',
  primaryDark: '#0A84C8',
  secondary: '#F5C518',
  success: '#22C55E',
  error: '#EF4444',
  black: '#000000',
  white: '#FFFFFF',
};

export const lightColors = {
  ...brand,
  background: '#F8FAFC',
  card: '#FFFFFF',
  text: '#0F172A',
  textMuted: '#64748B',
  border: '#E2E8F0',
};

export const darkColors = {
  ...brand,
  background: '#0F172A',
  card: '#1E293B',
  text: '#F1F5F9',
  textMuted: '#94A3B8',
  border: '#334155',
};

// Default export (light) — kept for files that haven't switched to useTheme() yet
export const colors = lightColors;
