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
      createdAt: '2026-01-15T10:00:00.000Z',
      travelStyles: ['Cultural', 'Culinary', 'Nature'],
      budgetPreference: 'Moderate',
      preferredCurrency: 'INR (₹)',
      savedDestinationIds: ['dest_paris', 'dest_kyoto', 'dest_amalfi'],
      emailNotifications: true,
      tripReminders: true,
    },
    {
      id: 'usr_traveler_2',
      firstName: 'Kenji',
      lastName: 'Sato',
      fullName: 'Kenji Sato',
      email: 'kenji.sato@globetrotter.com',
      phoneNumber: '+81 90-1234-5678',
      city: 'Tokyo',
      country: 'Japan',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
      additionalInfo: 'Architecture aficionado and culinary explorer across Asian metropolises.',
      createdAt: '2026-01-20T14:30:00.000Z',
      travelStyles: ['Cultural', 'Culinary'],
      budgetPreference: 'Luxury',
      preferredCurrency: 'INR (₹)',
      savedDestinationIds: ['dest_tokyo', 'dest_kyoto'],
      emailNotifications: true,
      tripReminders: true,
    },
    {
      id: 'usr_traveler_3',
      firstName: 'Elena',
      lastName: 'Rossi',
      fullName: 'Elena Rossi',
      email: 'elena.rossi@globetrotter.com',
      phoneNumber: '+39 06 698 12345',
      city: 'Rome',
      country: 'Italy',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
      additionalInfo: 'Art historian and coastal trail enthusiast.',
      createdAt: '2026-02-01T09:15:00.000Z',
      travelStyles: ['Cultural', 'Relaxation'],
      budgetPreference: 'Moderate',
      preferredCurrency: 'INR (₹)',
      savedDestinationIds: ['dest_rome', 'dest_amalfi', 'dest_florence'],
      emailNotifications: true,
      tripReminders: false,
    },
    {
      id: 'usr_traveler_4',
      firstName: 'Liam',
      lastName: 'Chen',
      fullName: 'Liam Chen',
      email: 'liam.chen@globetrotter.com',
      phoneNumber: '+1 (415) 888-9900',
      city: 'San Francisco',
      country: 'United States',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
      additionalInfo: 'Backpacker and landscape drone videographer.',
      createdAt: '2026-02-05T16:00:00.000Z',
      travelStyles: ['Adventure', 'Nature'],
      budgetPreference: 'Budget',
      preferredCurrency: 'INR (₹)',
      savedDestinationIds: ['dest_banff', 'dest_bali'],
      emailNotifications: false,
      tripReminders: true,
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
        travelStyles: ['Cultural', 'Nature'],
        budgetPreference: 'Moderate',
        preferredCurrency: 'INR (₹)',
        savedDestinationIds: ['dest_kyoto', 'dest_tokyo'],
        emailNotifications: true,
        tripReminders: true,
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
      travelStyles: ['Cultural', 'Adventure'],
      budgetPreference: 'Moderate',
      preferredCurrency: 'INR (₹)',
      savedDestinationIds: [],
      emailNotifications: true,
      tripReminders: true,
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
   * Update Profile Details
   */
  async updateProfile(userId: string, updates: Partial<User>): Promise<AuthResponse> {
    await delay(500);
    const users = initMockDB();
    const index = users.findIndex((u) => u.id === userId);
    
    // Fallback if editing default or active synthetic user
    const current = this.getCurrentUser();
    if (!current) {
      return { success: false, message: 'No active session found.' };
    }

    const updatedUser: User = {
      ...current,
      ...updates,
      id: current.id, // Preserve ID
      fullName: updates.firstName || updates.lastName
        ? `${(updates.firstName ?? current.firstName).trim()} ${(updates.lastName ?? current.lastName).trim()}`
        : current.fullName,
    };

    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));
    }

    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));

    return {
      success: true,
      message: 'Profile updated successfully!',
      user: updatedUser,
    };
  },

  /**
   * Change Password
   */
  async changePassword(_userId: string, currentPassword: string, newPassword: string): Promise<AuthResponse> {
    await delay(600);
    if (!currentPassword || currentPassword.length < 6) {
      return { success: false, message: 'Current password is incorrect.' };
    }
    if (!newPassword || newPassword.length < 6) {
      return { success: false, message: 'New password must be at least 6 characters long.' };
    }
    return {
      success: true,
      message: 'Your password has been changed securely.',
    };
  },

  /**
   * Toggle Saved Destination Wishlist
   */
  async toggleSavedDestination(userId: string, destinationId: string): Promise<User | null> {
    const current = this.getCurrentUser();
    if (!current || current.id !== userId) return null;

    const currentList = current.savedDestinationIds || [];
    const exists = currentList.includes(destinationId);
    const updatedList = exists
      ? currentList.filter((id) => id !== destinationId)
      : [...currentList, destinationId];

    const updatedUser: User = {
      ...current,
      savedDestinationIds: updatedList,
    };

    const users = initMockDB();
    const index = users.findIndex((u) => u.id === userId);
    if (index !== -1) {
      users[index] = updatedUser;
      localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(users));
    }
    localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(updatedUser));
    return updatedUser;
  },

  /**
   * Delete Account & Wipe Associated Data
   */
  async deleteAccount(userId: string): Promise<boolean> {
    await delay(700);
    const users = initMockDB();
    const filteredUsers = users.filter((u) => u.id !== userId);
    localStorage.setItem(STORAGE_KEY_USERS_DB, JSON.stringify(filteredUsers));

    // Remove user trips
    try {
      const STORAGE_KEY_TRIPS = 'globetrotter_user_trips_v2';
      const tripsRaw = localStorage.getItem(STORAGE_KEY_TRIPS);
      if (tripsRaw) {
        const trips = JSON.parse(tripsRaw);
        if (Array.isArray(trips)) {
          const userRemainingTrips = trips.filter((t: { userId?: string }) => t.userId !== userId);
          localStorage.setItem(STORAGE_KEY_TRIPS, JSON.stringify(userRemainingTrips));
        }
      }
    } catch {
      // ignore
    }

    localStorage.removeItem(STORAGE_KEY_USER);
    return true;
  },

  /**
   * Logout User
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEY_USER);
  },
};
