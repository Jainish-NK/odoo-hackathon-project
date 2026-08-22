import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin } from 'lucide-react';
import { SmartRecommendationItem } from '../../services/insightsService';
import { Button } from '../ui/Button';

export interface SmartRecommendationsProps {
  recommendations: SmartRecommendationItem[];
}

export const SmartRecommendations: React.FC<SmartRecommendationsProps> = ({
  recommendations,
}) => {
  return (
    <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-6 space-y-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DAD4C7]/60 pb-3">
        <div>
          <h3 className="text-base font-serif font-bold text-[#252525]">
            Recommended For You
          </h3>
          <p className="text-xs text-[#6F6A60]">
            Personalized destinations matching your travel styles and wishlist
          </p>
        </div>

        <Link to="/cities">
          <Button variant="outline" size="sm" className="text-xs font-bold">
            Explore All Cities
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {recommendations.map(({ destination, reason, matchedStyles }) => (
          <div
            key={destination.id}
            className="group bg-white rounded-2xl border border-[#DAD4C7]/80 hover:border-[#E5B740] transition-all overflow-hidden flex flex-col justify-between shadow-2xs"
          >
            <div>
              {/* Photo Banner */}
              <div className="h-32 bg-cover bg-center relative overflow-hidden">
                <img
                  src={destination.image}
                  alt={destination.city}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <span className="absolute bottom-2 left-2.5 text-xs font-bold text-white flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#F4C95D]" />
                  {destination.city}, {destination.country}
                </span>
                <span className="absolute top-2 right-2 text-sm bg-white/80 backdrop-blur-md px-1.5 py-0.5 rounded-md">
                  {destination.flag}
                </span>
              </div>

              {/* Card Body */}
              <div className="p-3.5 space-y-2">
                <div className="flex flex-wrap gap-1">
                  {matchedStyles.map((style) => (
                    <span
                      key={style}
                      className="text-[10px] font-bold text-[#4E7360] bg-[#E7EFEA] px-2 py-0.5 rounded-full"
                    >
                      {style}
                    </span>
                  ))}
                </div>

                <p className="text-xs text-[#6F6A60] leading-relaxed line-clamp-2">
                  {reason}
                </p>
              </div>
            </div>

            <div className="p-3.5 pt-0 border-t border-[#DAD4C7]/40 flex items-center justify-between gap-2 mt-2">
              <Link to="/cities" className="flex-1">
                <Button
                  variant="outline"
                  size="sm"
                  fullWidth
                  className="text-xs font-bold"
                >
                  Explore
                </Button>
              </Link>
              <Link to="/trips/create" className="flex-1">
                <Button
                  variant="primary"
                  size="sm"
                  fullWidth
                  className="text-xs font-bold"
                >
                  Plan Trip
                </Button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
