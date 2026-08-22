import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  ArrowRight,
  Trash2,
  Layers,
} from 'lucide-react';
import { Trip, TripStatus } from '../../types/trip';
import {
  getTripStatus,
  formatDisplayDate,
  calculateTripDurationDays,
  calculateTotalBudget,
} from '../../services/tripService';

export interface TripCardProps {
  trip: Trip;
  onDelete: (trip: Trip) => void;
}

export const TripCard: React.FC<TripCardProps> = ({ trip, onDelete }) => {
  const [imgError, setImgError] = useState(false);
  const status: TripStatus = getTripStatus(trip.startDate, trip.endDate);
  const duration = calculateTripDurationDays(trip.startDate, trip.endDate);
  const totalBudget = trip.totalBudget ?? calculateTotalBudget(trip.sections);
  const sectionCount = trip.sections?.length || 0;

  // Primary image
  const primaryImage =
    trip.destinations?.[0]?.image ||
    'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop';

  const destinationCities = trip.destinations?.map((d) => d.city) || [];
  const destinationSummary =
    destinationCities.length > 0
      ? destinationCities.slice(0, 3).join(' • ') +
        (destinationCities.length > 3 ? ` +${destinationCities.length - 3} more` : '')
      : 'Flexible Route';

  // Status configuration
  const statusConfig = {
    ONGOING: {
      label: 'Currently Traveling',
      badgeClass: 'bg-[#E7EFEA] text-[#4E7360] border-[#C2D7CC]',
      dotClass: 'bg-[#4E7360] animate-pulse',
    },
    UPCOMING: {
      label: 'Upcoming',
      badgeClass: 'bg-[#FCFAF5] text-[#C29326] border-[#F4C95D]/60',
      dotClass: 'bg-[#C29326]',
    },
    COMPLETED: {
      label: 'Trip Completed',
      badgeClass: 'bg-[#EFEBE3] text-[#6F6A60] border-[#DAD4C7]',
      dotClass: 'bg-[#8C867B]',
    },
  };

  const currentStatusConfig = statusConfig[status];

  return (
    <div className="group relative bg-[#FFF9EE] rounded-[24px] border border-white/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden hover:-translate-y-1">
      {/* 1. Card Cover Image & Badges */}
      <div className="relative h-48 sm:h-52 w-full overflow-hidden bg-[#EFEBE3]">
        {!imgError ? (
          <img
            src={primaryImage}
            alt={trip.name}
            onError={() => setImgError(true)}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-[#F4C95D]/20 via-[#FFF9EE] to-[#4E7360]/20 flex flex-col items-center justify-center text-[#8C867B]">
            <MapPin className="w-8 h-8 mb-1 text-[#C29326]" />
            <span className="text-xs font-medium">GlobeTrotter Adventure</span>
          </div>
        )}

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/20 to-transparent pointer-events-none" />

        {/* Top Status & Delete Badges */}
        <div className="absolute top-3 inset-x-3 flex items-center justify-between pointer-events-none">
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold backdrop-blur-md border shadow-xs pointer-events-auto ${currentStatusConfig.badgeClass}`}
          >
            <span className={`w-2 h-2 rounded-full ${currentStatusConfig.dotClass}`} />
            {currentStatusConfig.label}
          </span>

          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(trip);
            }}
            aria-label={`Delete trip ${trip.name}`}
            className="p-2 rounded-full bg-black/40 hover:bg-[#FAECE7] text-white hover:text-[#D96B43] backdrop-blur-md transition-all duration-200 pointer-events-auto cursor-pointer shadow-xs"
            title="Delete trip"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Bottom Image Info: Destinations & Duration */}
        <div className="absolute bottom-3 inset-x-3 flex items-end justify-between text-white pointer-events-none">
          <div className="max-w-[70%]">
            <p className="text-[11px] font-medium text-[#FFF9EE]/90 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#F4C95D] shrink-0" />
              <span className="truncate">{destinationSummary}</span>
            </p>
          </div>

          <span className="px-2.5 py-1 rounded-lg bg-black/40 backdrop-blur-md text-[11px] font-bold text-[#FFF9EE] flex items-center gap-1 shrink-0 border border-white/20">
            <Clock className="w-3 h-3 text-[#F4C95D]" />
            {duration} {duration === 1 ? 'Day' : 'Days'}
          </span>
        </div>
      </div>

      {/* 2. Card Content Body */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          {/* Trip Name */}
          <h3 className="text-lg sm:text-[19px] font-serif font-bold text-[#252525] group-hover:text-[#C29326] transition-colors leading-snug line-clamp-1">
            {trip.name}
          </h3>

          {/* Date Range */}
          <div className="flex items-center gap-1.5 text-xs text-[#6F6A60]">
            <Calendar className="w-3.5 h-3.5 text-[#C29326] shrink-0" />
            <span>
              {formatDisplayDate(trip.startDate)} — {formatDisplayDate(trip.endDate)}
            </span>
          </div>

          {/* Notes / Description snippet if present */}
          {trip.notes && (
            <p className="text-xs text-[#8C867B] line-clamp-2 italic pt-0.5">
              "{trip.notes}"
            </p>
          )}
        </div>

        {/* 3. Metrics Summary Row (Stops, Budget) */}
        <div className="pt-3 border-t border-[#DAD4C7]/60 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-[#6F6A60]">
            <Layers className="w-3.5 h-3.5 text-[#4E7360]" />
            <span>
              <strong className="text-[#252525]">{sectionCount}</strong> {sectionCount === 1 ? 'Activity/Stop' : 'Activities/Stops'}
            </span>
          </div>

          <div className="text-right">
            <span className="text-[10px] uppercase font-semibold text-[#8C867B] block">
              Estimated Budget
            </span>
            <span className="font-bold text-[#252525] text-sm text-[#4E7360]">
              ₹{totalBudget.toLocaleString('en-IN')}
            </span>
          </div>
        </div>

        {/* 4. Action Button */}
        <div className="pt-2">
          <Link
            to={`/trips/${trip.id}/itinerary`}
            className="w-full inline-flex items-center justify-center gap-2 h-10 px-4 rounded-xl bg-[#FFF9EE] hover:bg-[#F4C95D] text-[#252525] font-semibold text-xs border border-[#DAD4C7] hover:border-[#E5B740] transition-all duration-200 shadow-2xs group/btn cursor-pointer"
          >
            <span>View Itinerary</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 group-hover/btn:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};
