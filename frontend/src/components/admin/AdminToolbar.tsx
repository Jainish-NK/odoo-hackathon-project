import React from 'react';
import { Search, RotateCcw, Filter, ArrowUpDown, Layers } from 'lucide-react';
import { AdminTabType, AdminFilterState } from '../../types/admin';

interface AdminToolbarProps {
  activeTab: AdminTabType;
  filters: AdminFilterState;
  onFilterChange: (updates: Partial<AdminFilterState>) => void;
  onReset: () => void;
}

export const AdminToolbar: React.FC<AdminToolbarProps> = ({
  activeTab,
  filters,
  onFilterChange,
  onReset,
}) => {
  const getSearchPlaceholder = () => {
    switch (activeTab) {
      case 'users':
        return 'Search travelers by name, email, country, or city...';
      case 'cities':
        return 'Search destination cities, countries, or regions...';
      case 'activities':
        return 'Search activities by title, destination, or category...';
      case 'analytics':
        return 'Search metrics, trend periods, or category breakdowns...';
    }
  };

  const renderFilterOptions = () => {
    switch (activeTab) {
      case 'users':
        return (
          <>
            <option value="all">All Statuses</option>
            <option value="Active">Active Users</option>
            <option value="Inactive">Inactive Users</option>
            <option value="Pending">Pending Verification</option>
          </>
        );
      case 'cities':
        return (
          <>
            <option value="all">All Regions</option>
            <option value="East Asia">East Asia</option>
            <option value="Western Europe">Western Europe</option>
            <option value="Southern Europe">Southern Europe</option>
            <option value="Central Europe">Central Europe</option>
            <option value="Southeast Asia">Southeast Asia</option>
          </>
        );
      case 'activities':
        return (
          <>
            <option value="all">All Categories</option>
            <option value="Food">Food & Dining</option>
            <option value="Adventure">Outdoor & Adventure</option>
            <option value="Culture">Culture & Heritage</option>
            <option value="Nature">Nature & Scenic</option>
            <option value="Sightseeing">Sightseeing Tours</option>
          </>
        );
      case 'analytics':
        return (
          <>
            <option value="all">All Metrics</option>
            <option value="users">User Growth</option>
            <option value="trips">Trip Volume</option>
            <option value="budget">Spending Trends</option>
          </>
        );
    }
  };

  const renderGroupByOptions = () => {
    switch (activeTab) {
      case 'users':
        return (
          <>
            <option value="none">No Grouping</option>
            <option value="country">By Country</option>
            <option value="status">By Status</option>
            <option value="role">By Role</option>
          </>
        );
      case 'cities':
        return (
          <>
            <option value="none">No Grouping</option>
            <option value="region">By Region</option>
            <option value="popularity">By Popularity Tier</option>
          </>
        );
      case 'activities':
        return (
          <>
            <option value="none">No Grouping</option>
            <option value="category">By Category</option>
            <option value="city">By Destination City</option>
          </>
        );
      case 'analytics':
        return (
          <>
            <option value="none">Daily View</option>
            <option value="weekly">Weekly Aggregates</option>
            <option value="monthly">Monthly Trajectory</option>
          </>
        );
    }
  };

  const renderSortOptions = () => {
    switch (activeTab) {
      case 'users':
        return (
          <>
            <option value="newest">Newest Joined</option>
            <option value="trips-desc">Most Active Trips</option>
            <option value="spend-desc">Highest Total Spend</option>
            <option value="name-asc">Name: A to Z</option>
            <option value="name-desc">Name: Z to A</option>
          </>
        );
      case 'cities':
        return (
          <>
            <option value="popular-desc">Most Popular (#1 Rank)</option>
            <option value="trips-desc">Highest Trips Created</option>
            <option value="users-desc">Most Travelers</option>
            <option value="budget-desc">Highest Average Budget</option>
            <option value="budget-asc">Lowest Average Budget</option>
            <option value="name-asc">City: A to Z</option>
          </>
        );
      case 'activities':
        return (
          <>
            <option value="popular-desc">Most Booked / Added</option>
            <option value="rating-desc">Highest Rated (★ 5.0)</option>
            <option value="trips-desc">Most Itineraries</option>
            <option value="name-asc">Title: A to Z</option>
          </>
        );
      case 'analytics':
        return (
          <>
            <option value="newest">Latest Performance</option>
            <option value="growth-desc">Highest Growth</option>
          </>
        );
    }
  };

  const hasActiveFilters =
    Boolean(filters.searchQuery) ||
    filters.filterValue !== 'all' ||
    filters.groupBy !== 'none';

  return (
    <div className="bg-[#FFF9EE] p-4 sm:p-5 rounded-3xl border border-[#DAD4C7]/80 space-y-3 shadow-2xs">
      <div className="flex flex-col lg:flex-row lg:items-center gap-3">
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C867B]" />
          <input
            type="text"
            value={filters.searchQuery}
            onChange={(e) => onFilterChange({ searchQuery: e.target.value })}
            placeholder={getSearchPlaceholder()}
            className="w-full h-10 pl-10 pr-8 bg-white border border-[#DAD4C7] rounded-xl text-xs text-[#252525] focus:outline-none focus:border-[#E3B443] focus:ring-2 focus:ring-[#F4C95D]/20 font-medium"
          />
          {filters.searchQuery && (
            <button
              type="button"
              onClick={() => onFilterChange({ searchQuery: '' })}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C867B] hover:text-[#252525] cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Controls: Group By, Filter, Sort By */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          {/* Group By */}
          <div className="flex items-center gap-1.5 bg-white border border-[#DAD4C7] rounded-xl px-2.5 h-10">
            <Layers className="w-3.5 h-3.5 text-[#8C867B]" />
            <span className="text-[#8C867B] font-medium hidden sm:inline">Group:</span>
            <select
              value={filters.groupBy}
              onChange={(e) => onFilterChange({ groupBy: e.target.value })}
              className="bg-transparent font-semibold text-[#252525] focus:outline-none cursor-pointer pr-1"
            >
              {renderGroupByOptions()}
            </select>
          </div>

          {/* Filter */}
          <div className="flex items-center gap-1.5 bg-white border border-[#DAD4C7] rounded-xl px-2.5 h-10">
            <Filter className="w-3.5 h-3.5 text-[#8C867B]" />
            <span className="text-[#8C867B] font-medium hidden sm:inline">Filter:</span>
            <select
              value={filters.filterValue}
              onChange={(e) => onFilterChange({ filterValue: e.target.value })}
              className="bg-transparent font-semibold text-[#252525] focus:outline-none cursor-pointer pr-1"
            >
              {renderFilterOptions()}
            </select>
          </div>

          {/* Sort By */}
          <div className="flex items-center gap-1.5 bg-white border border-[#DAD4C7] rounded-xl px-2.5 h-10">
            <ArrowUpDown className="w-3.5 h-3.5 text-[#8C867B]" />
            <span className="text-[#8C867B] font-medium hidden sm:inline">Sort:</span>
            <select
              value={filters.sortBy}
              onChange={(e) => onFilterChange({ sortBy: e.target.value })}
              className="bg-transparent font-semibold text-[#252525] focus:outline-none cursor-pointer pr-1"
            >
              {renderSortOptions()}
            </select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              type="button"
              onClick={onReset}
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
