import React from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Search,
  RotateCcw,
  List,
  Grid,
} from 'lucide-react';
import { Button } from '../ui/Button';

export type CalendarViewMode = 'month' | 'agenda';

export interface CalendarToolbarProps {
  currentMonthDate: Date;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
  viewMode: CalendarViewMode;
  onViewModeChange: (mode: CalendarViewMode) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
  selectedDestination: string;
  onDestinationChange: (dest: string) => void;
  availableDestinations: string[];
  onResetFilters: () => void;
}

export const CalendarToolbar: React.FC<CalendarToolbarProps> = ({
  currentMonthDate,
  onPrevMonth,
  onNextMonth,
  onToday,
  viewMode,
  onViewModeChange,
  searchQuery,
  onSearchChange,
  selectedStatus,
  onStatusChange,
  selectedCategory,
  onCategoryChange,
  selectedDestination,
  onDestinationChange,
  availableDestinations,
  onResetFilters,
}) => {
  const monthTitle = currentMonthDate.toLocaleDateString('en-US', {
    month: 'long',
    year: 'numeric',
  });

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedStatus !== 'all' ||
    selectedCategory !== 'all' ||
    selectedDestination !== 'all';

  return (
    <div className="bg-[#FFF9EE] p-4 sm:p-5 rounded-3xl border border-[#DAD4C7]/80 space-y-4 shadow-2xs">
      {/* Top Controls: Month Navigation, Today & View Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Month Navigation */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 bg-white border border-[#DAD4C7] rounded-xl p-1 shadow-2xs">
            <button
              type="button"
              onClick={onPrevMonth}
              aria-label="Previous Month"
              className="p-1.5 text-[#6F6A60] hover:text-[#252525] hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={onNextMonth}
              aria-label="Next Month"
              className="p-1.5 text-[#6F6A60] hover:text-[#252525] hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#252525]">
            {monthTitle}
          </h2>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onToday}
            className="text-xs font-bold px-3 py-1"
          >
            Today
          </Button>
        </div>

        {/* View Switcher (Month / Agenda) */}
        <div className="flex items-center p-1 bg-[#FCFAF5] rounded-2xl border border-[#DAD4C7]/80 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onViewModeChange('month')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'month'
                ? 'bg-[#F4C95D] text-[#252525] shadow-xs'
                : 'text-[#6F6A60] hover:text-[#252525]'
            }`}
          >
            <Grid className="w-3.5 h-3.5" /> Month View
          </button>

          <button
            type="button"
            onClick={() => onViewModeChange('agenda')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              viewMode === 'agenda'
                ? 'bg-[#F4C95D] text-[#252525] shadow-xs'
                : 'text-[#6F6A60] hover:text-[#252525]'
            }`}
          >
            <List className="w-3.5 h-3.5" /> Agenda View
          </button>
        </div>
      </div>

      {/* Bottom Filters & Search Row */}
      <div className="pt-3 border-t border-[#DAD4C7]/60 flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C867B]" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search trips, destinations, activities or cities..."
            className="w-full h-10 pl-10 pr-8 bg-white border border-[#DAD4C7] rounded-xl text-xs text-[#252525] focus:outline-none focus:border-[#E3B443] focus:ring-2 focus:ring-[#F4C95D]/20 font-medium"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C867B] hover:text-[#252525]"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Trip Status Filter */}
          <div className="flex items-center gap-1 bg-white border border-[#DAD4C7] rounded-xl px-2.5 h-10">
            <span className="text-[#8C867B] font-medium">Status:</span>
            <select
              value={selectedStatus}
              onChange={(e) => onStatusChange(e.target.value)}
              className="bg-transparent font-semibold text-[#252525] focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Trips</option>
              <option value="UPCOMING">Upcoming</option>
              <option value="ONGOING">Ongoing</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Destination Filter */}
          <div className="flex items-center gap-1 bg-white border border-[#DAD4C7] rounded-xl px-2.5 h-10">
            <span className="text-[#8C867B] font-medium">City:</span>
            <select
              value={selectedDestination}
              onChange={(e) => onDestinationChange(e.target.value)}
              className="bg-transparent font-semibold text-[#252525] focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Cities</option>
              {availableDestinations
                .filter((d) => d !== 'all')
                .map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
            </select>
          </div>

          {/* Activity Category Filter */}
          <div className="flex items-center gap-1 bg-white border border-[#DAD4C7] rounded-xl px-2.5 h-10">
            <span className="text-[#8C867B] font-medium">Type:</span>
            <select
              value={selectedCategory}
              onChange={(e) => onCategoryChange(e.target.value)}
              className="bg-transparent font-semibold text-[#252525] focus:outline-none cursor-pointer pr-1"
            >
              <option value="all">All Types</option>
              <option value="travel">Transport</option>
              <option value="hotel">Hotel / Stay</option>
              <option value="activity">Activity</option>
              <option value="sightseeing">Sightseeing</option>
              <option value="food">Food & Dining</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-bold text-[#D96B43] hover:underline flex items-center gap-1 px-2 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
