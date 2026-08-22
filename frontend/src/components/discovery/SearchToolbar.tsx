import React from 'react';
import { Search, X, SlidersHorizontal } from 'lucide-react';

export interface SearchToolbarProps {
  searchQuery: string;
  onSearchChange: (val: string) => void;
  placeholder?: string;
  resultCount: number;
  resultLabel?: string;
  onOpenMobileFilters?: () => void;
  activeFilterCount?: number;
  groupByControl?: React.ReactNode;
  sortControl?: React.ReactNode;
}

export const SearchToolbar: React.FC<SearchToolbarProps> = ({
  searchQuery,
  onSearchChange,
  placeholder = 'Search destinations, places, activities...',
  resultCount,
  resultLabel = 'results',
  onOpenMobileFilters,
  activeFilterCount = 0,
  groupByControl,
  sortControl,
}) => {
  return (
    <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-4 sm:p-5 shadow-sm space-y-4">
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 justify-between">
        {/* Search Input */}
        <div className="relative flex-1">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#8C867B] pointer-events-none">
            <Search className="w-4.5 h-4.5" />
          </div>

          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder={placeholder}
            className="w-full h-12 bg-white/90 border border-[#DAD4C7] rounded-2xl pl-11 pr-10 text-sm text-[#252525] placeholder:text-[#8C867B] focus:outline-none focus:border-[#E3B443] focus:ring-4 focus:ring-[#F4C95D]/20 transition-all"
          />

          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-1 text-[#8C867B] hover:text-[#252525] hover:bg-black/5 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Desktop Controls: Group By & Sort */}
        <div className="hidden lg:flex items-center gap-3 shrink-0">
          {groupByControl}
          {sortControl}
        </div>

        {/* Mobile / Tablet Filter & Sort Trigger Buttons */}
        <div className="flex lg:hidden items-center gap-2">
          {onOpenMobileFilters && (
            <button
              type="button"
              onClick={onOpenMobileFilters}
              className="flex-1 sm:flex-none h-11 px-4 rounded-xl bg-white border border-[#DAD4C7] text-xs font-bold text-[#252525] flex items-center justify-center gap-2 hover:bg-black/5 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#C29326]" />
              <span>Filters</span>
              {activeFilterCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-[#F4C95D] text-[10px] font-bold text-[#252525] flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </button>
          )}
          <div className="flex-1 sm:flex-none">
            {sortControl}
          </div>
          <div className="sm:hidden w-full">
            {groupByControl}
          </div>
        </div>
      </div>

      {/* Result Count and Quick Filter Summary */}
      <div className="flex items-center justify-between text-xs text-[#6F6A60] pt-1">
        <div className="flex items-center gap-2 font-medium">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#E7EFEA] text-[#4E7360] font-bold text-[11px]">
            {resultCount} {resultLabel}
          </span>
          {searchQuery && (
            <span className="text-[#8C867B] truncate max-w-xs sm:max-w-md">
              for "{searchQuery}"
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
