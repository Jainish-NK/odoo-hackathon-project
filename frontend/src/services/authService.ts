import { AuthResponse, LoginFormData, RegisterFormData, User } from '../types/auth';

const STORAGE_KEY_USER = 'globetrotter_current_user';
const STORAGE_KEY_USERS_DB = 'globetrotter_mock_users';

// Initialize default mock user if none exists
const initMockDB = (): User[] => {
  const existing = localStorage.getItem(STORAGE_KEY_USERS_DB);
  if (existing) {
    try {
      return JSON.parse(existing) as User[];
    } catch {
      // fallback
    }
  }

  const defaultUsers: User[] = [
    {
      id: 'usr_default_1',
      firstName: 'Aria',
      lastName: 'Vance',
      fullName: 'Aria Vance',
      email: 'aria.traveler@globetrotter.com',
      phoneNumber: '+1 (555) 234-5678',
      city: 'Barcelona',
      country: 'Spain',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      additionalInfo: 'Passionate solo traveler & food photographer. Loving Mediterranean sunsets and alpine hikes.',
      createdAt: new Date().toISOString(),
    },
  ];

  localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(defaultUsers));
  return defaultUsers;
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const authService = {
  /**
   * Mock User Login
   * Ready for future: POST /api/auth/login
   */
  async login(data: LoginFormData): Promise<AuthResponse> {
    await delay(750);
    const users = initMockDB();

    const normalizedEmail = data.email.trim().toLowerCase();
    const existingUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    // For mock testing: if password is less than 6 chars, fail
    if (data.password.length < 6) {
      return {
        success: false,
        message: 'Invalid password. Must be at least 6 characters.',
      };
    }

    if (!existingUser) {
      // Create a temporary session for any valid format login during hackathon testing
      const syntheticUser: User = {
        id: `usr_${Date.now()}`,
        firstName: normalizedEmail.split('@')[0].split('.')[0] || 'Traveler',
        lastName: 'Explorer',
        fullName: `${normalizedEmail.split('@')[0]}`,
        email: normalizedEmail,
        phoneNumber: '+1 (555) 000-0000',
        city: 'Kyoto',
        country: 'Japan',
        avatarUrl: undefined,
        additionalInfo: 'GlobeTrotter explorer discovering wonders across the globe.',
        createdAt: new Date().toISOString(),
      };
      
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(syntheticUser));
      return {
        success: true,
        message: 'Welcome back to GlobeTrotter!',
        user: syntheticUser,
        token: `mock_jwt_token_${Date.now()}`,
      };
    }

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(existingUser));
    return {
      success: true,
      message: `Welcome back, ${existingUser.firstName}!`,
      user: existingUser,
      token: `mock_jwt_token_${Date.now()}`,
    };
  },

  /**
   * Mock User Registration
   * Ready for future: POST /api/auth/register
   */
  async register(data: RegisterFormData): Promise<AuthResponse> {
    await delay(900);
    const users = initMockDB();

    const normalizedEmail = data.email.trim().toLowerCase();
    const existingUser = users.find((u) => u.email.toLowerCase() === normalizedEmail);

    if (existingUser) {
      return {
        success: false,
        message: 'An account with this email address already exists. Please sign in.',
      };
    }

    const newUser: User = {
      id: `usr_${Date.now()}`,
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
      fullName: `${data.firstName.trim()} ${data.lastName.trim()}`,
      email: normalizedEmail,
      phoneNumber: data.phoneNumber.trim(),
      city: data.city.trim(),
      country: data.country.trim(),
      avatarUrl: data.avatarPreviewUrl,
      additionalInfo: data.additionalInfo.trim(),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(newUser));

    return {
      success: true,
      message: 'Account created successfully! Welcome to GlobeTrotter.',
      user: newUser,
      token: `mock_jwt_token_${Date.now()}`,
    };
  },

  /**
   * Mock Forgot Password Request
   * Ready for future: POST /api/auth/forgot-password
   */
  async forgotPassword(email: string): Promise<AuthResponse> {
    await delay(600);
    return {
      success: true,
      message: `Password reset instructions have been sent to ${email}`,
    };
  },

  /**
   * Get Active Session User
   */
  getCurrentUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEY_USER);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as User;
    } catch {
      return null;
    }
  },

  /**
   * Logout User
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEY_USER);
  },
};
