import React from 'react';
import { Plane } from 'lucide-react';
import { Trip } from '../../types/trip';

export interface TripInsightSelectorProps {
  trips: Trip[];
  selectedTripId: string;
  onSelectTrip: (tripId: string) => void;
  timeRange: 'all' | '90d' | 'year';
  onSelectTimeRange: (range: 'all' | '90d' | 'year') => void;
}

export const TripInsightSelector: React.FC<TripInsightSelectorProps> = ({
  trips,
  selectedTripId,
  onSelectTrip,
  timeRange,
  onSelectTimeRange,
}) => {
  return (
    <div className="bg-[#FFF9EE] p-4 sm:p-5 rounded-3xl border border-[#DAD4C7]/80 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-2xs">
      {/* Trip Scope Selector */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex items-center gap-1.5 bg-white border border-[#DAD4C7] rounded-xl px-3 py-1.5 shadow-2xs">
          <Plane className="w-3.5 h-3.5 text-[#C29326]" />
          <span className="text-xs font-semibold text-[#8C867B]">Trip Scope:</span>
          <select
            value={selectedTripId}
            onChange={(e) => onSelectTrip(e.target.value)}
            className="bg-transparent text-xs font-bold text-[#252525] focus:outline-none cursor-pointer pr-1"
          >
            <option value="all">All Trips Combined ({trips.length})</option>
            {trips.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Time Range Filter */}
      <div className="flex items-center p-1 bg-[#FCFAF5] rounded-2xl border border-[#DAD4C7]/80 self-start md:self-auto">
        {(['all', '90d', 'year'] as const).map((range) => {
          const labels = {
            all: 'All Time',
            '90d': 'Last 90 Days',
            year: 'This Year',
          };
          const isSelected = timeRange === range;

          return (
            <button
              key={range}
              type="button"
              onClick={() => onSelectTimeRange(range)}
              className={`px-3 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isSelected
                  ? 'bg-[#F4C95D] text-[#252525] shadow-xs'
                  : 'text-[#6F6A60] hover:text-[#252525]'
              }`}
            >
              {labels[range]}
            </button>
          );
        })}
      </div>
    </div>
  );
};
