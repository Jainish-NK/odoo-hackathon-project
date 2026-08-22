import React from 'react';
import { Trip } from '../../types/trip';
import { Calendar, MapPin, Clock, Wallet, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import { calculateTotalBudget } from '../../services/tripService';

interface TripSummaryProps {
  trip: Trip;
}

export const TripSummary: React.FC<TripSummaryProps> = ({ trip }) => {
  const totalBudget = trip.totalBudget ?? calculateTotalBudget(trip.sections);
  const startDate = new Date(trip.startDate);
  const endDate = new Date(trip.endDate);
  
  const formattedDates = `${startDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })} — ${endDate.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })}`;

  const daysCount = Math.max(
    1,
    Math.round((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)) + 1
  );

  return (
    <div
      className="glass-card rounded-[26px] p-6 sm:p-8 relative overflow-hidden shadow-md"
      style={{ boxShadow: '0 20px 45px -12px rgba(45, 37, 24, 0.12)' }}
    >
      {/* Decorative Golden Accent Line */}
      <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#F4C95D] to-transparent rounded-full" />

      {/* Header Row: Title & Autosave Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-5 border-b border-[#DAD4C7]/60">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EFEA] text-[#334D40] text-xs font-semibold mb-2">
            <Sparkles className="w-3 h-3 text-[#4E7360]" />
            <span>Active Itinerary</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#252525] tracking-tight">
            {trip.name}
          </h2>
          <div className="flex items-center gap-2 mt-1 text-xs text-[#6F6A60] font-medium">
            <Calendar className="w-3.5 h-3.5 text-[#C29326]" />
            <span>{formattedDates}</span>
          </div>
        </div>

        {/* Live sync indicator */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FFF9EE] border border-[#DAD4C7] text-xs font-medium text-[#4E7360] self-start sm:self-auto shadow-2xs">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#4E7360]" />
          <span>Autosaved locally</span>
        </div>
      </div>

      {/* Destinations Strip */}
      <div className="py-4 border-b border-[#DAD4C7]/50 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold text-[#6F6A60] uppercase tracking-wider flex items-center gap-1">
          <MapPin className="w-3.5 h-3.5 text-[#C29326]" /> Route:
        </span>
        {trip.destinations.map((dest, idx) => (
          <span
            key={dest.id || idx}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/80 border border-[#DAD4C7]/70 text-xs font-semibold text-[#252525]"
          >
            <span>{dest.flag}</span>
            <span>{dest.city}</span>
            <span className="text-[10px] text-[#6F6A60]">({dest.country})</span>
          </span>
        ))}
      </div>

      {/* Statistics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 pt-5">
        {/* Days */}
        <div className="bg-white/60 p-3.5 rounded-2xl border border-[#DAD4C7]/60">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6F6A60] flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-[#C29326]" /> Duration
          </p>
          <p className="text-lg font-serif font-bold text-[#252525] mt-1">
            {daysCount} <span className="text-xs font-sans font-normal text-[#6F6A60]">Days</span>
          </p>
        </div>

        {/* Destinations Count */}
        <div className="bg-white/60 p-3.5 rounded-2xl border border-[#DAD4C7]/60">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6F6A60] flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#4E7360]" /> Cities
          </p>
          <p className="text-lg font-serif font-bold text-[#252525] mt-1">
            {trip.destinations.length} <span className="text-xs font-sans font-normal text-[#6F6A60]">Destinations</span>
          </p>
        </div>

        {/* Sections Count */}
        <div className="bg-white/60 p-3.5 rounded-2xl border border-[#DAD4C7]/60">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#6F6A60] flex items-center gap-1">
            <Layers className="w-3.5 h-3.5 text-[#C29326]" /> Sections
          </p>
          <p className="text-lg font-serif font-bold text-[#252525] mt-1">
            {trip.sections.length} <span className="text-xs font-sans font-normal text-[#6F6A60]">Activities</span>
          </p>
        </div>

        {/* Total Estimated Budget */}
        <div className="bg-[#E7EFEA]/70 p-3.5 rounded-2xl border border-[#4E7360]/30">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-[#334D40] flex items-center gap-1">
            <Wallet className="w-3.5 h-3.5 text-[#4E7360]" /> Total Budget
          </p>
          <p className="text-lg font-serif font-bold text-[#334D40] mt-1">
            ₹{totalBudget.toLocaleString('en-IN')}
          </p>
        </div>
      </div>
    </div>
  );
};
