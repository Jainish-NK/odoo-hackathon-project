export interface LoginFormData {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface RegisterFormData {
  avatar?: File | null;
  avatarPreviewUrl?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  city: string;
  country: string;
  password: string;
  confirmPassword: string;
  additionalInfo: string;
}

export type FormErrors<T> = Partial<Record<keyof T, string>>;

export interface User {
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  email: string;
  phoneNumber: string;
  city: string;
  country: string;
  avatarUrl?: string;
  additionalInfo?: string;
  createdAt: string;
  role?: 'admin' | 'user';
  travelStyles?: string[];
  budgetPreference?: 'Budget' | 'Moderate' | 'Luxury';
  preferredCurrency?: string;
  savedDestinationIds?: string[];
  emailNotifications?: boolean;
  tripReminders?: boolean;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  type: ToastType;
  title: string;
  message: string;
  duration?: number;
}
