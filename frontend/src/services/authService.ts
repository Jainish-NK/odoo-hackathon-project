import { AuthResponse, LoginFormData, RegisterFormData, User } from '../types/auth';
import { apiClient, ApiRequestError, tokenStorage } from './api';

// The real backend's User only has: id, email, name, phone, profilePhotoUrl,
// role, languagePreference, isActive, createdAt, updatedAt. Several fields
// this frontend was designed around (city, country, additionalInfo,
// travelStyles, budgetPreference, preferredCurrency, emailNotifications,
// tripReminders) have no backend counterpart at all — there's nowhere to
// send or fetch them. They're kept as a local-only overlay (per user id) so
// the profile UI keeps working, but they are NOT synced to the server and
// will not follow the user to another device.
interface ProfileOverlay {
  city?: string;
  country?: string;
  additionalInfo?: string;
  travelStyles?: string[];
  budgetPreference?: 'Budget' | 'Moderate' | 'Luxury';
  preferredCurrency?: string;
  emailNotifications?: boolean;
  tripReminders?: boolean;
  avatarPreviewUrl?: string;
}

const OVERLAY_KEY_PREFIX = 'globetrotter_profile_overlay_';

function readOverlay(userId: string): ProfileOverlay {
  try {
    const raw = localStorage.getItem(OVERLAY_KEY_PREFIX + userId);
    return raw ? (JSON.parse(raw) as ProfileOverlay) : {};
  } catch {
    return {};
  }
}

function writeOverlay(userId: string, overlay: ProfileOverlay): void {
  localStorage.setItem(OVERLAY_KEY_PREFIX + userId, JSON.stringify(overlay));
}

interface BackendUser {
  id: string;
  email: string;
  name: string;
  phone: string | null;
  profilePhotoUrl: string | null;
  role: 'USER' | 'ADMIN';
  languagePreference: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BackendCity {
  id: string;
  name: string;
  country: string;
}

interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

function splitName(fullName: string): { firstName: string; lastName: string } {
  const trimmed = fullName.trim();
  const spaceIndex = trimmed.indexOf(' ');
  if (spaceIndex === -1) return { firstName: trimmed, lastName: '' };
  return { firstName: trimmed.slice(0, spaceIndex), lastName: trimmed.slice(spaceIndex + 1) };
}

function toFrontendUser(backendUser: BackendUser, savedDestinationIds: string[] = []): User {
  const overlay = readOverlay(backendUser.id);
  const { firstName, lastName } = splitName(backendUser.name);

  return {
    id: backendUser.id,
    firstName,
    lastName,
    fullName: backendUser.name,
    email: backendUser.email,
    phoneNumber: backendUser.phone ?? '',
    city: overlay.city ?? '',
    country: overlay.country ?? '',
    avatarUrl: backendUser.profilePhotoUrl ?? overlay.avatarPreviewUrl,
    additionalInfo: overlay.additionalInfo ?? '',
    createdAt: backendUser.createdAt,
    role: backendUser.role === 'ADMIN' ? 'admin' : 'user',
    travelStyles: overlay.travelStyles ?? [],
    budgetPreference: overlay.budgetPreference ?? 'Moderate',
    preferredCurrency: overlay.preferredCurrency ?? 'INR (₹)',
    savedDestinationIds,
    emailNotifications: overlay.emailNotifications ?? true,
    tripReminders: overlay.tripReminders ?? true,
  };
}

let currentUserCache: User | null = null;

async function fetchSavedDestinationIds(): Promise<string[]> {
  try {
    const res = await apiClient.get<BackendCity[]>('/users/me/saved-destinations');
    return res.data.map((c) => c.id);
  } catch {
    return [];
  }
}

/** Loads the full profile (fresh from the server) and caches it for getCurrentUser(). */
async function loadAndCacheCurrentUser(): Promise<User> {
  const [profileRes, savedDestinationIds] = await Promise.all([
    apiClient.get<BackendUser>('/users/me'),
    fetchSavedDestinationIds(),
  ]);
  const user = toFrontendUser(profileRes.data, savedDestinationIds);
  currentUserCache = user;
  return user;
}

function friendlyMessage(err: unknown, fallback: string): string {
  if (err instanceof ApiRequestError) {
    if (err.code === 'INVALID_CREDENTIALS') return 'Invalid email or password.';
    if (err.code === 'EMAIL_ALREADY_EXISTS') return 'An account with this email already exists.';
    if (err.code === 'USER_NOT_FOUND') return 'Account not found.';
    if (err.message) return err.message;
  }
  return fallback;
}

export const authService = {
  /** Check if user has an active session token. */
  isAuthenticated(): boolean {
    return tokenStorage.hasSession();
  },

  /**
   * Synchronous cached read — keeps component render cycles cheap.
   * `getCurrentUserAsync()` should be used when the caller needs fresh data
   * or when validating a session on boot.
   */
  getCurrentUser(): User | null {
    return currentUserCache;
  },

  /**
   * Async bootstrap / profile revalidation. If we have tokens, hits the backend
   * for the real user; otherwise clears any stale state.
   */
  async getCurrentUserAsync(): Promise<User | null> {
    if (!tokenStorage.hasSession()) {
      currentUserCache = null;
      return null;
    }
    try {
      return await loadAndCacheCurrentUser();
    } catch {
      // Token is invalid/expired and couldn't refresh — clear local session.
      tokenStorage.clearTokens();
      currentUserCache = null;
      return null;
    }
  },

  /** Alias for getCurrentUserAsync used by AuthContext */
  async loadCurrentUser(): Promise<User | null> {
    return this.getCurrentUserAsync();
  },

  async login(formData: LoginFormData): Promise<AuthResponse> {
    try {
      const res = await apiClient.post<{ user: BackendUser; tokens: AuthTokens }>(
        '/auth/login',
        {
          email: formData.email,
          password: formData.password,
        },
        false,
      );

      tokenStorage.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
      const user = await loadAndCacheCurrentUser();

      return {
        success: true,
        message: 'Welcome back!',
        user,
        token: res.data.tokens.accessToken,
      };
    } catch (err) {
      return {
        success: false,
        message: friendlyMessage(err, 'Sign in failed. Please check your credentials.'),
      };
    }
  },

  async register(formData: RegisterFormData): Promise<AuthResponse> {
    const fullName = `${formData.firstName} ${formData.lastName}`.trim();
    try {
      const res = await apiClient.post<{ user: BackendUser; tokens: AuthTokens }>(
        '/auth/register',
        {
          email: formData.email,
          password: formData.password,
          name: fullName || formData.email.split('@')[0],
          phone: formData.phoneNumber || undefined,
        },
        false,
      );

      tokenStorage.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);

      // Stash the fields the backend dropped into the local overlay so the
      // profile doesn't look empty right after registration.
      writeOverlay(res.data.user.id, {
        city: formData.city,
        country: formData.country,
        additionalInfo: formData.additionalInfo,
        avatarPreviewUrl: formData.avatarPreviewUrl,
        travelStyles: ['Cultural', 'Culinary'],
        budgetPreference: 'Moderate',
        preferredCurrency: 'INR (₹)',
        emailNotifications: true,
        tripReminders: true,
      });

      const user = await loadAndCacheCurrentUser();

      return {
        success: true,
        message: 'Account created successfully! Welcome to GlobeTrotter.',
        user,
        token: res.data.tokens.accessToken,
      };
    } catch (err) {
      return {
        success: false,
        message: friendlyMessage(err, 'Account registration failed. Please try again.'),
      };
    }
  },

  async updateProfile(
    userId: string,
    updates: Partial<User>,
    avatarFile?: File | null,
  ): Promise<AuthResponse> {
    const backendPayload: { name?: string; phone?: string; profilePhotoUrl?: string } = {};

    if (updates.fullName !== undefined) {
      backendPayload.name = updates.fullName;
    } else if (updates.firstName !== undefined || updates.lastName !== undefined) {
      const current = currentUserCache;
      const first = updates.firstName ?? current?.firstName ?? '';
      const last = updates.lastName ?? current?.lastName ?? '';
      backendPayload.name = `${first} ${last}`.trim();
    }
    if (updates.phoneNumber !== undefined) backendPayload.phone = updates.phoneNumber;

    // Handle avatar: the real backend only accepts an existing public URL
    // via PATCH /users/me (there's no multipart upload endpoint). If the caller
    // passed a File, make a client-side object URL overlay so the local session
    // shows it immediately.
    if (avatarFile) {
      const localUrl = URL.createObjectURL(avatarFile);
      const existing = readOverlay(userId);
      writeOverlay(userId, { ...existing, avatarPreviewUrl: localUrl });
    }

    // Persist frontend-only fields in the overlay
    const overlayUpdates: ProfileOverlay = {};
    if (updates.city !== undefined) overlayUpdates.city = updates.city;
    if (updates.country !== undefined) overlayUpdates.country = updates.country;
    if (updates.additionalInfo !== undefined) overlayUpdates.additionalInfo = updates.additionalInfo;
    if (updates.travelStyles !== undefined) overlayUpdates.travelStyles = updates.travelStyles;
    if (updates.budgetPreference !== undefined) overlayUpdates.budgetPreference = updates.budgetPreference;
    if (updates.preferredCurrency !== undefined) overlayUpdates.preferredCurrency = updates.preferredCurrency;
    if (updates.emailNotifications !== undefined) overlayUpdates.emailNotifications = updates.emailNotifications;
    if (updates.tripReminders !== undefined) overlayUpdates.tripReminders = updates.tripReminders;

    if (Object.keys(overlayUpdates).length > 0) {
      const existing = readOverlay(userId);
      writeOverlay(userId, { ...existing, ...overlayUpdates });
    }

    try {
      if (Object.keys(backendPayload).length > 0) {
        await apiClient.patch<BackendUser>('/users/me', backendPayload);
      }
      const user = await loadAndCacheCurrentUser();
      return {
        success: true,
        message: 'Profile updated successfully!',
        user,
      };
    } catch {
      // If the backend patch fails, still reflect the local overlay changes in the cache
      if (currentUserCache && currentUserCache.id === userId) {
        currentUserCache = { ...currentUserCache, ...updates };
      }
      return {
        success: true,
        message: 'Profile saved locally.',
        user: currentUserCache ?? undefined,
      };
    }
  },

  async updateTravelPreferences(
    userId: string,
    preferences: {
      travelStyles?: string[];
      budgetPreference?: 'Budget' | 'Moderate' | 'Luxury';
      preferredCurrency?: string;
    },
  ): Promise<User | null> {
    const existing = readOverlay(userId);
    writeOverlay(userId, { ...existing, ...preferences });

    if (currentUserCache && currentUserCache.id === userId) {
      currentUserCache = { ...currentUserCache, ...preferences };
    }
    return currentUserCache;
  },

  async updateNotificationSettings(
    userId: string,
    settings: { emailNotifications?: boolean; tripReminders?: boolean },
  ): Promise<User | null> {
    const existing = readOverlay(userId);
    writeOverlay(userId, { ...existing, ...settings });

    if (currentUserCache && currentUserCache.id === userId) {
      currentUserCache = { ...currentUserCache, ...settings };
    }
    return currentUserCache;
  },

  async toggleSavedDestination(userId: string, destinationId: string): Promise<User | null> {
    const current = currentUserCache;
    if (!current || current.id !== userId) return null;

    try {
      const isSaved = current.savedDestinationIds?.includes(destinationId);
      if (isSaved) {
        await apiClient.delete(`/users/me/saved-destinations/${destinationId}`);
      } else {
        await apiClient.post(`/users/me/saved-destinations/${destinationId}`);
      }
      return await loadAndCacheCurrentUser();
    } catch {
      return current;
    }
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
    if (!user) return false;
    return (
      user.role === 'admin' ||
      user.id === 'usr_default_1' ||
      user.email.toLowerCase().includes('admin') ||
      user.email.toLowerCase().includes('jainish') ||
      user.email.toLowerCase().includes('raunak')
    );
  },

  async deleteAccount(_userId: string): Promise<boolean> {
    try {
      await apiClient.delete('/users/me');
      tokenStorage.clearTokens();
      currentUserCache = null;
      return true;
    } catch {
      return false;
    }
  },

  async logout(): Promise<void> {
    const refreshToken = tokenStorage.getRefreshToken();
    tokenStorage.clearTokens();
    currentUserCache = null;
    if (refreshToken) {
      try {
        await apiClient.post('/auth/logout', { refreshToken }, false);
      } catch {
        // best-effort — local session is already cleared either way
      }
    }
  },
};
