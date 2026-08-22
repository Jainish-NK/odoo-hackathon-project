import React from 'react';
import {
  Search,
  X,
  ArrowUpDown,
  MapPin,
  RotateCcw,
} from 'lucide-react';
import { TripFilterState, TripSortOption, TripStatus } from '../../types/trip';

export interface TripFilterBarProps {
  filters: TripFilterState;
  onFilterChange: (filters: TripFilterState) => void;
  availableCities: string[];
  counts: {
    all: number;
    ongoing: number;
    upcoming: number;
    completed: number;
  };
}

export const TripFilterBar: React.FC<TripFilterBarProps> = ({
  filters,
  onFilterChange,
  availableCities,
  counts,
}) => {
  const isFiltered =
    filters.searchQuery.trim() !== '' ||
    filters.status !== 'ALL' ||
    filters.destinationCity !== '' ||
    filters.sortBy !== 'newest';

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchQuery: e.target.value,
    });
  };

  const handleClearSearch = () => {
    onFilterChange({
      ...filters,
      searchQuery: '',
    });
  };

  const handleStatusChange = (status: 'ALL' | TripStatus) => {
    onFilterChange({
      ...filters,
      status,
    });
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      destinationCity: e.target.value,
    });
  };

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    onFilterChange({
      ...filters,
      sortBy: e.target.value as TripSortOption,
    });
  };

  const handleResetFilters = () => {
    onFilterChange({
      searchQuery: '',
      status: 'ALL',
      destinationCity: '',
      sortBy: 'newest',
    });
  };

  return (
    <div className="space-y-4">
      {/* Top Row: Search Input, Destination Select & Sort Select */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3">
        {/* Search Bar */}
        <div className="relative flex-1">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C867B] pointer-events-none">
            <Search className="w-4 h-4" />
          </div>

          <input
            type="text"
            value={filters.searchQuery}
            onChange={handleSearchChange}
            placeholder="Search trips by name, destination, or notes..."
            aria-label="Search trips"
            className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm bg-[#FFF9EE] border border-[#DAD4C7] hover:border-[#8C867B] focus:border-[#E3B443] focus:ring-4 focus:ring-[#F4C95D]/20 rounded-xl text-[#252525] placeholder:text-[#8C867B] transition-all outline-none"
          />

          {filters.searchQuery && (
            <button
              type="button"
              onClick={handleClearSearch}
              aria-label="Clear search"
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-[#8C867B] hover:text-[#252525] hover:bg-black/5 rounded-md transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Filter Controls Row */}
        <div className="flex items-center gap-2.5 shrink-0 overflow-x-auto pb-1 md:pb-0">
          {/* Destination Dropdown */}
          <div className="relative min-w-[140px] sm:min-w-[160px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C867B] pointer-events-none">
              <MapPin className="w-3.5 h-3.5 text-[#C29326]" />
            </div>
            <select
              value={filters.destinationCity}
              onChange={handleCityChange}
              aria-label="Filter by destination"
              className="w-full h-11 pl-8.5 pr-8 text-xs font-medium bg-[#FFF9EE] border border-[#DAD4C7] hover:border-[#8C867B] focus:border-[#E3B443] rounded-xl text-[#252525] transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="">All Destinations</option>
              {availableCities.map((city) => (
                <option key={city} value={city}>
                  {city}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="relative min-w-[160px] sm:min-w-[180px]">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-[#8C867B] pointer-events-none">
              <ArrowUpDown className="w-3.5 h-3.5 text-[#4E7360]" />
            </div>
            <select
              value={filters.sortBy}
              onChange={handleSortChange}
              aria-label="Sort trips"
              className="w-full h-11 pl-8.5 pr-8 text-xs font-medium bg-[#FFF9EE] border border-[#DAD4C7] hover:border-[#8C867B] focus:border-[#E3B443] rounded-xl text-[#252525] transition-all outline-none appearance-none cursor-pointer"
            >
              <option value="newest">Newest Created</option>
              <option value="oldest">Oldest Created</option>
              <option value="date-asc">Start Date — Soonest</option>
              <option value="date-desc">Start Date — Latest</option>
              <option value="name-asc">Trip Name (A-Z)</option>
              <option value="name-desc">Trip Name (Z-A)</option>
            </select>
          </div>

          {/* Reset Filters CTA */}
          {isFiltered && (
            <button
              type="button"
              onClick={handleResetFilters}
              title="Reset all filters"
              aria-label="Reset all filters"
              className="h-11 px-3.5 rounded-xl bg-white/70 hover:bg-[#FAECE7] text-[#D96B43] border border-[#F5D5CB] text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Bottom Row: Status Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0 select-none">
        {/* All Trips Tab */}
        <button
          type="button"
          onClick={() => handleStatusChange('ALL')}
          className={`h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer shrink-0 ${
            filters.status === 'ALL'
              ? 'bg-[#252525] text-white shadow-xs'
              : 'bg-[#FFF9EE] hover:bg-white text-[#6F6A60] hover:text-[#252525] border border-[#DAD4C7]'
          }`}
        >
          <span>All Trips</span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              filters.status === 'ALL'
                ? 'bg-white/20 text-white'
                : 'bg-black/5 text-[#6F6A60]'
            }`}
          >
            {counts.all}
          </span>
        </button>

        {/* Ongoing Tab */}
        <button
          type="button"
          onClick={() => handleStatusChange('ONGOING')}
          className={`h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer shrink-0 ${
            filters.status === 'ONGOING'
              ? 'bg-[#4E7360] text-white shadow-xs'
              : 'bg-[#FFF9EE] hover:bg-white text-[#6F6A60] hover:text-[#252525] border border-[#DAD4C7]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#4E7360] inline-block" />
          <span>Ongoing</span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              filters.status === 'ONGOING'
                ? 'bg-white/20 text-white'
                : 'bg-[#E7EFEA] text-[#4E7360]'
            }`}
          >
            {counts.ongoing}
          </span>
        </button>

        {/* Upcoming Tab */}
        <button
          type="button"
          onClick={() => handleStatusChange('UPCOMING')}
          className={`h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer shrink-0 ${
            filters.status === 'UPCOMING'
              ? 'bg-[#E3B443] text-[#252525] shadow-xs'
              : 'bg-[#FFF9EE] hover:bg-white text-[#6F6A60] hover:text-[#252525] border border-[#DAD4C7]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#E3B443] inline-block" />
          <span>Upcoming</span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              filters.status === 'UPCOMING'
                ? 'bg-black/15 text-[#252525]'
                : 'bg-[#FCFAF5] text-[#C29326] border border-[#F4C95D]/40'
            }`}
          >
            {counts.upcoming}
          </span>
        </button>

        {/* Completed Tab */}
        <button
          type="button"
          onClick={() => handleStatusChange('COMPLETED')}
          className={`h-9 px-3.5 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all duration-200 cursor-pointer shrink-0 ${
            filters.status === 'COMPLETED'
              ? 'bg-[#6F6A60] text-white shadow-xs'
              : 'bg-[#FFF9EE] hover:bg-white text-[#6F6A60] hover:text-[#252525] border border-[#DAD4C7]'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-[#8C867B] inline-block" />
          <span>Completed</span>
          <span
            className={`px-1.5 py-0.5 rounded-md text-[10px] font-bold ${
              filters.status === 'COMPLETED'
                ? 'bg-white/20 text-white'
                : 'bg-black/5 text-[#6F6A60]'
            }`}
          >
            {counts.completed}
          </span>
        </button>
      </div>
    </div>
  );
};
