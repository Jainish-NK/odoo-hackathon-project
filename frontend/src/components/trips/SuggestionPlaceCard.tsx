import React, { useState } from 'react';
import { Star, MapPin, Plus, Check, Clock } from 'lucide-react';
import { SuggestedPlace } from '../../types/trip';

interface SuggestionPlaceCardProps {
  place: SuggestedPlace;
  isAdded: boolean;
  onToggleAdd: (id: string) => void;
}

export const SuggestionPlaceCard: React.FC<SuggestionPlaceCardProps> = ({
  place,
  isAdded,
  onToggleAdd,
}) => {
  const [imgSrc, setImgSrc] = useState(place.image);

  return (
    <div
      onClick={() => onToggleAdd(place.id)}
      className={`group relative bg-[#FFF9EE] rounded-2xl overflow-hidden border transition-all duration-300 flex flex-col cursor-pointer shadow-xs hover:shadow-md ${
        isAdded
          ? 'border-[#4E7360] ring-2 ring-[#4E7360]/20'
          : 'border-[#DAD4C7]/80 hover:border-[#E5B740]'
      }`}
    >
      {/* Image thumbnail */}
      <div className="relative h-36 w-full overflow-hidden bg-[#EFE7D5]">
        <img
          src={imgSrc}
          alt={place.name}
          loading="lazy"
          onError={() => setImgSrc('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop')}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold">
          {place.category}
        </span>
        <div className="absolute top-2.5 right-2.5 flex items-center gap-1 bg-[#FFF9EE]/90 backdrop-blur-xs px-2 py-0.5 rounded-lg">
          <Star className="w-3 h-3 fill-[#E3B443] text-[#E3B443]" />
          <span className="text-[11px] font-bold text-[#252525]">{place.rating}</span>
        </div>
      </div>

      {/* Details */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <h4 className="text-sm font-serif font-bold text-[#252525] group-hover:text-[#C29326] transition-colors line-clamp-1 mb-1">
            {place.name}
          </h4>

          <p className="text-[11px] text-[#6F6A60] flex items-center gap-1 mb-2 font-medium">
            <MapPin className="w-3 h-3 text-[#C29326]" />
            {place.city}, {place.country}
          </p>

          <p className="text-[11px] text-[#8C867B] flex items-center gap-1">
            <Clock className="w-3 h-3 text-[#8C867B]" />
            Rec. time: {place.estimatedTime}
          </p>
        </div>

        {/* Action Button */}
        <div className="mt-3 pt-2.5 border-t border-[#DAD4C7]/50 flex items-center justify-between">
          <span className="text-[10px] text-[#8C867B]">Place to Visit</span>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleAdd(place.id);
            }}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all flex items-center gap-1 cursor-pointer ${
              isAdded
                ? 'bg-[#4E7360] text-white shadow-xs'
                : 'bg-[#F4C95D] hover:bg-[#E3B443] text-[#252525] shadow-2xs'
            }`}
          >
            {isAdded ? (
              <>
                <Check className="w-3 h-3" /> Added
              </>
            ) : (
              <>
                <Plus className="w-3 h-3" /> Add
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
