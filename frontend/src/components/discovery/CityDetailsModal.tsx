import React from 'react';
import {
  Star,
  MapPin,
  Plus,
  Check,
  Sparkles,
  Compass,
  Clock,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Destination } from '../../types/landing';
import { allActivitiesList } from '../../data/tripSuggestions';
import { ActivityItem } from '../../types/trip';

export interface CityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  destination: Destination | null;
  onAddToTrip: (destination: Destination) => void;
  onSelectActivity?: (activity: ActivityItem) => void;
  isAddedToActiveTrip?: boolean;
}

export const CityDetailsModal: React.FC<CityDetailsModalProps> = ({
  isOpen,
  onClose,
  destination,
  onAddToTrip,
  onSelectActivity,
  isAddedToActiveTrip = false,
}) => {
  if (!destination) return null;

  // Filter activities that belong to this city
  const cityActivities = allActivitiesList.filter(
    (act) => act.city.toLowerCase() === destination.city.toLowerCase()
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={destination.city}
      subtitle={`${destination.country} • ${destination.region}`}
      maxWidth="lg"
    >
      <div className="space-y-6 pt-1">
        {/* Large Hero Image */}
        <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-[#EFE7D5] border border-[#DAD4C7]">
          <img
            src={destination.image}
            alt={destination.city}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3 text-white">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#F4C95D] text-[#252525] text-xs font-bold shadow-xs">
                  {destination.travelStyle}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-semibold">
                  {destination.priceLevel} Cost Level
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-serif font-bold tracking-tight">
                {destination.city}
              </h2>
              <p className="text-xs text-white/90 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F4C95D]" />
                {destination.country}, {destination.region}
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
              <Star className="w-4 h-4 fill-[#F4C95D] text-[#F4C95D]" />
              <span className="text-sm font-bold">{destination.rating.toFixed(1)}</span>
              <span className="text-xs text-white/80">({destination.reviewCount} reviews)</span>
            </div>
          </div>
        </div>

        {/* Overview & Highlights */}
        <div className="space-y-3">
          <h3 className="text-sm font-serif font-bold text-[#252525] flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-[#C29326]" /> Destination Highlight & Overview
          </h3>
          <p className="text-xs sm:text-sm text-[#48443E] leading-relaxed bg-[#FCFAF5] p-4 rounded-2xl border border-[#DAD4C7]/70">
            {destination.highlight}. Experience the unique ambiance, authentic regional culture, renowned architectural monuments, and breathtaking scenic vistas.
          </p>

          {/* Tag Badges */}
          {destination.tags && destination.tags.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {destination.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 rounded-xl bg-white border border-[#DAD4C7] text-xs font-medium text-[#252525] shadow-2xs"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Available Things To Do in this City */}
        {cityActivities.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-[#DAD4C7]/60">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-serif font-bold text-[#252525] flex items-center gap-1.5">
                <Compass className="w-4 h-4 text-[#4E7360]" /> Featured Things To Do in {destination.city} ({cityActivities.length})
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
              {cityActivities.map((act) => (
                <div
                  key={act.id}
                  className="flex items-center gap-3 p-2.5 bg-white rounded-2xl border border-[#DAD4C7]/70 hover:border-[#E5B740] transition-colors shadow-2xs group"
                >
                  <img
                    src={act.image}
                    alt={act.name}
                    className="w-14 h-14 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-bold text-[#252525] truncate group-hover:text-[#C29326] transition-colors">
                      {act.name}
                    </p>
                    <p className="text-[11px] text-[#6F6A60] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-[#8C867B]" /> {act.duration}
                    </p>
                    <p className="text-[11px] font-semibold text-[#4E7360] mt-0.5">
                      {act.estimatedCost}
                    </p>
                  </div>
                  {onSelectActivity && (
                    <button
                      type="button"
                      onClick={() => onSelectActivity(act)}
                      className="p-1.5 bg-[#F4C95D] hover:bg-[#E3B443] text-[#252525] rounded-xl text-xs font-bold shadow-2xs transition-transform hover:scale-105 cursor-pointer"
                      title="Add this activity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DAD4C7]/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              onAddToTrip(destination);
            }}
            leftIcon={isAddedToActiveTrip ? <Check className="w-4 h-4 text-[#4E7360]" /> : <Plus className="w-4 h-4" />}
            className={isAddedToActiveTrip ? 'bg-[#E7EFEA] text-[#4E7360] border border-[#C2D7CC]' : ''}
          >
            {isAddedToActiveTrip ? 'Already in Trip' : 'Add to My Trip'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
