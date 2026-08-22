import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  MapPin,
  Filter,
  RotateCcw,
  Ticket,
} from 'lucide-react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { SearchToolbar } from '../components/discovery/SearchToolbar';
import { SortDropdown, SortOption } from '../components/discovery/SortDropdown';
import { GroupByDropdown, GroupByOptionItem } from '../components/discovery/GroupByDropdown';
import { ActiveFilterChips, FilterChip } from '../components/discovery/ActiveFilterChips';
import { ActivityCard } from '../components/discovery/ActivityCard';
import { ActivityDetailsModal } from '../components/discovery/ActivityDetailsModal';
import { AddToTripModal } from '../components/discovery/AddToTripModal';
import { Button } from '../components/ui/Button';
import { allActivitiesList } from '../data/tripSuggestions';
import { ActivityItem, ActivityFilterState, ActivityGroupByOption, ActivitySortOption, Trip } from '../types/trip';
import { authService } from '../services/authService';
import { tripService } from '../services/tripService';

const sortOptions: SortOption<ActivitySortOption>[] = [
  { value: 'rating-desc', label: 'Rating: High to Low' },
  { value: 'price-asc', label: 'Price: Low to High' },
  { value: 'price-desc', label: 'Price: High to Low' },
  { value: 'duration-asc', label: 'Duration: Shortest to Longest' },
  { value: 'duration-desc', label: 'Duration: Longest to Shortest' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

const groupByOptions: GroupByOptionItem<ActivityGroupByOption>[] = [
  { value: 'none', label: 'No Grouping' },
  { value: 'category', label: 'Category' },
  { value: 'city', label: 'City' },
  { value: 'priceLevel', label: 'Cost Level' },
];

export const ActivitySearch: React.FC = () => {
  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [userTrips, setUserTrips] = useState<Trip[]>([]);

  // Filter State
  const [filters, setFilters] = useState<ActivityFilterState>({
    searchQuery: '',
    selectedCity: 'all',
    selectedCategory: 'all',
    selectedPriceLevel: 'all',
    selectedDuration: 'all',
    minRating: 0,
    groupBy: 'none',
    sortBy: 'rating-desc',
  });

  // Modal States
  const [selectedActivityForDetails, setSelectedActivityForDetails] = useState<ActivityItem | null>(null);
  const [targetForAddToTrip, setTargetForAddToTrip] = useState<{
    type: 'activity';
    activity: ActivityItem;
  } | null>(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      const trips = tripService.getUserTrips(user.id);
      setUserTrips(trips);
    }
  }, []);

  // Extract unique cities and categories
  const availableCities = useMemo(() => {
    const set = new Set<string>();
    allActivitiesList.forEach((a) => set.add(a.city));
    return ['all', ...Array.from(set).sort()];
  }, []);

  const availableCategories = useMemo(() => {
    const set = new Set<string>();
    allActivitiesList.forEach((a) => set.add(a.category));
    return ['all', ...Array.from(set).sort()];
  }, []);

  // Filter & Sort Logic
  const filteredActivities = useMemo(() => {
    let result = [...allActivitiesList];

    // 1. Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      result = result.filter(
        (a) =>
          a.name.toLowerCase().includes(q) ||
          a.city.toLowerCase().includes(q) ||
          a.country.toLowerCase().includes(q) ||
          a.category.toLowerCase().includes(q) ||
          a.description.toLowerCase().includes(q) ||
          a.highlights?.some((h) => h.toLowerCase().includes(q))
      );
    }

    // 2. City Filter
    if (filters.selectedCity !== 'all') {
      result = result.filter((a) => a.city === filters.selectedCity);
    }

    // 3. Category Filter
    if (filters.selectedCategory !== 'all') {
      result = result.filter((a) => a.category === filters.selectedCategory);
    }

    // 4. Price Level Filter
    if (filters.selectedPriceLevel !== 'all') {
      result = result.filter((a) => a.priceLevel === filters.selectedPriceLevel);
    }

    // 5. Duration Filter
    if (filters.selectedDuration !== 'all') {
      result = result.filter((a) => {
        const hrs = a.durationHours || 2;
        switch (filters.selectedDuration) {
          case 'under1':
            return hrs < 1;
          case '1to3':
            return hrs >= 1 && hrs <= 3;
          case '3to6':
            return hrs > 3 && hrs <= 6;
          case 'over6':
            return hrs > 6;
          default:
            return true;
        }
      });
    }

    // 6. Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'rating-desc':
          return b.rating - a.rating;
        case 'price-asc':
          return a.costNumeric - b.costNumeric;
        case 'price-desc':
          return b.costNumeric - a.costNumeric;
        case 'duration-asc':
          return (a.durationHours || 0) - (b.durationHours || 0);
        case 'duration-desc':
          return (b.durationHours || 0) - (a.durationHours || 0);
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return result;
  }, [filters]);

  // Grouping Logic
  const groupedActivities = useMemo(() => {
    if (filters.groupBy === 'none') {
      return null;
    }

    const groups: { [key: string]: ActivityItem[] } = {};

    filteredActivities.forEach((a) => {
      let key = 'Other';
      if (filters.groupBy === 'category') key = `${a.category} Experiences`;
      else if (filters.groupBy === 'city') key = `${a.city}, ${a.country}`;
      else if (filters.groupBy === 'priceLevel') key = `${a.priceLevel} Pricing`;

      if (!groups[key]) groups[key] = [];
      groups[key].push(a);
    });

    return groups;
  }, [filteredActivities, filters.groupBy]);

  // Active filter chips list
  const activeChips: FilterChip[] = useMemo(() => {
    const list: FilterChip[] = [];

    if (filters.selectedCity !== 'all') {
      list.push({
        id: 'city',
        label: 'City',
        value: filters.selectedCity,
        onRemove: () => setFilters((f) => ({ ...f, selectedCity: 'all' })),
      });
    }

    if (filters.selectedCategory !== 'all') {
      list.push({
        id: 'category',
        label: 'Category',
        value: filters.selectedCategory,
        onRemove: () => setFilters((f) => ({ ...f, selectedCategory: 'all' })),
      });
    }

    if (filters.selectedPriceLevel !== 'all') {
      list.push({
        id: 'price',
        label: 'Cost',
        value: filters.selectedPriceLevel,
        onRemove: () => setFilters((f) => ({ ...f, selectedPriceLevel: 'all' })),
      });
    }

    if (filters.selectedDuration !== 'all') {
      const labels: { [key: string]: string } = {
        under1: '< 1 hr',
        '1to3': '1–3 hrs',
        '3to6': '3–6 hrs',
        over6: '6+ hrs',
      };
      list.push({
        id: 'duration',
        label: 'Duration',
        value: labels[filters.selectedDuration] || filters.selectedDuration,
        onRemove: () => setFilters((f) => ({ ...f, selectedDuration: 'all' })),
      });
    }

    return list;
  }, [filters]);

  const activeFilterCount =
    (filters.selectedCity !== 'all' ? 1 : 0) +
    (filters.selectedCategory !== 'all' ? 1 : 0) +
    (filters.selectedPriceLevel !== 'all' ? 1 : 0) +
    (filters.selectedDuration !== 'all' ? 1 : 0);

  const handleClearAllFilters = () => {
    setFilters({
      searchQuery: '',
      selectedCity: 'all',
      selectedCategory: 'all',
      selectedPriceLevel: 'all',
      selectedDuration: 'all',
      minRating: 0,
      groupBy: 'none',
      sortBy: 'rating-desc',
    });
  };

  const isActivityInAnyUserTrip = (activityName: string) => {
    return userTrips.some((t) =>
      t.sections?.some((s) => s.title.toLowerCase() === activityName.toLowerCase())
    );
  };

  return (
    <div className="min-h-screen bg-[#F7F1E5] text-[#252525] flex flex-col justify-between selection:bg-[#F4C95D]/40">
      {/* 1. Global Navigation */}
      <LandingNavbar />

      {/* 2. Main Discovery Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-6">
        {/* Header Title Section */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EFEA] border border-[#C2D7CC] text-xs font-bold text-[#4E7360] mb-1">
              <Ticket className="w-3.5 h-3.5" /> Experiences & Activities
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#252525] tracking-tight">
              Discover Things To Do
            </h1>
            <p className="text-xs sm:text-sm text-[#6F6A60] max-w-2xl">
              Find experiences, attractions, food tours and adventures for your trip.
            </p>
          </div>

          <Link to="/cities">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<MapPin className="w-4 h-4 text-[#C29326]" />}
              className="text-xs font-bold"
            >
              Explore Destinations & Cities
            </Button>
          </Link>
        </div>

        {/* Search & Filter Toolbar */}
        <SearchToolbar
          searchQuery={filters.searchQuery}
          onSearchChange={(val) => setFilters((f) => ({ ...f, searchQuery: val }))}
          placeholder="Search activities, experiences, food tours or sights (e.g. Louvre, Safari, Cooking)..."
          resultCount={filteredActivities.length}
          resultLabel={filteredActivities.length === 1 ? 'activity' : 'activities'}
          onOpenMobileFilters={() => setIsMobileFiltersOpen(true)}
          activeFilterCount={activeFilterCount}
          groupByControl={
            <GroupByDropdown
              value={filters.groupBy}
              onChange={(val) => setFilters((f) => ({ ...f, groupBy: val }))}
              options={groupByOptions}
              label="Group"
            />
          }
          sortControl={
            <SortDropdown
              value={filters.sortBy}
              onChange={(val) => setFilters((f) => ({ ...f, sortBy: val }))}
              options={sortOptions}
              label="Sort"
            />
          }
        />

        {/* Desktop Filter Bar */}
        <div className="hidden lg:flex items-center gap-3 p-3.5 bg-[#FFF9EE] rounded-2xl border border-[#DAD4C7]/80 overflow-x-auto text-xs">
          <div className="flex items-center gap-1.5 text-[#8C867B] font-bold shrink-0 mr-1">
            <Filter className="w-3.5 h-3.5 text-[#C29326]" /> Filters:
          </div>

          {/* City Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[#6F6A60] font-medium">City:</span>
            <select
              value={filters.selectedCity}
              onChange={(e) => setFilters((f) => ({ ...f, selectedCity: e.target.value }))}
              className="h-8 px-2.5 bg-white border border-[#DAD4C7] rounded-xl font-semibold text-[#252525] focus:outline-none cursor-pointer"
            >
              <option value="all">All Cities</option>
              {availableCities
                .filter((c) => c !== 'all')
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>

          {/* Category Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[#6F6A60] font-medium">Category:</span>
            <select
              value={filters.selectedCategory}
              onChange={(e) => setFilters((f) => ({ ...f, selectedCategory: e.target.value }))}
              className="h-8 px-2.5 bg-white border border-[#DAD4C7] rounded-xl font-semibold text-[#252525] focus:outline-none cursor-pointer"
            >
              <option value="all">All Categories</option>
              {availableCategories
                .filter((cat) => cat !== 'all')
                .map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
            </select>
          </div>

          {/* Cost Level Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[#6F6A60] font-medium">Cost:</span>
            <select
              value={filters.selectedPriceLevel}
              onChange={(e) => setFilters((f) => ({ ...f, selectedPriceLevel: e.target.value }))}
              className="h-8 px-2.5 bg-white border border-[#DAD4C7] rounded-xl font-semibold text-[#252525] focus:outline-none cursor-pointer"
            >
              <option value="all">All Pricing</option>
              <option value="Free">Free</option>
              <option value="Budget">Budget</option>
              <option value="Moderate">Moderate</option>
              <option value="Premium">Premium</option>
            </select>
          </div>

          {/* Duration Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[#6F6A60] font-medium">Duration:</span>
            <select
              value={filters.selectedDuration}
              onChange={(e) => setFilters((f) => ({ ...f, selectedDuration: e.target.value }))}
              className="h-8 px-2.5 bg-white border border-[#DAD4C7] rounded-xl font-semibold text-[#252525] focus:outline-none cursor-pointer"
            >
              <option value="all">Any Duration</option>
              <option value="under1">&lt; 1 Hour</option>
              <option value="1to3">1 – 3 Hours</option>
              <option value="3to6">3 – 6 Hours</option>
              <option value="over6">6+ Hours</option>
            </select>
          </div>

          {activeFilterCount > 0 && (
            <button
              type="button"
              onClick={handleClearAllFilters}
              className="ml-auto text-xs font-bold text-[#D96B43] hover:underline flex items-center gap-1 shrink-0 cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" /> Reset
            </button>
          )}
        </div>

        {/* Mobile Filters Drawer / Bar */}
        {isMobileFiltersOpen && (
          <div className="p-4 bg-[#FFF9EE] rounded-2xl border border-[#DAD4C7] space-y-3 lg:hidden animate-in fade-in duration-150">
            <div className="flex items-center justify-between pb-2 border-b border-[#DAD4C7]">
              <span className="text-xs font-bold text-[#252525]">Filter Activities</span>
              <button
                type="button"
                onClick={() => setIsMobileFiltersOpen(false)}
                className="text-xs font-bold text-[#4E7360]"
              >
                Done
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div>
                <label className="block text-[#6F6A60] mb-1 font-medium">City</label>
                <select
                  value={filters.selectedCity}
                  onChange={(e) => setFilters((f) => ({ ...f, selectedCity: e.target.value }))}
                  className="w-full h-10 px-3 bg-white border border-[#DAD4C7] rounded-xl font-semibold text-[#252525]"
                >
                  <option value="all">All Cities</option>
                  {availableCities
                    .filter((c) => c !== 'all')
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[#6F6A60] mb-1 font-medium">Category</label>
                <select
                  value={filters.selectedCategory}
                  onChange={(e) => setFilters((f) => ({ ...f, selectedCategory: e.target.value }))}
                  className="w-full h-10 px-3 bg-white border border-[#DAD4C7] rounded-xl font-semibold text-[#252525]"
                >
                  <option value="all">All Categories</option>
                  {availableCategories
                    .filter((cat) => cat !== 'all')
                    .map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[#6F6A60] mb-1 font-medium">Cost Level</label>
                <select
                  value={filters.selectedPriceLevel}
                  onChange={(e) => setFilters((f) => ({ ...f, selectedPriceLevel: e.target.value }))}
                  className="w-full h-10 px-3 bg-white border border-[#DAD4C7] rounded-xl font-semibold text-[#252525]"
                >
                  <option value="all">All Pricing</option>
                  <option value="Free">Free</option>
                  <option value="Budget">Budget</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Premium">Premium</option>
                </select>
              </div>

              <div>
                <label className="block text-[#6F6A60] mb-1 font-medium">Duration</label>
                <select
                  value={filters.selectedDuration}
                  onChange={(e) => setFilters((f) => ({ ...f, selectedDuration: e.target.value }))}
                  className="w-full h-10 px-3 bg-white border border-[#DAD4C7] rounded-xl font-semibold text-[#252525]"
                >
                  <option value="all">Any Duration</option>
                  <option value="under1">&lt; 1 Hour</option>
                  <option value="1to3">1 – 3 Hours</option>
                  <option value="3to6">3 – 6 Hours</option>
                  <option value="over6">6+ Hours</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        <ActiveFilterChips chips={activeChips} onClearAll={handleClearAllFilters} />

        {/* Activity Results Grid / Grouped Sections */}
        {filteredActivities.length === 0 ? (
          /* Empty State */
          <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-8 sm:p-14 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#FCFAF5] border border-[#DAD4C7] flex items-center justify-center mx-auto text-[#4E7360]">
              <Ticket className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-[#252525]">
                No activities found
              </h3>
              <p className="text-xs text-[#6F6A60] max-w-sm mx-auto">
                We couldn't find any activities or tours matching your search criteria. Try removing some filters.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              leftIcon={<RotateCcw className="w-3.5 h-3.5" />}
              onClick={handleClearAllFilters}
            >
              Clear Search & Filters
            </Button>
          </div>
        ) : groupedActivities ? (
          /* Grouped Results Sections */
          <div className="space-y-8">
            {Object.entries(groupedActivities).map(([groupTitle, list]) => (
              <section key={groupTitle} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#DAD4C7]">
                  <h2 className="text-lg font-serif font-bold text-[#252525] flex items-center gap-2">
                    <span>{groupTitle}</span>
                    <span className="text-xs font-sans font-semibold text-[#8C867B] bg-[#FCFAF5] px-2 py-0.5 rounded-full border border-[#DAD4C7]">
                      {list.length} {list.length === 1 ? 'activity' : 'activities'}
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {list.map((act) => (
                    <ActivityCard
                      key={act.id}
                      activity={act}
                      onViewDetails={(a) => setSelectedActivityForDetails(a)}
                      onAddToTrip={(a) => setTargetForAddToTrip({ type: 'activity', activity: a })}
                      isAdded={isActivityInAnyUserTrip(act.name)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Ungrouped Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredActivities.map((act) => (
              <ActivityCard
                key={act.id}
                activity={act}
                onViewDetails={(a) => setSelectedActivityForDetails(a)}
                onAddToTrip={(a) => setTargetForAddToTrip({ type: 'activity', activity: a })}
                isAdded={isActivityInAnyUserTrip(act.name)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Activity Details Modal */}
      <ActivityDetailsModal
        isOpen={Boolean(selectedActivityForDetails)}
        onClose={() => setSelectedActivityForDetails(null)}
        activity={selectedActivityForDetails}
        onAddToTrip={(act) => {
          setSelectedActivityForDetails(null);
          setTargetForAddToTrip({ type: 'activity', activity: act });
        }}
        isAddedToActiveTrip={
          selectedActivityForDetails ? isActivityInAnyUserTrip(selectedActivityForDetails.name) : false
        }
      />

      {/* Add To Trip Modal */}
      <AddToTripModal
        isOpen={Boolean(targetForAddToTrip)}
        onClose={() => setTargetForAddToTrip(null)}
        target={targetForAddToTrip}
        onSuccess={() => {
          if (currentUser) {
            setUserTrips(tripService.getUserTrips(currentUser.id));
          }
        }}
      />

      {/* Footer */}
      <footer className="border-t border-[#DAD4C7]/80 bg-[#FFF9EE]/80 backdrop-blur-md mt-16 py-6 px-4 sm:px-8 text-center text-xs text-[#8C867B]">
        GlobeTrotter Personalized Travel Planning Platform • Experiences & Activities Catalog
      </footer>
    </div>
  );
};
