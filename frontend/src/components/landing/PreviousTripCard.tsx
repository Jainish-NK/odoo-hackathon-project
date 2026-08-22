import React, { useState } from 'react';
import { Calendar, MapPin, ArrowRight, Clock } from 'lucide-react';
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
  const [imgSrc, setImgSrc] = useState(trip.image);

  const handleView = () => {
    if (onViewTrip) {
      onViewTrip(trip);
    } else {
      showToast('info', trip.title, `Viewing saved itinerary for ${trip.destinationSummary}`);
    }
  };

  const statusConfig = {
    Completed: {
      badge: 'bg-[#EFEBE3] text-[#6F6A60] border-[#DAD4C7]',
      dot: 'bg-[#8C867B]',
    },
    Upcoming: {
      badge: 'bg-[#FCFAF5] text-[#C29326] border-[#F4C95D]',
      dot: 'bg-[#C29326]',
    },
    Draft: {
      badge: 'bg-[#FAECE7] text-[#D96B43] border-[#F5D5CB]',
      dot: 'bg-[#D96B43]',
    },
  };

  const currentStatus = statusConfig[trip.status] || statusConfig.Upcoming;

  return (
    <div className="group bg-[#FFF9EE] border border-[#DAD4C7]/80 hover:border-[#E5B740] rounded-[24px] overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between hover:-translate-y-1">
      {/* 1. Card Cover Image */}
      <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-[#EFE7D5]">
        <img
          src={imgSrc}
          alt={trip.title}
          loading="lazy"
          onError={() =>
            setImgSrc(
              'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop'
            )
          }
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent pointer-events-none" />

        {/* Top Status Badge */}
        <div className="absolute top-3 left-3">
          <span
            className={`px-2.5 py-1 rounded-full text-[11px] font-bold backdrop-blur-md border shadow-xs flex items-center gap-1.5 ${currentStatus.badge}`}
          >
            <span className={`w-2 h-2 rounded-full ${currentStatus.dot}`} />
            {trip.status}
          </span>
        </div>

        {/* Top Right Duration Pill */}
        <div className="absolute top-3 right-3">
          <span className="px-2.5 py-1 rounded-xl bg-black/60 backdrop-blur-md text-white text-[11px] font-bold border border-white/20 shadow-xs flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#F4C95D]" />
            {trip.durationDays} {trip.durationDays === 1 ? 'Day' : 'Days'}
          </span>
        </div>

        {/* Bottom Destination Summary Overlay */}
        <div className="absolute bottom-3 left-3 right-3 text-white">
          <p className="text-xs font-semibold flex items-center gap-1 drop-shadow-xs truncate">
            <MapPin className="w-3.5 h-3.5 text-[#F4C95D] shrink-0" />
            <span className="truncate">{trip.destinationSummary}</span>
          </p>
        </div>
      </div>

      {/* 2. Card Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-2">
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#252525] group-hover:text-[#C29326] transition-colors leading-tight line-clamp-1 flex-1">
              {trip.title}
            </h3>
            {trip.budget && (
              <span className="text-xs font-bold text-[#4E7360] bg-[#E7EFEA] px-2.5 py-0.5 rounded-full border border-[#C2D7CC] shrink-0">
                {trip.budget}
              </span>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#6F6A60]">
            <span className="flex items-center gap-1 bg-[#FCFAF5] px-2.5 py-1 rounded-lg border border-[#DAD4C7]/60 font-medium">
              <Calendar className="w-3.5 h-3.5 text-[#C29326]" />
              {trip.startDate} – {trip.endDate}
            </span>

            <span className="flex items-center gap-1 bg-[#FCFAF5] px-2.5 py-1 rounded-lg border border-[#DAD4C7]/60 font-medium">
              <MapPin className="w-3.5 h-3.5 text-[#4E7360]" />
              {trip.destinationsCount}{' '}
              {trip.destinationsCount === 1 ? 'Destination' : 'Destinations'}
            </span>
          </div>
        </div>

        {/* 3. Bottom Action Bar */}
        <div className="pt-3 border-t border-[#DAD4C7]/60 flex items-center justify-between">
          <span className="text-[11px] text-[#8C867B] font-medium">Personalized Trip Plan</span>
          <button
            type="button"
            onClick={handleView}
            className="px-3.5 py-1.5 text-xs font-bold text-[#252525] hover:text-[#252525] bg-white hover:bg-[#F4C95D] border border-[#DAD4C7] hover:border-[#E5B740] rounded-xl transition-all flex items-center gap-1.5 shadow-2xs group/btn cursor-pointer"
          >
            <span>View Trip</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover/btn:translate-x-0.5" />
          </button>
        </div>
      </div>
    </div>
  );
};

