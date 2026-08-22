import React, { useState } from 'react';
import { Star, MapPin, Plus, Check, Eye, Clock, Tag } from 'lucide-react';
import { ActivityItem } from '../../types/trip';
import { Button } from '../ui/Button';

export interface ActivityCardProps {
  activity: ActivityItem;
  onViewDetails: (activity: ActivityItem) => void;
  onAddToTrip: (activity: ActivityItem) => void;
  isAdded?: boolean;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  activity,
  onViewDetails,
  onAddToTrip,
  isAdded = false,
}) => {
  const [imgSrc, setImgSrc] = useState(activity.image);

  return (
    <div className="bg-[#FFF9EE] rounded-3xl overflow-hidden border border-[#DAD4C7]/80 hover:border-[#E5B740] transition-all duration-300 flex flex-col shadow-xs hover:shadow-md group">
      {/* Hero Thumbnail */}
      <div className="relative h-48 w-full overflow-hidden bg-[#EFE7D5]">
        <img
          src={imgSrc}
          alt={activity.name}
          loading="lazy"
          onError={() =>
            setImgSrc(
              'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop'
            )
          }
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />

        {/* Category Badge */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-[#4E7360]/90 backdrop-blur-md text-white text-[10px] font-bold tracking-wide">
            {activity.category}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-semibold">
            {activity.priceLevel}
          </span>
        </div>

        {/* Floating Rating & Duration */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs">
          <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl">
            <Star className="w-3.5 h-3.5 fill-[#F4C95D] text-[#F4C95D]" />
            <span className="font-bold">{activity.rating.toFixed(2)}</span>
          </div>

          <div className="flex items-center gap-1 bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-xl text-[11px] font-medium">
            <Clock className="w-3 h-3 text-[#F4C95D]" />
            <span>{activity.duration}</span>
          </div>
        </div>
      </div>

      {/* Card Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <div>
            <h3 className="text-base font-serif font-bold text-[#252525] group-hover:text-[#C29326] transition-colors leading-tight line-clamp-1">
              {activity.name}
            </h3>
            <p className="text-xs text-[#6F6A60] flex items-center gap-1 mt-0.5 font-medium">
              <MapPin className="w-3 h-3 text-[#C29326]" />
              {activity.city}, {activity.country}
            </p>
          </div>

          <p className="text-xs text-[#6F6A60] line-clamp-2 leading-relaxed">
            {activity.description}
          </p>

          {/* Pricing Highlight Pill */}
          <div className="flex items-center gap-1.5 pt-1 text-xs font-semibold text-[#4E7360] bg-[#E7EFEA]/80 px-3 py-1.5 rounded-xl border border-[#C2D7CC]">
            <Tag className="w-3.5 h-3.5" />
            <span>{activity.estimatedCost}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 border-t border-[#DAD4C7]/60 flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onViewDetails(activity)}
            leftIcon={<Eye className="w-3.5 h-3.5" />}
            className="flex-1 text-xs font-semibold"
          >
            Details
          </Button>

          <Button
            type="button"
            variant={isAdded ? 'secondary' : 'primary'}
            size="sm"
            onClick={() => onAddToTrip(activity)}
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
