import { AuthResponse, LoginFormData, RegisterFormData, User } from '../types/auth';
import { apiClient, ApiRequestError, tokenStorage } from './api';

// The real backend's User only has: id, email, name, phone, profilePhotoUrl,
// role, languagePreference, isActive, createdAt, updatedAt. Several fields
// this frontend was designed around (city, country, additionalInfo,
// travelStyles, budgetPreference, preferredCurrency, emailNotifications,
// tripReminders) have no backend counterpart at all — there's nowhere to
// send or fetch them. They're kept as a local-only overlay (per user id) so
// the profile UI keeps working, but they are NOT synced to the server and
// will not follow the user to another device. This is a known gap, not a
// bug: closing it for real means adding those columns/endpoints server-side.
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

<<<<<<< HEAD
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
      role: 'admin',
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
=======
function writeOverlay(userId: string, overlay: ProfileOverlay): void {
  localStorage.setItem(OVERLAY_KEY_PREFIX + userId, JSON.stringify(overlay));
}
>>>>>>> 40f0140 (done)

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
    return err.message || fallback;
  }
  return fallback;
}

export const authService = {
  async login(data: LoginFormData): Promise<AuthResponse> {
    try {
      const res = await apiClient.post<{ user: BackendUser; tokens: AuthTokens }>(
        '/auth/login',
        { email: data.email, password: data.password },
        false,
      );
      tokenStorage.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);
      const savedDestinationIds = await fetchSavedDestinationIds();
      const user = toFrontendUser(res.data.user, savedDestinationIds);
      currentUserCache = user;
      return { success: true, message: `Welcome back, ${user.firstName}!`, user, token: res.data.tokens.accessToken };
    } catch (err) {
      return { success: false, message: friendlyMessage(err, 'Invalid email or password.') };
    }
  },

  async register(data: RegisterFormData): Promise<AuthResponse> {
    try {
      const name = `${data.firstName.trim()} ${data.lastName.trim()}`.trim();
      const res = await apiClient.post<{ user: BackendUser; tokens: AuthTokens }>(
        '/auth/register',
        { email: data.email, password: data.password, name },
        false,
      );
      tokenStorage.setTokens(res.data.tokens.accessToken, res.data.tokens.refreshToken);

      // Fields the backend supports beyond name/email get a follow-up PATCH;
      // everything else (city/country/additionalInfo) goes to the local overlay.
      if (data.phoneNumber.trim()) {
        try {
          await apiClient.patch('/users/me', { phone: data.phoneNumber.trim() });
        } catch {
          // non-fatal — registration itself already succeeded
        }
      }
      writeOverlay(res.data.user.id, {
        city: data.city.trim(),
        country: data.country.trim(),
        additionalInfo: data.additionalInfo.trim(),
        avatarPreviewUrl: data.avatarPreviewUrl,
        travelStyles: ['Cultural', 'Adventure'],
        budgetPreference: 'Moderate',
        preferredCurrency: 'INR (₹)',
        emailNotifications: true,
        tripReminders: true,
      });

      const user = toFrontendUser(
        { ...res.data.user, phone: data.phoneNumber.trim() || res.data.user.phone },
        [],
      );
      currentUserCache = user;
      return { success: true, message: 'Account created successfully! Welcome to GlobeTrotter.', user, token: res.data.tokens.accessToken };
    } catch (err) {
      return { success: false, message: friendlyMessage(err, 'Could not create your account.') };
    }
  },

  async forgotPassword(email: string): Promise<AuthResponse> {
    try {
      await apiClient.post('/auth/forgot-password', { email }, false);
      return { success: true, message: `If an account exists for ${email}, password reset instructions have been sent.` };
    } catch (err) {
      return { success: false, message: friendlyMessage(err, 'Could not process that request.') };
    }
  },

  /**
   * Synchronous session check for render-time gating (e.g. ProtectedRoute):
   * true only if we hold an access token. It does not guarantee the token
   * is still valid server-side — a stale/expired token still resolves
   * truthy here and is caught on the next real API call instead.
   */
  isAuthenticated(): boolean {
    return tokenStorage.hasSession();
  },

  /** Best-effort synchronous read of the last-loaded profile; null until loadCurrentUser() has resolved once. */
  getCurrentUser(): User | null {
    return currentUserCache;
  },

  /** Fetches the current profile from the server. Call this once on app load / after login. */
  async loadCurrentUser(): Promise<User | null> {
    if (!tokenStorage.hasSession()) return null;
    try {
      return await loadAndCacheCurrentUser();
    } catch {
      return null;
    }
  },

  async updateProfile(userId: string, updates: Partial<User>): Promise<AuthResponse> {
    try {
      const backendPatch: Record<string, unknown> = {};
      if (updates.firstName !== undefined || updates.lastName !== undefined) {
        const current = currentUserCache;
        const firstName = updates.firstName ?? current?.firstName ?? '';
        const lastName = updates.lastName ?? current?.lastName ?? '';
        backendPatch.name = `${firstName} ${lastName}`.trim();
      }
      if (updates.phoneNumber !== undefined) backendPatch.phone = updates.phoneNumber || null;
      if (updates.avatarUrl !== undefined) backendPatch.profilePhotoUrl = updates.avatarUrl || null;

      if (Object.keys(backendPatch).length > 0) {
        await apiClient.patch('/users/me', backendPatch);
      }

      const overlay = readOverlay(userId);
      const nextOverlay: ProfileOverlay = {
        ...overlay,
        ...(updates.city !== undefined ? { city: updates.city } : {}),
        ...(updates.country !== undefined ? { country: updates.country } : {}),
        ...(updates.additionalInfo !== undefined ? { additionalInfo: updates.additionalInfo } : {}),
        ...(updates.travelStyles !== undefined ? { travelStyles: updates.travelStyles } : {}),
        ...(updates.budgetPreference !== undefined ? { budgetPreference: updates.budgetPreference } : {}),
        ...(updates.preferredCurrency !== undefined ? { preferredCurrency: updates.preferredCurrency } : {}),
        ...(updates.emailNotifications !== undefined ? { emailNotifications: updates.emailNotifications } : {}),
        ...(updates.tripReminders !== undefined ? { tripReminders: updates.tripReminders } : {}),
      };
      writeOverlay(userId, nextOverlay);

      const user = await loadAndCacheCurrentUser();
      return { success: true, message: 'Profile updated successfully!', user };
    } catch (err) {
      return { success: false, message: friendlyMessage(err, 'Could not update your profile.') };
    }
  },

  async changePassword(_userId: string, _currentPassword: string, _newPassword: string): Promise<AuthResponse> {
    // The backend's password-change path is the token-based reset flow
    // (forgot-password → email a token → reset-password), not an
    // authenticated "current password" endpoint — there is no
    // PATCH /users/me/password on the API. Surfacing that honestly here
    // rather than pretending a call succeeded.
    return {
      success: false,
      message: 'Changing your password in-session isn\'t available yet — use "Forgot password" from the login page instead.',
    };
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

<<<<<<< HEAD
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
      user.email.toLowerCase().includes('jainish')
    );
  },

  /**
   * Logout User
   */
  logout(): void {
    localStorage.removeItem(STORAGE_KEY_USER);
=======
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
>>>>>>> 40f0140 (done)
  },
};
