/**
 * Validation utility functions for user input
 */

/**
 * Validates email format
 * @param email - Email string to validate
 * @returns true if email is valid, false otherwise
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validates full name has at least two parts (first name and surname)
 * @param fullName - Full name string to validate
 * @returns true if full name has at least 2 parts, false otherwise
 */
export function validateFullName(fullName: string): boolean {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  return parts.length >= 2;
}

/**
 * Validates and formats Mozambican phone numbers
 * Accepts formats: +258XXXXXXXXX, 258XXXXXXXXX, or XXXXXXXXX (9 digits)
 * @param phone - Phone number string to validate
 * @returns Formatted phone number with country code or null if invalid
 */
export function validateMozambicanPhone(phone: string): string | null {
  // Remove all spaces and special characters
  const cleaned = phone.replace(/[\s\-()]/g, '');

  // Check if it starts with +258 or 258
  if (cleaned.startsWith('+258')) {
    const number = cleaned.substring(4);
    // Mozambican numbers should have 9 digits after country code
    if (/^[0-9]{9}$/.test(number)) {
      return cleaned;
    }
  } else if (cleaned.startsWith('258')) {
    const number = cleaned.substring(3);
    if (/^[0-9]{9}$/.test(number)) {
      return '+' + cleaned;
    }
  } else if (/^[0-9]{9}$/.test(cleaned)) {
    // No country code, add it
    return '+258' + cleaned;
  }

  return null; // Invalid
}

/**
 * Validates Mozambican National ID format
 * Format: 12 digits followed by 1 letter (e.g., 110100987331S)
 * @param id - National ID string to validate
 * @returns true if ID is valid, false otherwise
 */
export function validateMozambicanID(id: string): boolean {
  // Mozambican ID format: XXXXXXXXXXS where X is digit and S is a letter
  // Total 13 characters: 12 digits + 1 letter
  const idRegex = /^[0-9]{12}[A-Z]$/;
  return idRegex.test(id.toUpperCase());
}

/**
 * Splits a full name into name, middlename, and surname components
 * @param input - Full name string to split
 * @returns Object with name, middlename (optional), and surname
 */
export function splitFullName(input: string): {
  name: string;
  middlename: string | undefined;
  surname: string;
} {
  const parts = input.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return { name: '', middlename: undefined, surname: '' };
  }

  if (parts.length === 1) {
    return { name: parts[0], middlename: undefined, surname: parts[0] };
  }

  if (parts.length === 2) {
    return { name: parts[0], middlename: undefined, surname: parts[1] };
  }

  const name = parts[0];
  const surname = parts[parts.length - 1];
  const middlename = parts.slice(1, -1).join(' ');

  return { name, middlename, surname };
}
