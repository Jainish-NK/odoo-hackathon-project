import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Compass,
  LogOut,
  MapPin,
  Calendar,
  Sparkles,
  Plane,
  Heart,
  TrendingUp,
  User as UserIcon,
} from 'lucide-react';
import { authService } from '../services/authService';
import { User } from '../types/auth';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';

export const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      // If no active session, provide fallback default
      setCurrentUser({
        id: 'guest',
        firstName: 'Traveler',
        lastName: '',
        fullName: 'Fellow Explorer',
        email: 'explorer@globetrotter.com',
        phoneNumber: '+1 (555) 000-0000',
        city: 'Kyoto',
        country: 'Japan',
        createdAt: new Date().toISOString(),
        additionalInfo: 'Ready to embark on a new tailor-made adventure!',
      });
    } else {
      setCurrentUser(user);
    }
  }, []);

  const handleLogout = () => {
    authService.logout();
    showToast('info', 'Signed Out', 'You have been safely signed out.');
    navigate('/login');
  };

  if (!currentUser) return null;

  return (
    <div className="min-h-screen bg-[#F7F1E5] text-[#252525] flex flex-col justify-between">
      {/* Top Navbar */}
      <header className="border-b border-[#DAD4C7]/80 bg-[#FFF9EE]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#F4C95D] to-[#E3B443] flex items-center justify-center text-[#252525] shadow-md shadow-[#F4C95D]/20">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-serif font-bold text-[#252525]">
                Globe<span className="text-[#C29326]">Trotter</span>
              </span>
              <span className="hidden sm:inline-block ml-3 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-[#E7EFEA] text-[#334D40]">
                Explorer Hub
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <div className="flex items-center gap-2.5 bg-[#F7F1E5] px-3 py-1.5 rounded-full border border-[#DAD4C7]/60">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-7 h-7 rounded-full object-cover border border-white"
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-[#E3B443]/30 text-[#252525] flex items-center justify-center">
                  <UserIcon className="w-3.5 h-3.5" />
                </div>
              )}
              <span className="text-xs font-semibold text-[#252525] hidden sm:inline">
                {currentUser.firstName} {currentUser.lastName}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              leftIcon={<LogOut className="w-3.5 h-3.5 text-[#D96B43]" />}
            >
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      {/* Main Hero & Profile Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative rounded-[32px] overflow-hidden p-6 sm:p-10 bg-gradient-to-br from-[#FFF9EE] to-[#EFE7D5] border border-white shadow-xl shadow-[#252525]/5">
          <div className="relative z-10 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FCFAF5] border border-[#DAD4C7]/60 text-xs font-semibold text-[#C29326] mb-3">
              <Sparkles className="w-3.5 h-3.5" /> Authentication Verified
            </div>
            <h1 className="text-3xl sm:text-4xl font-serif font-extrabold text-[#252525] tracking-tight">
              Welcome aboard, {currentUser.firstName}!
            </h1>
            <p className="text-sm sm:text-base text-[#6F6A60] mt-2 leading-relaxed">
              Your personalized GlobeTrotter profile is ready. Discover tailor-made itineraries, hidden gems, and travel recommendations designed specifically for you.
            </p>
          </div>

          <div className="hidden lg:flex absolute right-12 top-1/2 -translate-y-1/2 w-48 h-48 rounded-full bg-gradient-to-tr from-[#F4C95D]/30 to-[#4E7360]/20 blur-2xl pointer-events-none" />
        </div>

        {/* Profile Card & Highlights Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* User Profile Card */}
          <div className="glass-card rounded-3xl p-6 border border-white/80 shadow-md">
            <div className="flex items-center gap-4 mb-5">
              {currentUser.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.fullName}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-white shadow-md"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#FFF9EE] border-2 border-[#DAD4C7] flex items-center justify-center text-[#6F6A60]">
                  <UserIcon className="w-8 h-8" />
                </div>
              )}
              <div>
                <h3 className="text-lg font-serif font-bold text-[#252525]">
                  {currentUser.firstName} {currentUser.lastName}
                </h3>
                <p className="text-xs text-[#6F6A60] flex items-center gap-1 mt-0.5">
                  <MapPin className="w-3.5 h-3.5 text-[#C29326]" />
                  {currentUser.city || 'City'}, {currentUser.country || 'Country'}
                </p>
              </div>
            </div>

            <div className="space-y-3 text-xs border-t border-[#DAD4C7]/60 pt-4">
              <div className="flex justify-between py-1">
                <span className="text-[#6F6A60]">Email</span>
                <span className="font-semibold text-[#252525] truncate max-w-[180px]">{currentUser.email}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#6F6A60]">Phone</span>
                <span className="font-semibold text-[#252525]">{currentUser.phoneNumber || 'Not provided'}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-[#6F6A60]">Explorer Status</span>
                <span className="font-semibold text-[#4E7360] bg-[#E7EFEA] px-2 py-0.5 rounded-full">
                  Verified Member
                </span>
              </div>
            </div>

            {currentUser.additionalInfo && (
              <div className="mt-4 pt-4 border-t border-[#DAD4C7]/60 bg-[#FCFAF5] p-3.5 rounded-2xl border">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#6F6A60] block mb-1">
                  Travel Bio / Preferences
                </span>
                <p className="text-xs text-[#252525] italic leading-relaxed">
                  "{currentUser.additionalInfo}"
                </p>
              </div>
            )}
          </div>

          {/* Quick Itinerary Discovery Preview */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-serif font-bold text-[#252525] flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#C29326]" /> Trending Itineraries For You
              </h3>
              <span className="text-xs font-semibold text-[#6F6A60]">Personalized AI recommendations</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Destination Card 1 */}
              <div className="rounded-2xl overflow-hidden bg-white/90 border border-[#DAD4C7]/70 shadow-sm hover:shadow-md transition-shadow group">
                <div
                  className="h-36 bg-cover bg-center relative"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=600&auto=format&fit=crop')`,
                  }}
                >
                  <span className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-[#D96B43]">
                    <Heart className="w-3.5 h-3.5" />
                  </span>
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold flex items-center gap-1">
                    <Calendar className="w-3 h-3 text-[#F4C95D]" /> 5 Days • Amalfi Coast
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-serif font-bold text-[#252525] group-hover:text-[#C29326] transition-colors">
                    Cliffside Villas & Coastal Walks
                  </h4>
                  <p className="text-xs text-[#6F6A60] mt-1">
                    Curated route featuring Positano, Ravello clifftop gardens, and lemon grove tasting.
                  </p>
                </div>
              </div>

              {/* Destination Card 2 */}
              <div className="rounded-2xl overflow-hidden bg-white/90 border border-[#DAD4C7]/70 shadow-sm hover:shadow-md transition-shadow group">
                <div
                  className="h-36 bg-cover bg-center relative"
                  style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?q=80&w=600&auto=format&fit=crop')`,
                  }}
                >
                  <span className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-sm text-[#D96B43]">
                    <Heart className="w-3.5 h-3.5" />
                  </span>
                  <span className="absolute bottom-3 left-3 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-semibold flex items-center gap-1">
                    <Plane className="w-3 h-3 text-[#F4C95D]" /> 7 Days • Kyoto & Nara
                  </span>
                </div>
                <div className="p-4">
                  <h4 className="font-serif font-bold text-[#252525] group-hover:text-[#C29326] transition-colors">
                    Bamboo Groves & Zen Temples
                  </h4>
                  <p className="text-xs text-[#6F6A60] mt-1">
                    Authentic tea ceremony, Fushimi Inari morning hike, and heritage ryokan stays.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DAD4C7]/80 bg-[#FFF9EE]/50 py-4 px-4 sm:px-8 text-center text-xs text-[#8C867B]">
        GlobeTrotter Personalized Travel Planning Platform • LDCE Ahmedabad Hackathon Edition
      </footer>
    </div>
  );
};
