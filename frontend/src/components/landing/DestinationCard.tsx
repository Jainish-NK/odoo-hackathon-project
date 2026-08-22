import React, { useState } from 'react';
import { Star, MapPin, Heart, Sparkles, Compass } from 'lucide-react';
import { Destination } from '../../types/landing';
import { useToast } from '../../context/ToastContext';

interface DestinationCardProps {
  destination: Destination;
  onSelect?: (destination: Destination) => void;
}

export const DestinationCard: React.FC<DestinationCardProps> = ({
  destination,
  onSelect,
}) => {
  const { showToast } = useToast();
  const [isSaved, setIsSaved] = useState(false);

  const toggleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSaved((prev) => !prev);
    if (!isSaved) {
      showToast('success', 'Saved Destination', `Added ${destination.city} to your travel wishlist.`);
    } else {
      showToast('info', 'Removed', `Removed ${destination.city} from wishlist.`);
    }
  };

  const handleCardClick = () => {
    if (onSelect) {
      onSelect(destination);
    } else {
      showToast('info', `${destination.city}, ${destination.country}`, `Highlight: ${destination.highlight}`);
    }
  };

  return (
    <div
      onClick={handleCardClick}
      className="group relative bg-[#FFF9EE] border border-[#DAD4C7]/80 hover:border-[#E5B740] rounded-[20px] overflow-hidden shadow-xs hover:shadow-lg shadow-[#252525]/6 transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
    >
      {/* Top Image Container */}
      <div className="relative h-[165px] w-full overflow-hidden bg-[#EFE7D5]">
        <img
          src={destination.image}
          alt={`${destination.city}, ${destination.country}`}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {/* Gradient Shadow Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 pointer-events-none" />

        {/* Region Tag */}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-white text-[11px] font-semibold flex items-center gap-1 border border-white/20">
          <Compass className="w-3 h-3 text-[#F4C95D]" />
          {destination.region}
        </span>

        {/* Favorite Heart Button */}
        <button
          type="button"
          onClick={toggleSave}
          aria-label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
            isSaved
              ? 'bg-[#FAECE7] text-[#D96B43] shadow-md scale-105'
              : 'bg-white/80 text-[#6F6A60] hover:text-[#D96B43] hover:bg-white'
          }`}
        >
          <Heart className={`w-3.5 h-3.5 ${isSaved ? 'fill-current' : ''}`} />
        </button>

        {/* Price level / Style tag in image bottom */}
        <div className="absolute bottom-2.5 left-3 right-3 flex items-center justify-between text-white text-xs">
          <span className="text-[11px] font-medium bg-[#4E7360]/80 backdrop-blur-xs px-2 py-0.5 rounded-md text-white">
            {destination.travelStyle}
          </span>
          <span className="text-[11px] font-medium bg-black/40 px-2 py-0.5 rounded-md text-white/90">
            {destination.priceLevel}
          </span>
        </div>
      </div>

      {/* Card Content Area */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-1 mb-1">
            <h3 className="text-base font-serif font-bold text-[#252525] group-hover:text-[#C29326] transition-colors leading-tight">
              {destination.city}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-1 bg-[#FCFAF5] border border-[#DAD4C7]/60 px-2 py-0.5 rounded-lg shrink-0">
              <Star className="w-3 h-3 fill-[#E3B443] text-[#E3B443]" />
              <span className="text-xs font-bold text-[#252525]">{destination.rating}</span>
            </div>
          </div>

          <p className="text-xs text-[#6F6A60] flex items-center gap-1 mb-2 font-medium">
            <MapPin className="w-3 h-3 text-[#C29326]" />
            {destination.country}
          </p>

          <p className="text-[11px] text-[#8C867B] line-clamp-1 italic">
            "{destination.highlight}"
          </p>
        </div>

        {/* Tags footer */}
        <div className="mt-3 pt-2.5 border-t border-[#DAD4C7]/50 flex items-center justify-between text-[11px] text-[#6F6A60]">
          <div className="flex gap-1 overflow-hidden">
            {destination.tags.slice(0, 2).map((t) => (
              <span key={t} className="bg-white/80 px-2 py-0.5 rounded-md border border-[#DAD4C7]/60 text-[10px]">
                {t}
              </span>
            ))}
          </div>

          <span className="font-semibold text-[#252525] group-hover:text-[#C29326] flex items-center gap-0.5 text-xs">
            Explore <Sparkles className="w-2.5 h-2.5 text-[#E3B443]" />
          </span>
        </div>
      </div>
    </div>
  );
};
