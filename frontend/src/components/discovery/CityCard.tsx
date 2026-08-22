import React, { useState } from 'react';
import { Star, MapPin, Plus, Check, Eye, Heart } from 'lucide-react';
import { Destination } from '../../types/landing';
import { Button } from '../ui/Button';

export interface CityCardProps {
  destination: Destination;
  onViewDetails: (destination: Destination) => void;
  onAddToTrip: (destination: Destination) => void;
  isAdded?: boolean;
  isWishlisted?: boolean;
  onToggleWishlist?: (destinationId: string) => void;
}

export const CityCard: React.FC<CityCardProps> = ({
  destination,
  onViewDetails,
  onAddToTrip,
  isAdded = false,
  isWishlisted = false,
  onToggleWishlist,
}) => {
  const [imgSrc, setImgSrc] = useState(destination.image);

  return (
    <div className="bg-[#FFF9EE] rounded-3xl overflow-hidden border border-[#DAD4C7]/80 hover:border-[#E5B740] transition-all duration-300 flex flex-col shadow-xs hover:shadow-md group">
      {/* Hero Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-[#EFE7D5]">
        <img
          src={imgSrc}
          alt={destination.city}
          loading="lazy"
          onError={() =>
            setImgSrc(
              'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop'
            )
          }
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Region & Travel Style Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-bold tracking-wide">
            {destination.region}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#4E7360]/90 backdrop-blur-md text-white text-[10px] font-semibold">
            {destination.travelStyle}
          </span>
        </div>

        {/* Wishlist Button */}
        {onToggleWishlist && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleWishlist(destination.id);
            }}
            aria-label={isWishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
            className="absolute top-3 right-3 p-2 rounded-full bg-white/80 hover:bg-white backdrop-blur-md text-[#D96B43] shadow-xs transition-transform hover:scale-110 cursor-pointer"
          >
            <Heart
              className={`w-3.5 h-3.5 ${isWishlisted ? 'fill-[#D96B43]' : ''}`}
            />
          </button>
        )}

        {/* Floating Rating & Cost Pill */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl">
            <Star className="w-3.5 h-3.5 fill-[#F4C95D] text-[#F4C95D]" />
            <span className="font-bold">{destination.rating.toFixed(1)}</span>
            <span className="text-[10px] text-white/80">({destination.reviewCount})</span>
          </div>

          <span className="px-2.5 py-1 rounded-xl bg-white/90 text-[#252525] font-bold text-[11px] backdrop-blur-md shadow-xs">
            {destination.priceLevel}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div>
            <h3 className="text-lg font-serif font-bold text-[#252525] group-hover:text-[#C29326] transition-colors leading-tight">
              {destination.city}
            </h3>
            <p className="text-xs text-[#6F6A60] flex items-center gap-1 mt-0.5 font-medium">
              <MapPin className="w-3 h-3 text-[#C29326]" />
              {destination.country}
            </p>
          </div>

          <p className="text-xs text-[#6F6A60] line-clamp-2 leading-relaxed">
            {destination.highlight}
          </p>

          {/* Tag Pills */}
          {destination.tags && destination.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {destination.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-0.5 rounded-lg bg-[#FCFAF5] border border-[#DAD4C7]/60 text-[10px] font-medium text-[#6F6A60]"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#DAD4C7]/60 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(destination)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            className="flex-1 text-xs font-semibold"
          >
            Details
          </Button>

          <Button
            type="button"
            variant={isAdded ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => onAddToTrip(destination)}
            leftIcon={isAdded ? <Check className="w-3.5 h-3.5 text-[#4E7360]" /> : <Plus className="w-3.5 h-3.5" />}
            className={`flex-1 text-xs font-bold ${
              isAdded ? 'bg-[#E7EFEA] text-[#4E7360] border border-[#C2D7CC]' : ''
            }`}
          >
            {isAdded ? 'In Trip' : 'Add to Trip'}
          </Button>
        </div>
      </div>
    </div>
  );
};
