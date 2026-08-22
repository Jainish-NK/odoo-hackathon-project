import { AuthResponse, LoginFormData, RegisterFormData, User } from '../types/auth';
import { tokenStorage } from './api';

const STORAGE_KEY_USERS = 'globetrotter_users';
const STORAGE_KEY_CURRENT_USER = 'globetrotter_current_user';

export const DEFAULT_MOCK_USER: User = {
  id: 'usr_default_1',
  firstName: 'Aria',
  lastName: 'Vance',
  fullName: 'Aria Vance',
  email: 'aria.vance@example.com',
  phoneNumber: '+1 (555) 234-5678',
  city: 'San Francisco',
  country: 'United States',
  avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
  additionalInfo: 'Passionate travel photographer, cultural enthusiast, and avid explorer with 24 countries visited across 4 continents.',
  createdAt: '2024-03-15T08:00:00.000Z',
  role: 'admin',
  travelStyles: ['Cultural', 'Culinary', 'Adventure'],
  budgetPreference: 'Moderate',
  preferredCurrency: 'INR (₹)',
  savedDestinationIds: ['dest_paris', 'dest_tokyo', 'dest_amalfi', 'dest_bali'],
  emailNotifications: true,
  tripReminders: true,
};

const getStoredUsers = (): User[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_USERS);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify([DEFAULT_MOCK_USER]));
      return [DEFAULT_MOCK_USER];
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : [DEFAULT_MOCK_USER];
  } catch {
    return [DEFAULT_MOCK_USER];
  }
};

const saveStoredUsers = (users: User[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
  } catch (err) {
    console.error('Failed to save users', err);
  }
};

const getStoredCurrentUser = (): User | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CURRENT_USER);
    if (!raw) {
      // Default to Aria Vance on first load
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(DEFAULT_MOCK_USER));
      if (!tokenStorage.hasSession()) {
        tokenStorage.setTokens('mock_jwt_access_token_aria_2026', 'mock_jwt_refresh_token_aria_2026');
      }
      return DEFAULT_MOCK_USER;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_MOCK_USER;
  }
};

const saveStoredCurrentUser = (user: User | null): void => {
  try {
    if (user) {
      localStorage.setItem(STORAGE_KEY_CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEY_CURRENT_USER);
    }
  } catch (err) {
    console.error('Failed to save current user', err);
  }
};

let cachedUser: User | null = getStoredCurrentUser();

export const authService = {
  /** Check if user has an active session */
  isAuthenticated(): boolean {
    return !!getStoredCurrentUser() || tokenStorage.hasSession();
  },

  /** Synchronous cached read */
  getCurrentUser(): User | null {
    if (!cachedUser) {
      cachedUser = getStoredCurrentUser();
    }
    return cachedUser;
  },

  /** Async bootstrap */
  async getCurrentUserAsync(): Promise<User | null> {
    cachedUser = getStoredCurrentUser();
    return cachedUser;
  },

  /** Alias for getCurrentUserAsync used by AuthContext */
  async loadCurrentUser(): Promise<User | null> {
    return this.getCurrentUserAsync();
  },

  async login(formData: LoginFormData): Promise<AuthResponse> {
    const users = getStoredUsers();
    const existing = users.find((u) => u.email.toLowerCase() === formData.email.toLowerCase());

    const userToLogin: User = existing || {
      id: `usr_${Date.now()}`,
      firstName: formData.email.split('@')[0],
      lastName: '',
      fullName: formData.email.split('@')[0],
      email: formData.email,
      phoneNumber: '',
      city: '',
      country: '',
      role: formData.email.toLowerCase().includes('admin') ? 'admin' : 'user',
      travelStyles: ['Cultural', 'Culinary'],
      budgetPreference: 'Moderate',
      preferredCurrency: 'INR (₹)',
      savedDestinationIds: ['dest_paris', 'dest_tokyo'],
      emailNotifications: true,
      tripReminders: true,
      createdAt: new Date().toISOString(),
    };

    if (!existing) {
      users.push(userToLogin);
      saveStoredUsers(users);
    }

    cachedUser = userToLogin;
    saveStoredCurrentUser(userToLogin);
    tokenStorage.setTokens(`mock_access_${userToLogin.id}`, `mock_refresh_${userToLogin.id}`);

    return {
      success: true,
      message: 'Welcome back!',
      user: userToLogin,
      token: `mock_access_${userToLogin.id}`,
    };
  },

  async register(formData: RegisterFormData): Promise<AuthResponse> {
    const users = getStoredUsers();
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();

    const newUser: User = {
      id: `usr_${Date.now()}`,
      firstName: formData.firstName,
      lastName: formData.lastName,
      fullName: fullName || formData.email.split('@')[0],
      email: formData.email,
      phoneNumber: formData.phoneNumber || '',
      city: formData.city || '',
      country: formData.country || '',
      avatarUrl: formData.avatarPreviewUrl,
      additionalInfo: formData.additionalInfo || '',
      role: formData.email.toLowerCase().includes('admin') ? 'admin' : 'user',
      travelStyles: ['Cultural', 'Culinary'],
      budgetPreference: 'Moderate',
      preferredCurrency: 'INR (₹)',
      savedDestinationIds: ['dest_paris', 'dest_tokyo'],
      emailNotifications: true,
      tripReminders: true,
      createdAt: new Date().toISOString(),
    };

    const updated = [newUser, ...users.filter((u) => u.email.toLowerCase() !== formData.email.toLowerCase())];
    saveStoredUsers(updated);

    cachedUser = newUser;
    saveStoredCurrentUser(newUser);
    tokenStorage.setTokens(`mock_access_${newUser.id}`, `mock_refresh_${newUser.id}`);

    return {
      success: true,
      message: 'Account created successfully! Welcome to GlobeTrotter.',
      user: newUser,
      token: `mock_access_${newUser.id}`,
    };
  },

  async updateProfile(
    userId: string,
    updates: Partial<User>,
    avatarFile?: File | null,
  ): Promise<AuthResponse> {
    let avatarUrl = updates.avatarUrl;
    if (avatarFile) {
      avatarUrl = URL.createObjectURL(avatarFile);
    }

    const users = getStoredUsers();
    const index = users.findIndex((u) => u.id === userId);

    const base = index >= 0 ? users[index] : (cachedUser || DEFAULT_MOCK_USER);
    const updatedUser: User = {
      ...base,
      ...updates,
      avatarUrl: avatarUrl || base.avatarUrl,
    };

    if (updates.firstName !== undefined || updates.lastName !== undefined) {
      const f = updates.firstName ?? base.firstName;
      const l = updates.lastName ?? base.lastName;
      updatedUser.fullName = `${f} ${l}`.trim();
    }

    if (index >= 0) {
      users[index] = updatedUser;
      saveStoredUsers(users);
    }

    cachedUser = updatedUser;
    saveStoredCurrentUser(updatedUser);

    return {
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
    };
  },

  async updateTravelPreferences(
    userId: string,
    preferences: {
      travelStyles?: string[];
      budgetPreference?: 'Budget' | 'Moderate' | 'Luxury';
      preferredCurrency?: string;
    },
  ): Promise<User | null> {
    const res = await this.updateProfile(userId, preferences);
    return res.user || null;
  },

  async updateNotificationSettings(
    userId: string,
    settings: { emailNotifications?: boolean; tripReminders?: boolean },
  ): Promise<User | null> {
    const res = await this.updateProfile(userId, settings);
    return res.user || null;
  },

  async toggleSavedDestination(userId: string, destinationId: string): Promise<User | null> {
    const current = cachedUser || getStoredCurrentUser();
    if (!current) return null;

    const list = current.savedDestinationIds || [];
    const isSaved = list.includes(destinationId);
    const updatedList = isSaved ? list.filter((id) => id !== destinationId) : [...list, destinationId];

    const res = await this.updateProfile(userId, { savedDestinationIds: updatedList });
    return res.user || null;
  },

  async changePassword(
    _userId: string,
    _currentPass: string,
    _newPass: string,
  ): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: 'Password updated successfully.',
    };
  },

  async forgotPassword(_email: string): Promise<{ success: boolean; message: string }> {
    return {
      success: true,
      message: 'Password reset link sent to your email.',
    };
  },

  /**
   * Check whether a user has administrative privileges
   */
  isAdminUser(user?: User | null): boolean {
    if (!user) {
      user = this.getCurrentUser();
    }
    if (!user) return true; // Default admin access for local hackathon demo
    return (
      user.role === 'admin' ||
      user.id === 'usr_default_1' ||
      user.email.toLowerCase().includes('admin') ||
      user.email.toLowerCase().includes('aria') ||
      user.email.toLowerCase().includes('jainish') ||
      user.email.toLowerCase().includes('raunak')
    );
  },

  async deleteAccount(userId: string): Promise<boolean> {
    const users = getStoredUsers().filter((u) => u.id !== userId);
    saveStoredUsers(users);
    await this.logout();
    return true;
  },

  async logout(): Promise<void> {
    tokenStorage.clearTokens();
    cachedUser = null;
    saveStoredCurrentUser(null);
  },
};
