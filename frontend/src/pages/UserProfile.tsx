import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  User as UserIcon,
  Compass,
  Heart,
  Shield,
  Sparkles,
} from 'lucide-react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { Footer } from '../components/ui/Footer';
import { ProfileHeader } from '../components/profile/ProfileHeader';
import { PersonalInfoForm } from '../components/profile/PersonalInfoForm';
import { TravelPreferencesSection } from '../components/profile/TravelPreferencesSection';
import { SavedDestinationsSection } from '../components/profile/SavedDestinationsSection';
import { SecuritySettings } from '../components/profile/SecuritySettings';
import { DangerZoneModal } from '../components/profile/DangerZoneModal';
import { authService } from '../services/authService';
import { tripService, getTripStatus } from '../services/tripService';
import { User } from '../types/auth';
import { Trip } from '../types/trip';
import { useToast } from '../context/ToastContext';

type TabType = 'all' | 'personal' | 'preferences' | 'saved' | 'security';

export const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [isLoading, setIsLoading] = useState(true);

  // 1. Initial Load & Auth Check
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login?redirect=/profile', { state: { from: '/profile' }, replace: true });
      return;
    }
    setCurrentUser(user);

    // Fetch user trips for real calculated statistics
    const trips = tripService.getUserTrips(user.id);
    setUserTrips(trips);
    setIsLoading(false);
  }, [navigate, location.pathname]);

  // 2. Real-time Calculated Statistics
  const stats = useMemo(() => {
    let upcoming = 0;
    let completed = 0;

    userTrips.forEach((t) => {
      const s = getTripStatus(t.startDate, t.endDate);
      if (s === 'UPCOMING') upcoming++;
      else if (s === 'COMPLETED') completed++;
    });

    return {
      totalTrips: userTrips.length,
      upcomingTrips: upcoming,
      completedTrips: completed,
      savedDestinations: currentUser?.savedDestinationIds?.length || 0,
    };
  }, [userTrips, currentUser?.savedDestinationIds]);

  // 3. Avatar Change Handler
  const handleAvatarChange = async (_file: File | null, previewUrl?: string) => {
    if (!currentUser) return;
    const res = await authService.updateProfile(currentUser.id, {
      avatarUrl: previewUrl,
    });
    if (res.success && res.user) {
      setCurrentUser(res.user);
      showToast('success', 'Avatar Updated', 'Your profile picture has been changed.');
    }
  };

  // 4. Update Profile Details Handler
  const handleSaveProfile = async (updates: Partial<User>): Promise<boolean> => {
    if (!currentUser) return false;
    const res = await authService.updateProfile(currentUser.id, updates);
    if (res.success && res.user) {
      setCurrentUser(res.user);
      showToast('success', 'Profile Updated', res.message);
      return true;
    } else {
      showToast('error', 'Update Failed', res.message || 'Could not update profile.');
      return false;
    }
  };

  // 5. Change Password Handler
  const handlePasswordChange = async (currentPass: string, newPass: string): Promise<boolean> => {
    if (!currentUser) return false;
    const res = await authService.changePassword(currentUser.id, currentPass, newPass);
    if (res.success) {
      showToast('success', 'Password Changed', res.message);
      return true;
    } else {
      showToast('error', 'Error', res.message);
      return false;
    }
  };

  // 6. Remove Saved Destination Handler
  const handleRemoveSavedDestination = async (destinationId: string) => {
    if (!currentUser) return;
    const updatedUser = await authService.toggleSavedDestination(currentUser.id, destinationId);
    if (updatedUser) {
      setCurrentUser(updatedUser);
      showToast('info', 'Wishlist Updated', 'Destination removed from your saved list.');
    }
  };

  // 7. Sign Out Handler
  const handleSignOut = () => {
    authService.logout();
    showToast('info', 'Signed Out', 'You have been signed out successfully.');
    navigate('/');
  };

  // 8. Delete Account Handler
  const handleDeleteAccount = async () => {
    if (!currentUser) return;
    const success = await authService.deleteAccount(currentUser.id);
    if (success) {
      showToast('warning', 'Account Deleted', 'Your explorer account and travel data have been removed.');
      navigate('/');
    }
  };

  if (!currentUser && isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F1E5] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#F4C95D] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#6F6A60]">Loading profile dashboard...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#F7F1E5] text-[#252525] flex flex-col justify-between selection:bg-[#F4C95D]/40">
      {/* 1. Global Navigation Navbar */}
      <LandingNavbar />

      {/* 2. Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
        {/* Profile Header Card */}
        <ProfileHeader
          user={currentUser}
          onAvatarChange={handleAvatarChange}
          stats={stats}
        />

        {/* Navigation Tabs Pill Control */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 select-none">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'all'
                ? 'bg-[#252525] text-white shadow-xs'
                : 'bg-[#FFF9EE] hover:bg-white text-[#6F6A60] hover:text-[#252525] border border-[#DAD4C7]'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Overview & All Settings</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('personal')}
            className={`h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'personal'
                ? 'bg-[#252525] text-white shadow-xs'
                : 'bg-[#FFF9EE] hover:bg-white text-[#6F6A60] hover:text-[#252525] border border-[#DAD4C7]'
            }`}
          >
            <UserIcon className="w-3.5 h-3.5 text-[#C29326]" />
            <span>Personal Info</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('preferences')}
            className={`h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'preferences'
                ? 'bg-[#252525] text-white shadow-xs'
                : 'bg-[#FFF9EE] hover:bg-white text-[#6F6A60] hover:text-[#252525] border border-[#DAD4C7]'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-[#4E7360]" />
            <span>Travel Preferences</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'saved'
                ? 'bg-[#252525] text-white shadow-xs'
                : 'bg-[#FFF9EE] hover:bg-white text-[#6F6A60] hover:text-[#252525] border border-[#DAD4C7]'
            }`}
          >
            <Heart className="w-3.5 h-3.5 text-[#D96B43]" />
            <span>Saved Wishlist ({stats.savedDestinations})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('security')}
            className={`h-9 px-4 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer shrink-0 ${
              activeTab === 'security'
                ? 'bg-[#252525] text-white shadow-xs'
                : 'bg-[#FFF9EE] hover:bg-white text-[#6F6A60] hover:text-[#252525] border border-[#DAD4C7]'
            }`}
          >
            <Shield className="w-3.5 h-3.5 text-[#4E7360]" />
            <span>Security & Danger Zone</span>
          </button>
        </div>

        {/* 3. Settings Sections */}
        <div className="space-y-8">
          {/* Personal Information */}
          {(activeTab === 'all' || activeTab === 'personal') && (
            <PersonalInfoForm
              user={currentUser}
              onSave={handleSaveProfile}
            />
          )}

          {/* Travel Preferences */}
          {(activeTab === 'all' || activeTab === 'preferences') && (
            <TravelPreferencesSection
              user={currentUser}
              onSave={handleSaveProfile}
            />
          )}

          {/* Saved Destinations Wishlist */}
          {(activeTab === 'all' || activeTab === 'saved') && (
            <SavedDestinationsSection
              savedDestinationIds={currentUser.savedDestinationIds || []}
              onRemove={handleRemoveSavedDestination}
            />
          )}

          {/* Security & Password */}
          {(activeTab === 'all' || activeTab === 'security') && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <SecuritySettings onPasswordChange={handlePasswordChange} />
              <DangerZoneModal
                onDeleteAccount={handleDeleteAccount}
                onSignOut={handleSignOut}
              />
            </div>
          )}
        </div>
      </main>

      {/* 4. Universal Footer */}
      <Footer />
    </div>
  );
};
