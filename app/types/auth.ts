export interface PhoneLoginRequest {
  phone: string;
}

export interface EmailLoginRequest {
  identifier: string;
  password: string;
}

export interface OtpVerificationRequest {
  phone: string;
  otp: string;
  otpId: string;
}

export interface CreateAccountRequest {
  name: string;
  surname: string;
  email: string;
  phone: string;
  password: string;
  birthDate: string;
  gender: string;
  identification: string;
  province: string;
  district: string;
  occupation: string;
  academicLevel: string;
  academicInstitution: string;
}

export interface ResetPasswordRequest {
  email: string;
  code: string;
  password: string;
  passwordConfirmation: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface OtpResponse {
  otpID: string;
  phone?: string;
}

export interface AuthError {
  message: string;
  status?: number;
}

export interface ValidationError {
  isValid: boolean;
  error?: string;
  formattedNumber?: string;
}

export interface FormFieldState {
  value: string;
  error?: string;
  touched: boolean;
}

export interface LoginFormState {
  phone: FormFieldState;
  email: FormFieldState;
  password: FormFieldState;
  isLoading: boolean;
  error?: string;
}

export interface SearchablePickerProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  placeholder?: string;
  error?: string;
}

export interface DatePickerState {
  show: boolean;
  value: Date;
}