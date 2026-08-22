import React, { useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Filter,
  RotateCcw,
  Globe,
} from 'lucide-react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { SearchToolbar } from '../components/discovery/SearchToolbar';
import { SortDropdown, SortOption } from '../components/discovery/SortDropdown';
import { GroupByDropdown, GroupByOptionItem } from '../components/discovery/GroupByDropdown';
import { ActiveFilterChips, FilterChip } from '../components/discovery/ActiveFilterChips';
import { CityCard } from '../components/discovery/CityCard';
import { CityDetailsModal } from '../components/discovery/CityDetailsModal';
import { AddToTripModal } from '../components/discovery/AddToTripModal';
import { Footer } from '../components/ui/Footer';
import { Button } from '../components/ui/Button';
import { catalogService } from '../services/catalogService';
import { Destination, CityFilterState, CityGroupByOption, CitySortOption } from '../types/landing';
import { authService } from '../services/authService';
import { tripService } from '../services/tripService';
import { Trip, ActivityItem } from '../types/trip';
import { useToast } from '../context/ToastContext';

const sortOptions: SortOption<CitySortOption>[] = [
  { value: 'popular-desc', label: 'Popularity: High to Low' },
  { value: 'popular-asc', label: 'Popularity: Low to High' },
  { value: 'rating-desc', label: 'Rating: High to Low' },
  { value: 'cost-asc', label: 'Cost: Low to High' },
  { value: 'cost-desc', label: 'Cost: High to Low' },
  { value: 'name-asc', label: 'Name: A to Z' },
  { value: 'name-desc', label: 'Name: Z to A' },
];

const groupByOptions: GroupByOptionItem<CityGroupByOption>[] = [
  { value: 'none', label: 'No Grouping' },
  { value: 'country', label: 'Country' },
  { value: 'region', label: 'Region' },
  { value: 'priceLevel', label: 'Cost Level' },
  { value: 'travelStyle', label: 'Travel Style' },
];

export const CitySearch: React.FC = () => {
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [isLoadingCities, setIsLoadingCities] = useState(true);

  // Filter State
  const [filters, setFilters] = useState<CityFilterState>({
    searchQuery: '',
    selectedRegion: 'all',
    selectedCountry: 'all',
    selectedTravelStyle: 'all',
    selectedPriceLevel: 'all',
    minRating: 0,
    groupBy: 'none',
    sortBy: 'popular-desc',
  });

  // Modal States
  const [selectedCityForDetails, setSelectedCityForDetails] = useState<Destination | null>(null);
  const [targetForAddToTrip, setTargetForAddToTrip] = useState<
    | { type: 'city'; destination: Destination }
    | { type: 'activity'; activity: ActivityItem }
    | null
  >(null);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);

  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    if (user) {
      void tripService.getUserTrips(user.id).then(setUserTrips);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setIsLoadingCities(true);
      try {
        const cities = await catalogService.getCities();
        if (!cancelled) setDestinations(cities);
      } catch {
        if (!cancelled) {
          showToast('error', 'Could not load cities', 'Please check your connection and try again.');
        }
      } finally {
        if (!cancelled) setIsLoadingCities(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Extract unique regions & countries
  const availableRegions = useMemo(() => {
    const set = new Set<string>();
    destinations.forEach((d) => set.add(d.region));
    return ['all', ...Array.from(set).sort()];
  }, [destinations]);

  const availableCountries = useMemo(() => {
    const set = new Set<string>();
    destinations.forEach((d) => {
      if (filters.selectedRegion === 'all' || d.region === filters.selectedRegion) {
        set.add(d.country);
      }
    });
    return ['all', ...Array.from(set).sort()];
  }, [filters.selectedRegion, destinations]);

  const availableTravelStyles = useMemo(() => {
    const set = new Set<string>();
    destinations.forEach((d) => set.add(d.travelStyle));
    return ['all', ...Array.from(set).sort()];
  }, [destinations]);

  // Filter & Sort Logic
  const filteredDestinations = useMemo(() => {
    let result = [...destinations];

    // 1. Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      result = result.filter(
        (d) =>
          d.city.toLowerCase().includes(q) ||
          d.country.toLowerCase().includes(q) ||
          d.region.toLowerCase().includes(q) ||
          d.highlight.toLowerCase().includes(q) ||
          d.tags.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 2. Region Filter
    if (filters.selectedRegion !== 'all') {
      result = result.filter((d) => d.region === filters.selectedRegion);
    }

    // 3. Country Filter
    if (filters.selectedCountry !== 'all') {
      result = result.filter((d) => d.country === filters.selectedCountry);
    }

    // 4. Travel Style Filter
    if (filters.selectedTravelStyle !== 'all') {
      result = result.filter((d) => d.travelStyle === filters.selectedTravelStyle);
    }

    // 5. Price Level Filter
    if (filters.selectedPriceLevel !== 'all') {
      result = result.filter((d) => d.priceLevel === filters.selectedPriceLevel);
    }

    // 6. Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'popular-desc':
          return b.reviewCount - a.reviewCount;
        case 'popular-asc':
          return a.reviewCount - b.reviewCount;
        case 'rating-desc':
          return b.rating - a.rating;
        case 'cost-asc': {
          const costScore = { Budget: 1, Moderate: 2, Luxury: 3 };
          return costScore[a.priceLevel] - costScore[b.priceLevel];
        }
        case 'cost-desc': {
          const costScore = { Budget: 1, Moderate: 2, Luxury: 3 };
          return costScore[b.priceLevel] - costScore[a.priceLevel];
        }
        case 'name-asc':
          return a.city.localeCompare(b.city);
        case 'name-desc':
          return b.city.localeCompare(a.city);
        default:
          return 0;
      }
    });

    return result;
  }, [filters, destinations]);

  // Grouping Logic
  const groupedDestinations = useMemo(() => {
    if (filters.groupBy === 'none') {
      return null;
    }

    const groups: { [key: string]: Destination[] } = {};

    filteredDestinations.forEach((d) => {
      let key = 'Other';
      if (filters.groupBy === 'country') key = d.country;
      else if (filters.groupBy === 'region') key = d.region;
      else if (filters.groupBy === 'priceLevel') key = `${d.priceLevel} Cost Level`;
      else if (filters.groupBy === 'travelStyle') key = `${d.travelStyle} Style`;

      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });

    return groups;
  }, [filteredDestinations, filters.groupBy]);

  // Active filter chips list
  const activeChips: FilterChip[] = useMemo(() => {
    const list: FilterChip[] = [];

    if (filters.selectedRegion !== 'all') {
      list.push({
        id: 'region',
        label: 'Region',
        value: filters.selectedRegion,
        onRemove: () => setFilters((f) => ({ ...f, selectedRegion: 'all' })),
      });
    }

    if (filters.selectedCountry !== 'all') {
      list.push({
        id: 'country',
        label: 'Country',
        value: filters.selectedCountry,
        onRemove: () => setFilters((f) => ({ ...f, selectedCountry: 'all' })),
      });
    }

    if (filters.selectedTravelStyle !== 'all') {
      list.push({
        id: 'style',
        label: 'Style',
        value: filters.selectedTravelStyle,
        onRemove: () => setFilters((f) => ({ ...f, selectedTravelStyle: 'all' })),
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

    return list;
  }, [filters]);

  const activeFilterCount =
    (filters.selectedRegion !== 'all' ? 1 : 0) +
    (filters.selectedCountry !== 'all' ? 1 : 0) +
    (filters.selectedTravelStyle !== 'all' ? 1 : 0) +
    (filters.selectedPriceLevel !== 'all' ? 1 : 0);

  const handleClearAllFilters = () => {
    setFilters({
      searchQuery: '',
      selectedRegion: 'all',
      selectedCountry: 'all',
      selectedTravelStyle: 'all',
      selectedPriceLevel: 'all',
      minRating: 0,
      groupBy: 'none',
      sortBy: 'popular-desc',
    });
  };

  const handleToggleWishlist = async (destId: string) => {
    if (!currentUser) {
      showToast('info', 'Sign in to Save', 'Please sign in to add destinations to your wishlist.');
      return;
    }
    const updated = await authService.toggleSavedDestination(currentUser.id, destId);
    if (updated) {
      setCurrentUser(updated);
      showToast('info', 'Wishlist Updated', 'Destination saved in your profile.');
    }
  };

  const isCityInAnyUserTrip = (city: string) => {
    return userTrips.some((t) =>
      t.destinations?.some((d) => d.city.toLowerCase() === city.toLowerCase())
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
              <Globe className="w-3.5 h-3.5" /> City Discovery
            </div>
            <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#252525] tracking-tight">
              Explore Cities
            </h1>
            <p className="text-xs sm:text-sm text-[#6F6A60] max-w-2xl">
              Discover destinations and find the perfect places for your next adventure.
            </p>
          </div>

          <Link to="/activities">
            <Button
              variant="outline"
              size="sm"
              leftIcon={<Compass className="w-4 h-4 text-[#C29326]" />}
              className="text-xs font-bold"
            >
              Browse Activities & Experiences
            </Button>
          </Link>
        </div>

        {/* Search & Filter Toolbar */}
        <SearchToolbar
          searchQuery={filters.searchQuery}
          onSearchChange={(val) => setFilters((f) => ({ ...f, searchQuery: val }))}
          placeholder="Search cities, countries, or regions (e.g. Paris, Tokyo, Italy, Bali)..."
          resultCount={filteredDestinations.length}
          resultLabel={filteredDestinations.length === 1 ? 'city destination' : 'city destinations'}
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

          {/* Region Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[#6F6A60] font-medium">Region:</span>
            <select
              value={filters.selectedRegion}
              onChange={(e) =>
                setFilters((f) => ({ ...f, selectedRegion: e.target.value, selectedCountry: 'all' }))
              }
              className="h-8 px-2.5 bg-white border border-[#DAD4C7] rounded-xl font-semibold text-[#252525] focus:outline-none cursor-pointer"
            >
              <option value="all">All Regions</option>
              {availableRegions
                .filter((r) => r !== 'all')
                .map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
            </select>
          </div>

          {/* Country Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[#6F6A60] font-medium">Country:</span>
            <select
              value={filters.selectedCountry}
              onChange={(e) => setFilters((f) => ({ ...f, selectedCountry: e.target.value }))}
              className="h-8 px-2.5 bg-white border border-[#DAD4C7] rounded-xl font-semibold text-[#252525] focus:outline-none cursor-pointer"
            >
              <option value="all">All Countries</option>
              {availableCountries
                .filter((c) => c !== 'all')
                .map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
            </select>
          </div>

          {/* Travel Style Selector */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[#6F6A60] font-medium">Style:</span>
            <select
              value={filters.selectedTravelStyle}
              onChange={(e) => setFilters((f) => ({ ...f, selectedTravelStyle: e.target.value }))}
              className="h-8 px-2.5 bg-white border border-[#DAD4C7] rounded-xl font-semibold text-[#252525] focus:outline-none cursor-pointer"
            >
              <option value="all">All Styles</option>
              {availableTravelStyles
                .filter((s) => s !== 'all')
                .map((s) => (
                  <option key={s} value={s}>
                    {s}
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
              <option value="all">All Costs</option>
              <option value="Budget">Budget</option>
              <option value="Moderate">Moderate</option>
              <option value="Luxury">Luxury</option>
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
              <span className="text-xs font-bold text-[#252525]">Filter Destinations</span>
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
                <label className="block text-[#6F6A60] mb-1 font-medium">Region</label>
                <select
                  value={filters.selectedRegion}
                  onChange={(e) =>
                    setFilters((f) => ({ ...f, selectedRegion: e.target.value, selectedCountry: 'all' }))
                  }
                  className="w-full h-10 px-3 bg-white border border-[#DAD4C7] rounded-xl font-semibold text-[#252525]"
                >
                  <option value="all">All Regions</option>
                  {availableRegions
                    .filter((r) => r !== 'all')
                    .map((r) => (
                      <option key={r} value={r}>
                        {r}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[#6F6A60] mb-1 font-medium">Country</label>
                <select
                  value={filters.selectedCountry}
                  onChange={(e) => setFilters((f) => ({ ...f, selectedCountry: e.target.value }))}
                  className="w-full h-10 px-3 bg-white border border-[#DAD4C7] rounded-xl font-semibold text-[#252525]"
                >
                  <option value="all">All Countries</option>
                  {availableCountries
                    .filter((c) => c !== 'all')
                    .map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-[#6F6A60] mb-1 font-medium">Travel Style</label>
                <select
                  value={filters.selectedTravelStyle}
                  onChange={(e) => setFilters((f) => ({ ...f, selectedTravelStyle: e.target.value }))}
                  className="w-full h-10 px-3 bg-white border border-[#DAD4C7] rounded-xl font-semibold text-[#252525]"
                >
                  <option value="all">All Styles</option>
                  {availableTravelStyles
                    .filter((s) => s !== 'all')
                    .map((s) => (
                      <option key={s} value={s}>
                        {s}
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
                  <option value="all">All Costs</option>
                  <option value="Budget">Budget</option>
                  <option value="Moderate">Moderate</option>
                  <option value="Luxury">Luxury</option>
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Active Filter Chips */}
        <ActiveFilterChips chips={activeChips} onClearAll={handleClearAllFilters} />

        {/* Destination Results Grid / Grouped Sections */}
        {isLoadingCities ? (
          <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-8 sm:p-14 text-center space-y-3 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#FCFAF5] border border-[#DAD4C7] flex items-center justify-center mx-auto text-[#C29326] animate-pulse">
              <Globe className="w-7 h-7" />
            </div>
            <p className="text-xs text-[#6F6A60]">Loading destinations…</p>
          </div>
        ) : filteredDestinations.length === 0 ? (
          /* Empty State */
          <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-8 sm:p-14 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#FCFAF5] border border-[#DAD4C7] flex items-center justify-center mx-auto text-[#C29326]">
              <Compass className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-[#252525]">
                No destinations found
              </h3>
              <p className="text-xs text-[#6F6A60] max-w-sm mx-auto">
                We couldn't find any cities matching your current filters. Try changing keywords or resetting filter criteria.
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
        ) : groupedDestinations ? (
          /* Grouped Results Sections */
          <div className="space-y-8">
            {Object.entries(groupedDestinations).map(([groupTitle, list]) => (
              <section key={groupTitle} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#DAD4C7]">
                  <h2 className="text-lg font-serif font-bold text-[#252525] flex items-center gap-2">
                    <span>{groupTitle}</span>
                    <span className="text-xs font-sans font-semibold text-[#8C867B] bg-[#FCFAF5] px-2 py-0.5 rounded-full border border-[#DAD4C7]">
                      {list.length} {list.length === 1 ? 'city' : 'cities'}
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {list.map((dest) => (
                    <CityCard
                      key={dest.id}
                      destination={dest}
                      onViewDetails={(d) => setSelectedCityForDetails(d)}
                      onAddToTrip={(d) => setTargetForAddToTrip({ type: 'city', destination: d })}
                      isAdded={isCityInAnyUserTrip(dest.city)}
                      isWishlisted={currentUser?.savedDestinationIds?.includes(dest.id)}
                      onToggleWishlist={handleToggleWishlist}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Ungrouped Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredDestinations.map((dest) => (
              <CityCard
                key={dest.id}
                destination={dest}
                onViewDetails={(d) => setSelectedCityForDetails(d)}
                onAddToTrip={(d) => setTargetForAddToTrip({ type: 'city', destination: d })}
                isAdded={isCityInAnyUserTrip(dest.city)}
                isWishlisted={currentUser?.savedDestinationIds?.includes(dest.id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        )}
      </main>

      {/* City Details Modal */}
      <CityDetailsModal
        isOpen={Boolean(selectedCityForDetails)}
        onClose={() => setSelectedCityForDetails(null)}
        destination={selectedCityForDetails}
        onAddToTrip={(dest) => {
          setSelectedCityForDetails(null);
          setTargetForAddToTrip({ type: 'city', destination: dest });
        }}
        onSelectActivity={(act) => {
          setSelectedCityForDetails(null);
          setTargetForAddToTrip({ type: 'activity', activity: act });
        }}
        isAddedToActiveTrip={
          selectedCityForDetails ? isCityInAnyUserTrip(selectedCityForDetails.city) : false
        }
      />

      {/* Add To Trip Modal */}
      <AddToTripModal
        isOpen={Boolean(targetForAddToTrip)}
        onClose={() => setTargetForAddToTrip(null)}
        target={targetForAddToTrip}
        onSuccess={() => {
          if (currentUser) {
            void tripService.getUserTrips(currentUser.id).then(setUserTrips);
          }
        }}
      />

      {/* Universal Footer */}
      <Footer />
    </div>
  );
};
