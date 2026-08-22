import React from 'react';
import { TrendingUp, Users, Compass, Wallet, Sparkles } from 'lucide-react';
import { AdminCityAnalytics } from '../../types/admin';

interface PopularCitiesProps {
  cities: AdminCityAnalytics[];
}

export const PopularCities: React.FC<PopularCitiesProps> = ({ cities }) => {
  if (cities.length === 0) {
    return (
      <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-10 text-center space-y-2">
        <p className="text-sm font-semibold text-[#252525]">No destination cities found.</p>
        <p className="text-xs text-[#6F6A60]">Try adjusting your search query or region filter.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Top Description Bar */}
      <div className="bg-[#FFF9EE] p-4 sm:p-5 rounded-3xl border border-[#DAD4C7]/80 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#252525]">
            Top Travel Destinations & City Trends
          </h2>
          <p className="text-xs text-[#6F6A60]">
            Ranked by total itinerary creations, user saves, and budget velocity.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FCFAF5] border border-[#DAD4C7] text-xs font-bold text-[#252525]">
          <Sparkles className="w-3.5 h-3.5 text-[#C29326]" />
          <span>Global Trending</span>
        </div>
      </div>

      {/* Grid of Ranked Destinations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cities.map((city) => (
          <div
            key={city.id}
            className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 overflow-hidden shadow-2xs hover:border-[#E5B740] transition-all duration-300 flex flex-col justify-between group"
          >
            {/* Top Image + Badges */}
            <div className="relative h-44 overflow-hidden">
              <img
                src={city.image}
                alt={city.city}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

              {/* Rank Pill */}
              <div className="absolute top-3 left-3 bg-[#252525] text-[#F4C95D] font-serif font-bold text-xs px-3 py-1 rounded-xl shadow-md flex items-center gap-1">
                <span>#{city.rank.toString().padStart(2, '0')}</span>
              </div>

              {/* Growth Pill */}
              <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-xs text-[#4E7360] font-bold text-xs px-2.5 py-1 rounded-xl shadow-md flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                <span>{city.growthRate}</span>
              </div>

              {/* City Title Overlay */}
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="flex items-center gap-1.5 text-xs font-medium text-white/80">
                  <span>{city.flag}</span>
                  <span>{city.country}</span>
                  <span>•</span>
                  <span>{city.region}</span>
                </div>
                <h3 className="text-xl font-serif font-bold tracking-tight text-white drop-shadow-xs">
                  {city.city}
                </h3>
              </div>
            </div>

            {/* Content Details */}
            <div className="p-4 sm:p-5 space-y-4 flex-1 flex flex-col justify-between">
              {/* Popularity Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#6F6A60] font-medium">Popularity Score</span>
                  <span className="font-bold text-[#252525]">{city.popularityScore}%</span>
                </div>
                <div className="w-full h-2 bg-[#FCFAF5] rounded-full border border-[#DAD4C7] overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-[#F4C95D] to-[#4E7360] rounded-full transition-all duration-500"
                    style={{ width: `${city.popularityScore}%` }}
                  />
                </div>
              </div>

              {/* Key Metrics Grid */}
              <div className="grid grid-cols-3 gap-2 pt-2 border-t border-[#DAD4C7]/60 text-center">
                <div className="p-2 bg-[#FCFAF5] rounded-xl border border-[#DAD4C7]/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6A60] block">
                    Trips
                  </span>
                  <span className="text-xs font-bold text-[#252525] mt-0.5 flex items-center justify-center gap-1">
                    <Compass className="w-3 h-3 text-[#4E7360]" />
                    {city.tripsCount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-2 bg-[#FCFAF5] rounded-xl border border-[#DAD4C7]/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6A60] block">
                    Travelers
                  </span>
                  <span className="text-xs font-bold text-[#252525] mt-0.5 flex items-center justify-center gap-1">
                    <Users className="w-3 h-3 text-[#C29326]" />
                    {city.usersCount.toLocaleString('en-IN')}
                  </span>
                </div>

                <div className="p-2 bg-[#FCFAF5] rounded-xl border border-[#DAD4C7]/70">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6A60] block">
                    Avg Budget
                  </span>
                  <span className="text-xs font-bold text-[#4E7360] mt-0.5 flex items-center justify-center gap-1">
                    <Wallet className="w-3 h-3 text-[#4E7360]" />
                    ₹{city.averageBudget.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Footer Season & Attraction */}
              <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#6F6A60]">
                <span>
                  <strong className="text-[#252525]">Top Season:</strong> {city.topSeason}
                </span>
                <span className="truncate max-w-[200px]" title={city.primaryAttraction}>
                  ✨ {city.primaryAttraction}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
