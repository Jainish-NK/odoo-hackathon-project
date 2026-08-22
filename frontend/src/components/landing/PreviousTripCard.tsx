import React from 'react';
import { Calendar, MapPin, ArrowRight, CheckCircle2 } from 'lucide-react';
import { PreviousTrip } from '../../types/landing';
import { useToast } from '../../context/ToastContext';

interface PreviousTripCardProps {
  trip: PreviousTrip;
  onViewTrip?: (trip: PreviousTrip) => void;
}

export const PreviousTripCard: React.FC<PreviousTripCardProps> = ({
  trip,
  onViewTrip,
}) => {
  const { showToast } = useToast();

  const handleView = () => {
    if (onViewTrip) {
      onViewTrip(trip);
    } else {
      showToast('info', trip.title, `Viewing saved itinerary for ${trip.destinationSummary}`);
    }
  };

  return (
    <div className="group bg-[#FFF9EE] border border-[#DAD4C7]/80 hover:border-[#E5B740] rounded-[22px] overflow-hidden shadow-xs hover:shadow-md transition-all duration-300 flex flex-col sm:flex-row">
      {/* Thumbnail */}
      <div className="relative w-full sm:w-48 h-40 sm:h-auto shrink-0 overflow-hidden bg-[#EFE7D5]">
        <img
          src={trip.image}
          alt={trip.title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold flex items-center gap-1">
          <CheckCircle2 className="w-3 h-3 text-[#4E7360]" />
          {trip.status}
        </span>
        <span className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded-md bg-[#FFF9EE]/90 backdrop-blur-xs text-[#252525] text-[11px] font-bold">
          {trip.durationDays} Days
        </span>
      </div>

      {/* Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#252525] group-hover:text-[#C29326] transition-colors leading-tight">
              {trip.title}
            </h3>
            {trip.budget && (
              <span className="text-[11px] font-semibold text-[#4E7360] bg-[#E7EFEA] px-2.5 py-0.5 rounded-full shrink-0">
                {trip.budget}
              </span>
            )}
          </div>

          <p className="text-xs text-[#6F6A60] mb-3 line-clamp-1">
            {trip.destinationSummary}
          </p>

          <div className="flex flex-wrap items-center gap-3 text-xs text-[#6F6A60]">
            <span className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-lg border border-[#DAD4C7]/60 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#C29326]" />
              {trip.startDate} – {trip.endDate}
            </span>

            <span className="flex items-center gap-1.5 bg-white/70 px-2.5 py-1 rounded-lg border border-[#DAD4C7]/60 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#4E7360]" />
              {trip.destinationsCount} Destinations
            </span>
          </div>
        </div>

        {/* Action button */}
        <div className="mt-4 pt-3 border-t border-[#DAD4C7]/50 flex items-center justify-between">
          <span className="text-[11px] text-[#8C867B]">Personalized Trip Plan</span>
          <button
            type="button"
            onClick={handleView}
            className="px-3.5 py-1.5 text-xs font-semibold text-[#252525] hover:text-[#C29326] bg-[#FCFAF5] hover:bg-[#F4C95D]/20 border border-[#DAD4C7] rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <span>View Trip</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
