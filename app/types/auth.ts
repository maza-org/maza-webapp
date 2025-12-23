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
  username: string;
  password: string;
  name: string;
  middlename: string;
  surname: string;
  email: string;
  phone: string;
  nationalID: string;
  dateOfBirth: string;
  gender: string;
  province: string;
  district: string;
  occupation: string;
  academicInstitution: string;
  academicLevel: string;
}

export interface ResetPasswordRequest {
  code: string;
  password: string;
  passwordConfirmation: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  password: string;
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
