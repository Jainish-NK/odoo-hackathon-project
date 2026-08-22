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
  Calendar as CalendarIcon,
  TrendingUp,
  Globe,
  Users,
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

  // Sync user state on route change or storage change
  useEffect(() => {
    setCurrentUser(authService.getCurrentUser());
  }, [location.pathname]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  // Close dropdowns on outside click or Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setIsProfileMenuOpen(false);
      }
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotificationsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsProfileMenuOpen(false);
        setIsNotificationsOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleLogout = () => {
    authService.logout();
    setCurrentUser(null);
    setIsProfileMenuOpen(false);
    setIsMobileMenuOpen(false);
    showToast('info', 'Signed Out', 'You have been signed out successfully.');
    navigate('/');
  };

  const handleNotificationClick = () => {
    setIsNotificationsOpen((prev) => !prev);
    setIsProfileMenuOpen(false);
  };

  const handlePlanTripClick = () => {
    setIsMobileMenuOpen(false);
    setIsProfileMenuOpen(false);
    const user = authService.getCurrentUser();
    if (user) {
      navigate('/trips/create');
    } else {
      showToast('info', 'Sign In Required', 'Please sign in to create and customize your trip.');
      navigate('/login?redirect=/trips/create', { state: { from: '/trips/create' } });
    }
  };

  const isCurrent = (path: string) => {
    if (path === '/' || path === '/home') {
      return location.pathname === '/' || location.pathname === '/home';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFF9EE]/95 backdrop-blur-md border-b border-[#DAD4C7]/80 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 h-18 flex items-center justify-between">
        {/* Left: Brand Logo */}
        <Link to="/" className="flex items-center gap-2.5 group select-none">
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#F4C95D] to-[#E3B443] flex items-center justify-center text-[#252525] shadow-xs shadow-[#F4C95D]/30 border border-white/70">
            <Compass className="w-5 h-5 transition-transform duration-500 group-hover:rotate-45" />
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
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <Link
            to="/"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isCurrent('/')
                ? 'bg-white text-[#252525] shadow-2xs border border-[#DAD4C7]/60'
                : 'text-[#6F6A60] hover:text-[#252525] hover:bg-black/5'
            }`}
          >
            Home
          </Link>
          <Link
            to="/cities"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isCurrent('/cities') || isCurrent('/destinations')
                ? 'bg-white text-[#252525] shadow-2xs border border-[#DAD4C7]/60'
                : 'text-[#6F6A60] hover:text-[#252525] hover:bg-black/5'
            }`}
          >
            Destinations
          </Link>
          <Link
            to="/activities"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isCurrent('/activities') || isCurrent('/experiences')
                ? 'bg-white text-[#252525] shadow-2xs border border-[#DAD4C7]/60'
                : 'text-[#6F6A60] hover:text-[#252525] hover:bg-black/5'
            }`}
          >
            Experiences
          </Link>
          <Link
            to="/trips"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isCurrent('/trips')
                ? 'bg-white text-[#252525] shadow-2xs border border-[#DAD4C7]/60'
                : 'text-[#6F6A60] hover:text-[#252525] hover:bg-black/5'
            }`}
          >
            My Trips
          </Link>
          <Link
            to="/calendar"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isCurrent('/calendar')
                ? 'bg-white text-[#252525] shadow-2xs border border-[#DAD4C7]/60'
                : 'text-[#6F6A60] hover:text-[#252525] hover:bg-black/5'
            }`}
          >
            Calendar
          </Link>
          <Link
            to="/community"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isCurrent('/community')
                ? 'bg-white text-[#252525] shadow-2xs border border-[#DAD4C7]/60'
                : 'text-[#6F6A60] hover:text-[#252525] hover:bg-black/5'
            }`}
          >
            Community
          </Link>
          <Link
            to="/insights"
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              isCurrent('/insights')
                ? 'bg-white text-[#252525] shadow-2xs border border-[#DAD4C7]/60'
                : 'text-[#6F6A60] hover:text-[#252525] hover:bg-black/5'
            }`}
          >
            Insights
          </Link>
        </nav>

        {/* Right: Actions (Plan Trip, Notifications & Profile) */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick "+ Plan a Trip" Button */}
          <button
            type="button"
            onClick={handlePlanTripClick}
            className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#F4C95D] hover:bg-[#E3B443] text-xs font-bold text-[#252525] transition-all shadow-xs cursor-pointer active:scale-95 border border-[#E3B443]/40"
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
              <Bell className="w-4.5 h-4.5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[#E3B443] rounded-full border-2 border-[#FFF9EE]" />
            </button>

            {/* Notifications Popover */}
            {isNotificationsOpen && (
              <div
                className="absolute right-0 mt-2 w-72 sm:w-80 bg-[#FFF9EE] border border-white/80 rounded-2xl shadow-xl p-4 z-50 animate-in fade-in zoom-in-95 duration-150"
                style={{ boxShadow: '0 16px 36px -8px rgba(45, 37, 24, 0.18)' }}
              >
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-[#DAD4C7]/60">
                  <span className="text-xs font-semibold uppercase tracking-wider text-[#6F6A60]">Travel Updates</span>
                  <span className="text-[11px] font-semibold text-[#4E7360] bg-[#E7EFEA] px-2 py-0.5 rounded-full">Active</span>
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
                      <p className="font-semibold text-[#252525]">Europe Explorer Itinerary Synced</p>
                      <p className="text-[#6F6A60] text-[11px] mt-0.5">Destinations and day budgets are verified.</p>
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
                className="flex items-center gap-2 p-1 pl-2.5 bg-white/80 hover:bg-white border border-[#DAD4C7] rounded-full transition-all cursor-pointer shadow-2xs"
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
                    <Link
                      to="/insights"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-bold text-[#4E7360] bg-[#E7EFEA]/70 hover:bg-[#E7EFEA] rounded-xl transition-colors flex items-center gap-2 cursor-pointer mb-1"
                    >
                      <TrendingUp className="w-3.5 h-3.5 text-[#4E7360]" /> Travel Insights
                    </Link>
                    <Link
                      to="/trips"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-[#252525] hover:bg-black/5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <Plane className="w-3.5 h-3.5 text-[#6F6A60]" /> My Saved Trips
                    </Link>
                    <Link
                      to="/calendar"
                      onClick={() => setIsProfileMenuOpen(false)}
                      className="w-full text-left px-3 py-2 text-xs font-medium text-[#252525] hover:bg-black/5 rounded-xl transition-colors flex items-center gap-2 cursor-pointer"
                    >
                      <CalendarIcon className="w-3.5 h-3.5 text-[#6F6A60]" /> Travel Calendar
                    </Link>
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
                className="px-3.5 py-1.5 text-xs font-semibold text-[#252525] bg-[#F4C95D] hover:bg-[#E3B443] rounded-xl shadow-xs transition-all border border-[#E3B443]/40"
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
            className="lg:hidden p-2 text-[#6F6A60] hover:text-[#252525] rounded-xl hover:bg-black/5 transition-colors cursor-pointer"
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Backdrop & Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-18 z-50 lg:hidden flex flex-col bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-[#FFF9EE] border-b border-[#DAD4C7] p-5 space-y-3 shadow-xl max-h-[calc(100vh-4.5rem)] overflow-y-auto">
            <Link
              to="/"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block w-full text-left px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                isCurrent('/') ? 'bg-[#F4C95D]/30 text-[#252525]' : 'text-[#6F6A60] hover:bg-black/5'
              }`}
            >
              Home
            </Link>
            <Link
              to="/cities"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block w-full text-left px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                isCurrent('/cities') ? 'bg-[#F4C95D]/30 text-[#252525]' : 'text-[#6F6A60] hover:bg-black/5'
              }`}
            >
              <Globe className="w-4 h-4 inline-block mr-2 text-[#C29326]" />
              Explore Destinations
            </Link>
            <Link
              to="/activities"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block w-full text-left px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                isCurrent('/activities') ? 'bg-[#F4C95D]/30 text-[#252525]' : 'text-[#6F6A60] hover:bg-black/5'
              }`}
            >
              <Sparkles className="w-4 h-4 inline-block mr-2 text-[#4E7360]" />
              Explore Experiences
            </Link>
            <Link
              to="/trips"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block w-full text-left px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                isCurrent('/trips') ? 'bg-[#F4C95D]/30 text-[#252525]' : 'text-[#6F6A60] hover:bg-black/5'
              }`}
            >
              <Plane className="w-4 h-4 inline-block mr-2 text-[#6F6A60]" />
              My Trips Portfolio
            </Link>
            <Link
              to="/calendar"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block w-full text-left px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                isCurrent('/calendar') ? 'bg-[#F4C95D]/30 text-[#252525]' : 'text-[#6F6A60] hover:bg-black/5'
              }`}
            >
              <CalendarIcon className="w-4 h-4 inline-block mr-2 text-[#C29326]" />
              Travel Calendar
            </Link>
            <Link
              to="/community"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block w-full text-left px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                isCurrent('/community') ? 'bg-[#F4C95D]/30 text-[#252525]' : 'text-[#6F6A60] hover:bg-black/5'
              }`}
            >
              <Users className="w-4 h-4 inline-block mr-2 text-[#D96B43]" />
              Community Stories
            </Link>
            <Link
              to="/insights"
              onClick={() => setIsMobileMenuOpen(false)}
              className={`block w-full text-left px-3.5 py-2.5 text-sm font-semibold rounded-xl transition-colors ${
                isCurrent('/insights') ? 'bg-[#F4C95D]/30 text-[#252525]' : 'text-[#6F6A60] hover:bg-black/5'
              }`}
            >
              <TrendingUp className="w-4 h-4 inline-block mr-2 text-[#4E7360]" />
              Travel Insights
            </Link>

            <div className="pt-2 border-t border-[#DAD4C7]/60 space-y-2">
              <button
                type="button"
                onClick={handlePlanTripClick}
                className="w-full text-center py-2.5 text-xs font-bold text-[#252525] bg-[#F4C95D] hover:bg-[#E3B443] rounded-xl shadow-xs"
              >
                + Plan a New Trip
              </button>

              {!currentUser ? (
                <div className="flex gap-2 pt-1">
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
                <div className="pt-1">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block w-full text-center py-2 text-xs font-semibold bg-white border border-[#DAD4C7] rounded-xl mb-2"
                  >
                    Profile & Settings ({currentUser.firstName})
                  </Link>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full text-left px-3 py-2 text-xs font-semibold text-[#D96B43] hover:bg-[#FAECE7] rounded-xl flex items-center justify-center gap-2"
                  >
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
          <div
            className="flex-1"
            onClick={() => setIsMobileMenuOpen(false)}
          />
        </div>
      )}
    </header>
  );
};
