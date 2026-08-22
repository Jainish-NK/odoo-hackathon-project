import React from 'react';
import {
  Star,
  Clock,
  Compass,
  Users,
  MapPin,
  TrendingUp,
  Utensils,
  Camera,
  Trees,
  Mountain,
  Landmark,
} from 'lucide-react';
import { AdminActivityAnalytics } from '../../types/admin';

interface PopularActivitiesProps {
  activities: AdminActivityAnalytics[];
}

const categoryStyles: Record<
  string,
  { bg: string; text: string; border: string; icon: React.ComponentType<{ className?: string }> }
> = {
  Food: { bg: 'bg-[#FAECE7]', text: 'text-[#D96B43]', border: 'border-[#F5D5CB]', icon: Utensils },
  Adventure: { bg: 'bg-[#FCFAF5]', text: 'text-[#C29326]', border: 'border-[#F4C95D]', icon: Mountain },
  Culture: { bg: 'bg-[#E7EFEA]', text: 'text-[#4E7360]', border: 'border-[#C2D7CC]', icon: Landmark },
  Nature: { bg: 'bg-[#E7EFEA]', text: 'text-[#304B3D]', border: 'border-[#A3C6B4]', icon: Trees },
  Sightseeing: { bg: 'bg-[#F2ECE0]', text: 'text-[#6F6A60]', border: 'border-[#DAD4C7]', icon: Camera },
  Shopping: { bg: 'bg-[#FCFAF5]', text: 'text-[#8C867B]', border: 'border-[#DAD4C7]', icon: Compass },
};

export const PopularActivities: React.FC<PopularActivitiesProps> = ({ activities }) => {
  if (activities.length === 0) {
    return (
      <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-10 text-center space-y-2">
        <p className="text-sm font-semibold text-[#252525]">No activities found.</p>
        <p className="text-xs text-[#6F6A60]">Try adjusting your search query or category filter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Header Bar */}
      <div className="bg-[#FFF9EE] p-4 sm:p-5 rounded-3xl border border-[#DAD4C7]/80 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#252525]">
            Most Popular Traveler Activities & Bookings
          </h2>
          <p className="text-xs text-[#6F6A60]">
            Curated list of experiences with the highest traveler adoption rate.
          </p>
        </div>

        <div className="text-xs font-bold text-[#4E7360] bg-[#E7EFEA] px-3 py-1 rounded-xl border border-[#C2D7CC]">
          {activities.length} Tracked Experiences
        </div>
      </div>

      {/* Activities List */}
      <div className="space-y-3">
        {activities.map((act) => {
          const catStyle = categoryStyles[act.category] || categoryStyles.Sightseeing;
          const CategoryIcon = catStyle.icon;

          return (
            <div
              key={act.id}
              className="bg-[#FFF9EE] p-4 sm:p-5 rounded-3xl border border-[#DAD4C7]/80 hover:border-[#E5B740] transition-colors shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 group"
            >
              {/* Left Group: Rank, Image & Details */}
              <div className="flex items-center gap-4 flex-1 min-w-0">
                {/* Rank Badge */}
                <span className="font-serif font-bold text-lg text-[#8C867B] group-hover:text-[#252525] transition-colors w-8 text-center shrink-0">
                  #{act.rank.toString().padStart(2, '0')}
                </span>

                {/* Activity Thumbnail */}
                <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border border-[#DAD4C7] shrink-0">
                  <img
                    src={act.image}
                    alt={act.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute top-1 left-1 bg-black/60 backdrop-blur-xs text-[#F4C95D] text-[9px] font-bold px-1.5 py-0.5 rounded-md flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-[#F4C95D]" />
                    {act.averageRating}
                  </div>
                </div>

                {/* Text Info */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md border ${catStyle.bg} ${catStyle.text} ${catStyle.border}`}
                    >
                      <CategoryIcon className="w-3 h-3" />
                      <span>{act.category}</span>
                    </span>

                    <span className="text-[11px] font-semibold text-[#6F6A60] flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#C29326]" />
                      {act.city}, {act.country}
                    </span>
                  </div>

                  <h3 className="text-sm sm:text-base font-serif font-bold text-[#252525] truncate">
                    {act.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#6F6A60]">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#8C867B]" /> {act.avgDuration}
                    </span>
                    <span>•</span>
                    <span className="font-semibold text-[#4E7360]">
                      Cost: {act.estimatedCost}
                    </span>
                  </div>
                </div>
              </div>

              {/* Right Stats: Travelers, Trips, Popularity Score */}
              <div className="flex items-center justify-between w-full md:w-auto md:justify-end gap-3 sm:gap-6 pt-3 md:pt-0 border-t md:border-t-0 border-[#DAD4C7]/60 shrink-0">
                <div className="text-left md:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6A60] block">
                    Travelers Added
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#252525] flex items-center md:justify-end gap-1 mt-0.5">
                    <Users className="w-3.5 h-3.5 text-[#C29326]" />
                    {act.usersCount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="text-left md:text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6A60] block">
                    Itineraries
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-[#252525] flex items-center md:justify-end gap-1 mt-0.5">
                    <Compass className="w-3.5 h-3.5 text-[#4E7360]" />
                    {act.tripsCount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6A60] block">
                    Score
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-bold text-[#4E7360] bg-[#E7EFEA] px-2.5 py-1 rounded-xl border border-[#C2D7CC] mt-0.5">
                    <TrendingUp className="w-3 h-3" />
                    {act.popularityScore}%
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
