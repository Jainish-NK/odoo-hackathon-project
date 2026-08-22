import React from 'react';
import { Link } from 'react-router-dom';
import {
  Heart,
  Star,
  Compass,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { mockDestinations } from '../../data/landingData';
import { Button } from '../ui/Button';

export interface SavedDestinationsSectionProps {
  savedDestinationIds: string[];
  onRemove: (destinationId: string) => void;
}

export const SavedDestinationsSection: React.FC<SavedDestinationsSectionProps> = ({
  savedDestinationIds,
  onRemove,
}) => {
  // Find matching destination objects from mock data
  const savedDestinations = mockDestinations.filter((d) =>
    savedDestinationIds.includes(d.id)
  );

  return (
    <div className="bg-[#FFF9EE] rounded-3xl border border-white/80 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="flex items-center justify-between pb-4 border-b border-[#DAD4C7]/60">
        <div>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#252525] flex items-center gap-2">
            <Heart className="w-5 h-5 text-[#D96B43] fill-[#D96B43]" /> Saved Destinations (Wishlist)
          </h2>
          <p className="text-xs text-[#6F6A60] mt-0.5">
            Destinations you've bookmarked for future travel itineraries.
          </p>
        </div>

        <span className="px-2.5 py-1 rounded-full bg-[#FAECE7] text-[#D96B43] text-xs font-bold">
          {savedDestinations.length} {savedDestinations.length === 1 ? 'Saved Place' : 'Saved Places'}
        </span>
      </div>

      {/* Grid or Empty State */}
      {savedDestinations.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#DAD4C7] p-8 text-center space-y-3 bg-[#FCFAF5]/50">
          <div className="w-12 h-12 rounded-2xl bg-[#FAECE7] text-[#D96B43] flex items-center justify-center mx-auto">
            <Heart className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-serif font-bold text-sm sm:text-base text-[#252525]">
              No saved destinations yet
            </h3>
            <p className="text-xs text-[#6F6A60] max-w-sm mx-auto">
              Save destinations you love while exploring the world, and plan adventures when you're ready.
            </p>
          </div>
          <div className="pt-2">
            <Link to="/#top-destinations">
              <Button variant="outline" size="sm" leftIcon={<Compass className="w-3.5 h-3.5" />}>
                Explore Destinations
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {savedDestinations.map((dest) => (
            <div
              key={dest.id}
              className="group relative bg-white/90 rounded-2xl border border-[#DAD4C7]/80 overflow-hidden shadow-2xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
            >
              {/* Image & Overlay */}
              <div className="relative h-36 w-full overflow-hidden bg-[#EFEBE3]">
                <img
                  src={dest.image}
                  alt={dest.city}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />

                {/* Remove Wishlist Button */}
                <button
                  type="button"
                  onClick={() => onRemove(dest.id)}
                  aria-label={`Remove ${dest.city} from saved destinations`}
                  className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/85 hover:bg-[#FAECE7] text-[#D96B43] shadow-xs transition-transform duration-200 hover:scale-110 cursor-pointer"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>

                {/* Rating Badge */}
                <div className="absolute bottom-2.5 left-2.5 flex items-center gap-1 px-2 py-0.5 rounded-lg bg-black/50 backdrop-blur-xs text-white text-[11px] font-bold">
                  <Star className="w-3 h-3 text-[#F4C95D] fill-[#F4C95D]" />
                  <span>{dest.rating.toFixed(1)}</span>
                </div>
              </div>

              {/* Destination Details */}
              <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                <div>
                  <h4 className="font-serif font-bold text-sm sm:text-base text-[#252525] group-hover:text-[#C29326] transition-colors">
                    {dest.city}, {dest.country}
                  </h4>
                  <p className="text-xs text-[#6F6A60] line-clamp-2 mt-0.5">
                    {dest.highlight}
                  </p>
                </div>

                <div className="pt-2 border-t border-[#DAD4C7]/50 flex items-center justify-between gap-2">
                  <span className="text-[11px] font-semibold text-[#4E7360] bg-[#E7EFEA] px-2 py-0.5 rounded-md">
                    {dest.travelStyle}
                  </span>

                  <Link
                    to="/trips/create"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#C29326] hover:text-[#252525] transition-colors"
                  >
                    <span>Plan Trip</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
