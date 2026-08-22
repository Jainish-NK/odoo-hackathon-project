import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  ChevronDown,
  SlidersHorizontal,
  ArrowUpDown,
  Layers,
  X,
  Check,
  RotateCcw,
} from 'lucide-react';
import { FilterState, GroupByOption, SortByOption } from '../../types/landing';

interface FilterToolbarProps {
  filterState: FilterState;
  onFilterChange: (updates: Partial<FilterState>) => void;
  onResetFilters: () => void;
  totalResults: number;
}

export const FilterToolbar: React.FC<FilterToolbarProps> = ({
  filterState,
  onFilterChange,
  onResetFilters,
  totalResults,
}) => {
  const [isGroupByOpen, setIsGroupByOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isSortByOpen, setIsSortByOpen] = useState(false);

  const groupByRef = useRef<HTMLDivElement>(null);
  const filterRef = useRef<HTMLDivElement>(null);
  const sortByRef = useRef<HTMLDivElement>(null);

  // Close menus when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (groupByRef.current && !groupByRef.current.contains(e.target as Node)) {
        setIsGroupByOpen(false);
      }
      if (filterRef.current && !filterRef.current.contains(e.target as Node)) {
        setIsFilterOpen(false);
      }
      if (sortByRef.current && !sortByRef.current.contains(e.target as Node)) {
        setIsSortByOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const groupByLabels: Record<GroupByOption, string> = {
    none: 'None',
    region: 'Region',
    travelStyle: 'Travel Style',
    priceLevel: 'Price Level',
  };

  const sortByLabels: Record<SortByOption, string> = {
    popular: 'Most Popular',
    rating: 'Highest Rated',
    nameAsc: 'Name (A-Z)',
    nameDesc: 'Name (Z-A)',
  };

  const hasActiveFilters =
    Boolean(filterState.searchQuery) ||
    Boolean(filterState.selectedRegion) ||
    Boolean(filterState.selectedTravelStyle) ||
    Boolean(filterState.selectedPriceLevel) ||
    filterState.groupBy !== 'none' ||
    filterState.sortBy !== 'popular';

  return (
    <div className="w-full bg-[#FFF9EE]/90 border border-[#DAD4C7]/80 rounded-2xl p-3 sm:p-4 shadow-sm mb-8">
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3">
        {/* Search destination input */}
        <div className="relative flex-1 min-w-[240px]">
          <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C867B] pointer-events-none">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Search destinations by city, country or tag..."
            value={filterState.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            className="w-full h-11 pl-10 pr-9 text-xs sm:text-sm text-[#252525] placeholder:text-[#8C867B] bg-white/80 border border-[#DAD4C7] rounded-xl focus:outline-none focus:border-[#E3B443] focus:ring-3 focus:ring-[#F4C95D]/20 transition-all"
          />
          {filterState.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C867B] hover:text-[#252525] p-1"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Controls Row: Group By, Filter, Sort By */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {/* Group By Control */}
          <div className="relative" ref={groupByRef}>
            <button
              type="button"
              onClick={() => {
                setIsGroupByOpen((prev) => !prev);
                setIsFilterOpen(false);
                setIsSortByOpen(false);
              }}
              className={`h-11 px-3.5 text-xs font-semibold rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                filterState.groupBy !== 'none'
                  ? 'bg-[#E7EFEA] border-[#4E7360]/40 text-[#334D40]'
                  : 'bg-white/80 border-[#DAD4C7] text-[#252525] hover:bg-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5 text-[#6F6A60]" />
              <span>Group By: {groupByLabels[filterState.groupBy]}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#8C867B] transition-transform ${isGroupByOpen ? 'rotate-180' : ''}`} />
            </button>

            {isGroupByOpen && (
              <div
                className="absolute left-0 lg:right-0 lg:left-auto mt-2 w-48 bg-[#FFF9EE] border border-white/80 rounded-2xl shadow-xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
                style={{ boxShadow: '0 12px 30px -8px rgba(45, 37, 24, 0.15)' }}
              >
                {(['none', 'region', 'travelStyle', 'priceLevel'] as GroupByOption[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onFilterChange({ groupBy: option });
                      setIsGroupByOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      filterState.groupBy === option
                        ? 'bg-[#F4C95D]/30 text-[#252525] font-bold'
                        : 'text-[#6F6A60] hover:bg-black/5 hover:text-[#252525]'
                    }`}
                  >
                    <span>{groupByLabels[option]}</span>
                    {filterState.groupBy === option && <Check className="w-3.5 h-3.5 text-[#252525]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Filter Control Popover */}
          <div className="relative" ref={filterRef}>
            <button
              type="button"
              onClick={() => {
                setIsFilterOpen((prev) => !prev);
                setIsGroupByOpen(false);
                setIsSortByOpen(false);
              }}
              className={`h-11 px-3.5 text-xs font-semibold rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                filterState.selectedRegion || filterState.selectedTravelStyle || filterState.selectedPriceLevel
                  ? 'bg-[#F4C95D]/25 border-[#E5B740] text-[#252525]'
                  : 'bg-white/80 border-[#DAD4C7] text-[#252525] hover:bg-white'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#6F6A60]" />
              <span>
                Filter
                {filterState.selectedRegion || filterState.selectedTravelStyle || filterState.selectedPriceLevel ? ' (Active)' : ''}
              </span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#8C867B] transition-transform ${isFilterOpen ? 'rotate-180' : ''}`} />
            </button>

            {isFilterOpen && (
              <div
                className="absolute left-0 sm:right-0 sm:left-auto mt-2 w-72 bg-[#FFF9EE] border border-white/80 rounded-2xl shadow-xl p-4 z-30 animate-in fade-in zoom-in-95 duration-150 space-y-3.5"
                style={{ boxShadow: '0 16px 36px -8px rgba(45, 37, 24, 0.18)' }}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[#DAD4C7]/60">
                  <span className="text-xs font-bold uppercase tracking-wider text-[#6F6A60]">Filter Options</span>
                  <button
                    type="button"
                    onClick={() => {
                      onFilterChange({
                        selectedRegion: '',
                        selectedTravelStyle: '',
                        selectedPriceLevel: '',
                      });
                    }}
                    className="text-[11px] text-[#D96B43] hover:underline"
                  >
                    Clear all
                  </button>
                </div>

                {/* Region Filter */}
                <div>
                  <label className="text-[11px] font-semibold text-[#6F6A60] block mb-1.5">Region</label>
                  <select
                    value={filterState.selectedRegion}
                    onChange={(e) => onFilterChange({ selectedRegion: e.target.value })}
                    className="w-full h-9 text-xs bg-white/90 border border-[#DAD4C7] rounded-xl px-2.5 text-[#252525] focus:outline-none focus:border-[#E3B443]"
                  >
                    <option value="">All Regions</option>
                    <option value="Europe">Europe</option>
                    <option value="Asia">Asia</option>
                    <option value="Middle East">Middle East</option>
                    <option value="Americas">Americas</option>
                  </select>
                </div>

                {/* Travel Style Filter */}
                <div>
                  <label className="text-[11px] font-semibold text-[#6F6A60] block mb-1.5">Travel Style</label>
                  <select
                    value={filterState.selectedTravelStyle}
                    onChange={(e) => onFilterChange({ selectedTravelStyle: e.target.value })}
                    className="w-full h-9 text-xs bg-white/90 border border-[#DAD4C7] rounded-xl px-2.5 text-[#252525] focus:outline-none focus:border-[#E3B443]"
                  >
                    <option value="">All Styles</option>
                    <option value="Cultural">Cultural</option>
                    <option value="Luxury">Luxury</option>
                    <option value="Adventure">Adventure</option>
                    <option value="Relaxation">Relaxation</option>
                  </select>
                </div>

                {/* Price Level Filter */}
                <div>
                  <label className="text-[11px] font-semibold text-[#6F6A60] block mb-1.5">Price Level</label>
                  <select
                    value={filterState.selectedPriceLevel}
                    onChange={(e) => onFilterChange({ selectedPriceLevel: e.target.value })}
                    className="w-full h-9 text-xs bg-white/90 border border-[#DAD4C7] rounded-xl px-2.5 text-[#252525] focus:outline-none focus:border-[#E3B443]"
                  >
                    <option value="">All Budgets</option>
                    <option value="Budget">Budget</option>
                    <option value="Moderate">Moderate</option>
                    <option value="Luxury">Luxury</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          {/* Sort By Control */}
          <div className="relative" ref={sortByRef}>
            <button
              type="button"
              onClick={() => {
                setIsSortByOpen((prev) => !prev);
                setIsGroupByOpen(false);
                setIsFilterOpen(false);
              }}
              className="h-11 px-3.5 text-xs font-semibold rounded-xl border bg-white/80 border-[#DAD4C7] text-[#252525] hover:bg-white flex items-center gap-2 transition-all cursor-pointer"
            >
              <ArrowUpDown className="w-3.5 h-3.5 text-[#6F6A60]" />
              <span>Sort: {sortByLabels[filterState.sortBy]}</span>
              <ChevronDown className={`w-3.5 h-3.5 text-[#8C867B] transition-transform ${isSortByOpen ? 'rotate-180' : ''}`} />
            </button>

            {isSortByOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-[#FFF9EE] border border-white/80 rounded-2xl shadow-xl p-1.5 z-30 animate-in fade-in zoom-in-95 duration-150"
                style={{ boxShadow: '0 12px 30px -8px rgba(45, 37, 24, 0.15)' }}
              >
                {(['popular', 'rating', 'nameAsc', 'nameDesc'] as SortByOption[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      onFilterChange({ sortBy: option });
                      setIsSortByOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 text-xs font-medium rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      filterState.sortBy === option
                        ? 'bg-[#F4C95D]/30 text-[#252525] font-bold'
                        : 'text-[#6F6A60] hover:bg-black/5 hover:text-[#252525]'
                    }`}
                  >
                    <span>{sortByLabels[option]}</span>
                    {filterState.sortBy === option && <Check className="w-3.5 h-3.5 text-[#252525]" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset Filters Icon Button if active */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              title="Reset all filters"
              className="h-11 px-3 bg-[#FAECE7] hover:bg-[#F5D5CB] text-[#D96B43] rounded-xl border border-[#D96B43]/20 flex items-center gap-1.5 text-xs font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Results & Active Badges Indicator */}
      <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[#DAD4C7]/60 text-xs text-[#6F6A60]">
        <span>
          Showing <strong className="text-[#252525]">{totalResults}</strong> curated destinations
        </span>

        {/* Active filter pills */}
        <div className="flex items-center gap-1.5 flex-wrap">
          {filterState.selectedRegion && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FCFAF5] border border-[#DAD4C7] text-[11px] text-[#252525]">
              Region: {filterState.selectedRegion}
              <button
                type="button"
                onClick={() => onFilterChange({ selectedRegion: '' })}
                className="hover:text-[#D96B43]"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
          {filterState.selectedTravelStyle && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#FCFAF5] border border-[#DAD4C7] text-[11px] text-[#252525]">
              Style: {filterState.selectedTravelStyle}
              <button
                type="button"
                onClick={() => onFilterChange({ selectedTravelStyle: '' })}
                className="hover:text-[#D96B43]"
              >
                <X className="w-2.5 h-2.5" />
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
