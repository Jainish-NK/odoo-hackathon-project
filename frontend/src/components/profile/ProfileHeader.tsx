import React, { useState } from 'react';
import {
  MapPin,
  Sparkles,
  Mail,
  Camera,
} from 'lucide-react';
import { User } from '../../types/auth';
import { AvatarUpload } from '../ui/AvatarUpload';

export interface ProfileHeaderProps {
  user: User;
  onAvatarChange: (file: File | null, previewUrl?: string) => void;
  stats: {
    totalTrips: number;
    upcomingTrips: number;
    completedTrips: number;
    savedDestinations: number;
  };
}

export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  onAvatarChange,
  stats,
}) => {
  const [isChangingAvatar, setIsChangingAvatar] = useState(false);

  // Derive year dynamically from createdAt without hardcoded fallback
  const joinYear = user.createdAt ? new Date(user.createdAt).getFullYear() : null;
  const memberSinceLabel = joinYear && !isNaN(joinYear) ? `Traveler since ${joinYear}` : 'GlobeTrotter Member';

  return (
    <div className="bg-gradient-to-br from-[#FFF9EE] via-[#FCFAF5] to-[#EFE7D5] border border-white/90 rounded-[28px] p-6 sm:p-8 shadow-sm relative overflow-hidden space-y-6">
      {/* Top Banner Row */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        {/* User Info Left: Avatar & Text */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 text-center sm:text-left">
          {/* Avatar Area */}
          <div className="shrink-0">
            {isChangingAvatar ? (
              <div className="p-3 bg-white rounded-3xl border border-[#DAD4C7] shadow-sm">
                <AvatarUpload
                  previewUrl={user.avatarUrl}
                  onChange={(file, preview) => {
                    onAvatarChange(file, preview);
                    setIsChangingAvatar(false);
                  }}
                />
                <button
                  type="button"
                  onClick={() => setIsChangingAvatar(false)}
                  className="mt-2 text-xs font-semibold text-[#8C867B] hover:text-[#252525] block mx-auto cursor-pointer"
                >
                  Done
                </button>
              </div>
            ) : (
              <div className="relative group">
                {user.avatarUrl ? (
                  <img
                    src={user.avatarUrl}
                    alt={user.fullName}
                    className="w-22 h-22 sm:w-26 sm:h-26 rounded-3xl object-cover border-3 border-white shadow-md shadow-[#252525]/10"
                  />
                ) : (
                  <div className="w-22 h-22 sm:w-26 sm:h-26 rounded-3xl bg-[#FFF9EE] border-2 border-[#DAD4C7] flex items-center justify-center text-[#6F6A60] font-serif font-bold text-2xl shadow-inner">
                    {user.firstName?.charAt(0) || 'U'}
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setIsChangingAvatar(true)}
                  aria-label="Change profile photo"
                  className="absolute bottom-0 right-0 p-2 bg-[#F4C95D] hover:bg-[#E3B443] text-[#252525] rounded-full border-2 border-white shadow-sm transition-all duration-200 hover:scale-110 cursor-pointer"
                  title="Change avatar"
                >
                  <Camera className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Text Description */}
          <div className="space-y-2">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EFEA] border border-[#C2D7CC] text-[11px] font-bold text-[#4E7360]">
                <Sparkles className="w-3 h-3" /> GlobeTrotter Explorer
              </span>
              <span className="text-xs font-medium text-[#6F6A60]">
                {memberSinceLabel}
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#252525] tracking-tight">
              {user.fullName || `${user.firstName} ${user.lastName}`}
            </h1>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 text-xs text-[#6F6A60]">
              <span className="flex items-center gap-1">
                <Mail className="w-3.5 h-3.5 text-[#C29326]" />
                {user.email}
              </span>
              {(user.city || user.country) && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#4E7360]" />
                  {user.city ? `${user.city}, ` : ''}{user.country || ''}
                </span>
              )}
            </div>

            {user.additionalInfo && (
              <p className="text-xs text-[#6F6A60] italic max-w-xl line-clamp-2 pt-0.5">
                "{user.additionalInfo}"
              </p>
            )}
          </div>
        </div>

        {/* Decorative blur backdrop (desktop) */}
        <div className="hidden lg:block absolute right-6 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full bg-[#F4C95D]/20 blur-3xl pointer-events-none" />
      </div>

      {/* Real-time Calculated Stat Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-4 border-t border-[#DAD4C7]/60">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3.5 border border-[#DAD4C7]/70 text-center space-y-0.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#8C867B] block">Total Trips</span>
          <span className="text-xl font-serif font-bold text-[#252525]">{stats.totalTrips}</span>
          <span className="text-[10px] text-[#6F6A60] block">Adventures</span>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3.5 border border-[#DAD4C7]/70 text-center space-y-0.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#C29326] block">Upcoming</span>
          <span className="text-xl font-serif font-bold text-[#C29326]">{stats.upcomingTrips}</span>
          <span className="text-[10px] text-[#6F6A60] block">Scheduled</span>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3.5 border border-[#DAD4C7]/70 text-center space-y-0.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#4E7360] block">Completed</span>
          <span className="text-xl font-serif font-bold text-[#4E7360]">{stats.completedTrips}</span>
          <span className="text-[10px] text-[#6F6A60] block">Past Journeys</span>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-3.5 border border-[#DAD4C7]/70 text-center space-y-0.5 shadow-2xs">
          <span className="text-[10px] uppercase font-bold text-[#D96B43] block">Wishlist</span>
          <span className="text-xl font-serif font-bold text-[#D96B43]">{stats.savedDestinations}</span>
          <span className="text-[10px] text-[#6F6A60] block">Saved Places</span>
        </div>
      </div>
    </div>
  );
};
