import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
  Compass,
  Bell,
  Menu,
  X,
  LogOut,
  Sparkles,
  Plane,
  Bookmark,
  Plus,
  User as UserIcon,
} from 'lucide-react';
import { authService } from '../../services/authService';
import { User } from '../../types/auth';
import { useToast } from '../../context/ToastContext';

export const LandingNavbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
  }, [location.pathname]);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsProfileMenuOpen(false);
    showToast('info', 'Signed Out', 'You have been signed out successfully.');
    navigate('/');
  };

  const handleNotificationClick = () => {
    setIsNotificationsOpen((prev) => !prev);
    setIsProfileMenuOpen(false);
  };

  const handleMyTripsNav = () => {
    setIsMobileMenuOpen(false);
    const user = authService.getCurrentUser();
    if (!user) {
      showToast('info', 'Sign In Required', 'Please sign in to view your personal trips.');
      navigate('/login?redirect=/trips', { state: { from: '/trips' } });
      return;
    }
    navigate('/trips');
  };

  const handlePlanTripClick = () => {
    setIsMobileMenuOpen(false);
    const user = authService.getCurrentUser();
    if (user) {
      navigate('/trips/create');
    } else {
      showToast('info', 'Sign In Required', 'Please sign in to create and customize your trip.');
      navigate('/login?redirect=/trips/create', { state: { from: '/trips/create' } });
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFF9EE]/95 backdrop-blur-md border-b border-[#DAD4C7]/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group select-none">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#F4C95D] to-[#E3B443] flex items-center justify-center text-[#252525] shadow-xs shadow-[#F4C95D]/30 border border-white/70">
            <Compass className="w-4.5 h-4.5 transition-transform duration-500 group-hover:rotate-45" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#4E7360] rounded-full border border-[#FFF9EE] flex items-center justify-center">
              <Sparkles className="w-1 h-1 text-white" />
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[20px] font-serif font-bold tracking-tight text-[#252525] leading-tight">
              Globe<span className="text-[#C29326]">Trotter</span>
            </span>
          </div>
        </Link>

        {/* Center: Navigation Links (Desktop) */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            to="/"
            className={`text-[14px] font-medium transition-colors ${
              location.pathname === '/' || location.pathname === '/home'
                ? 'text-[#252525] font-semibold'
                : 'text-[#6F6A60] hover:text-[#252525]'
            }`}
          >
            Explore
          </Link>
          <Link
            to="/cities"
            className={`text-[14px] font-medium transition-colors ${
              location.pathname === '/cities'
                ? 'text-[#252525] font-semibold'
                : 'text-[#6F6A60] hover:text-[#252525]'
            }`}
          >
            Cities
          </Link>
          <Link
            to="/activities"
            className={`text-[14px] font-medium transition-colors ${
              location.pathname === '/activities'
                ? 'text-[#252525] font-semibold'
                : 'text-[#6F6A60] hover:text-[#252525]'
            }`}
          >
            Activities
          </Link>
          <button
            type="button"
            onClick={handleMyTripsNav}
            className={`text-[14px] font-medium transition-colors cursor-pointer ${
              location.pathname === '/trips'
                ? 'text-[#252525] font-semibold'
                : 'text-[#6F6A60] hover:text-[#252525]'
            }`}
          >
            My Trips
          </button>
        </nav>

        {/* Right: Actions (Plan Trip, Notifications & Profile) */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Quick "+ Plan a Trip" Button */}
          <button
            type="button"
            onClick={handlePlanTripClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F4C95D] hover:bg-[#E3B443] text-xs font-bold text-[#252525] transition-all shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" /> Plan a Trip
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={notifRef}>
            <button
              type="button"
              onClick={handleNotificationClick}
              aria-label="Notifications"
              className="p-2 text-[#6F6A60] hover:text-[#252525] hover:bg-black/5 rounded-xl transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E3B443] rounded-full border-2 border-[#FFF9EE]" />
            </button>

            {/* Notifications Popover */}
            {isNotificationsOpen && (
              <div
                className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#FFF9EE] border border-white/80 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
                style={{ boxShadow: '0 16px 36px -8px rgba(45, 37, 24, 0.18)' }}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DAD4C7]/60">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6F6A60]">Notifications</span>
                  <span className="text-[11px] font-semibold text-[#4E7360] bg-[#E7EFEA] px-2 py-0.5 rounded-full">New</span>
                </div>
                <div className="space-y-2.5">
                  <div className="flex items-start gap-2.5 text-xs">
                    <div className="p-1.5 bg-[#F4C95D]/20 rounded-lg text-[#C29326] mt-0.5 shrink-0">
                      <Plane className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#252525]">Kyoto Sakura Season Alert</p>
                      <p className="text-[#6F6A60] text-[11px] mt-0.5">Peak blossom dates updated for your upcoming bucket list.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-2.5 text-xs pt-2 border-t border-[#DAD4C7]/40">
                    <div className="p-1.5 bg-[#E7EFEA] rounded-lg text-[#4E7360] mt-0.5 shrink-0">
                      <Bookmark className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <p className="font-semibold text-[#252525]">Europe Explorer Itinerary Saved</p>
                      <p className="text-[#6F6A60] text-[11px] mt-0.5">5 destinations synced with your explorer account.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* User Profile / Auth Area */}
          {currentUser ? (
            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                className="flex items-center gap-2 p-1 pl-2.5 bg-white/70 hover:bg-white border border-[#DAD4C7]/80 rounded-full transition-all cursor-pointer shadow-2xs"
              >
                <span className="text-xs font-semibold text-[#252525] max-w-[100px] truncate hidden sm:inline">
                  {currentUser.firstName}
                </span>
                {currentUser.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.fullName}
                    className="w-7 h-7 rounded-full object-cover border border-white"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-[#E3B443]/30 text-[#252525] flex items-center justify-center font-bold text-xs">
                    {currentUser.firstName ? currentUser.firstName.charAt(0) : 'U'}
                  </div>
                )}
              </button>

              {/* Profile Dropdown */}
              {isProfileMenuOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-[#FFF9EE] border border-white/80 rounded-2xl shadow-xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                  style={{ boxShadow: '0 16px 36px -8px rgba(45, 37, 24, 0.18)' }}
                >
                  <div className="px-3 py-2 border-b border-[#DAD4C7]/60">
                    <p className="text-xs font-bold text-[#252525] truncate">{currentUser.fullName}</p>
                    <p className="text-[11px] text-[#6F6A60] truncate">{currentUser.email}</p>
                  </div>
                  <div className="py-1">
                    <button
                      type="button"
                      onClick={handleMyTripsNav}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-[#252525] hover:bg-black/5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Plane className="w-3.5 h-3.5 text-[#6F6A60]" /> My Saved Trips
                    </button>
                    <Link
                      to="/profile"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-[#252525] hover:bg-black/5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-[#6F6A60]" /> Profile & Settings
                    </Link>
                    <button
                      type="button"
                      onClick={handleLogout}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-[#D96B43] hover:bg-[#FAECE7] rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-3.5 py-1.5 text-xs font-semibold text-[#6F6A60] hover:text-[#252525] transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 text-xs font-semibold text-[#252525] bg-[#F4C95D] hover:bg-[#E3B443] rounded-xl shadow-xs transition-all"
              >
                Register
              </Link>
            </div>
          )}

          {/* Mobile Menu Toggle Button */}
          <button
            type="button"
            onClick={() => setIsMobileMenuOpen((prev) => !prev)}
            aria-label="Toggle menu"
            className="md:hidden p-2 text-[#6F6A60] hover:text-[#252525] rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Collapsible Navigation Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden px-4 pb-4 pt-2 border-t border-[#DAD4C7]/60 bg-[#FFF9EE] space-y-2 animate-in slide-in-from-top-2 duration-150">
          <Link
            to="/"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block w-full text-left px-3 py-2 text-sm font-medium text-[#252525] rounded-xl hover:bg-black/5"
          >
            Explore
          </Link>
          <Link
            to="/cities"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block w-full text-left px-3 py-2 text-sm font-medium text-[#252525] rounded-xl hover:bg-black/5"
          >
            Explore Cities
          </Link>
          <Link
            to="/activities"
            onClick={() => setIsMobileMenuOpen(false)}
            className="block w-full text-left px-3 py-2 text-sm font-medium text-[#252525] rounded-xl hover:bg-black/5"
          >
            Explore Activities
          </Link>
          <button
            type="button"
            onClick={handleMyTripsNav}
            className="w-full text-left px-3 py-2 text-sm font-medium text-[#6F6A60] rounded-xl hover:bg-black/5"
          >
            My Trips
          </button>
          <button
            type="button"
            onClick={handlePlanTripClick}
            className="w-full text-center py-2.5 text-xs font-bold text-[#252525] bg-[#F4C95D] hover:bg-[#E3B443] rounded-xl shadow-xs"
          >
            + Plan a New Trip
          </button>
          {!currentUser ? (
            <div className="pt-2 border-t border-[#DAD4C7]/60 flex gap-2">
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-semibold bg-white border border-[#DAD4C7] rounded-xl"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex-1 text-center py-2 text-xs font-semibold bg-[#F4C95D] text-[#252525] rounded-xl"
              >
                Register
              </Link>
            </div>
          ) : (
            <div className="pt-2 border-t border-[#DAD4C7]/60">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 text-xs font-semibold text-[#D96B43] hover:bg-[#FAECE7] rounded-xl flex items-center gap-2"
              >
                <LogOut className="w-4 h-4" /> Sign Out ({currentUser.firstName})
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
