import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroBanner } from '../components/landing/HeroBanner';
import { FilterToolbar } from '../components/landing/FilterToolbar';
import { DestinationCard } from '../components/landing/DestinationCard';
import { PreviousTripCard } from '../components/landing/PreviousTripCard';
import { SectionHeader } from '../components/landing/SectionHeader';
import { Button } from '../components/ui/Button';
import { mockDestinations, mockPreviousTrips } from '../data/landingData';
import { Destination, FilterState, PreviousTrip } from '../types/landing';
import { Plus, Compass, MapPin, ShieldCheck, Heart } from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [destinations] = useState<Destination[]>(mockDestinations);
  const [trips, setTrips] = useState<PreviousTrip[]>(mockPreviousTrips);

  const handlePlanTrip = () => {
    if (authService.getCurrentUser()) {
      navigate('/trips/create');
    } else {
      showToast(
        'info',
        'Sign In Required',
        'Please sign in or register to create and customize your trip.'
      );
      navigate('/login?redirect=/trips/create', { state: { from: '/trips/create' } });
    }
  };

  const handleViewTrip = (selectedTrip: PreviousTrip) => {
    if (authService.getCurrentUser()) {
      navigate(`/trips/${selectedTrip.id}/itinerary`);
    } else {
      showToast('info', 'Sign In Required', 'Please sign in to view and customize your trip itinerary.');
      navigate(`/login?redirect=${encodeURIComponent(`/trips/${selectedTrip.id}/itinerary`)}`, {
        state: { from: `/trips/${selectedTrip.id}/itinerary` },
      });
    }
  };

  // Load custom created trips from storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('globetrotter_user_trips');
      if (stored) {
        const parsed: PreviousTrip[] = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // Merge unique user trips with default mock trips
          const merged = [...parsed, ...mockPreviousTrips.filter((m) => !parsed.some((p) => p.id === m.id))];
          setTrips(merged);
        }
      }
    } catch {
      // fallback
    }
  }, []);

  const [filterState, setFilterState] = useState<FilterState>({
    searchQuery: '',
    selectedRegion: '',
    selectedTravelStyle: '',
    selectedPriceLevel: '',
    groupBy: 'none',
    sortBy: 'popular',
  });

  const handleFilterChange = (updates: Partial<FilterState>) => {
    setFilterState((prev) => ({ ...prev, ...updates }));
  };

  const handleResetFilters = () => {
    setFilterState({
      searchQuery: '',
      selectedRegion: '',
      selectedTravelStyle: '',
      selectedPriceLevel: '',
      groupBy: 'none',
      sortBy: 'popular',
    });
    showToast('info', 'Filters Reset', 'Showing all regional destinations.');
  };

  // Filter and Sort destinations
  const filteredDestinations = useMemo(() => {
    return destinations
      .filter((dest) => {
        // Search query filter (city, country, tags, highlight)
        if (filterState.searchQuery.trim()) {
          const q = filterState.searchQuery.toLowerCase().trim();
          const matchCity = dest.city.toLowerCase().includes(q);
          const matchCountry = dest.country.toLowerCase().includes(q);
          const matchRegion = dest.region.toLowerCase().includes(q);
          const matchTag = dest.tags.some((t) => t.toLowerCase().includes(q));
          if (!matchCity && !matchCountry && !matchRegion && !matchTag) {
            return false;
          }
        }

        // Region filter
        if (filterState.selectedRegion && dest.region !== filterState.selectedRegion) {
          return false;
        }

        // Travel style filter
        if (filterState.selectedTravelStyle && dest.travelStyle !== filterState.selectedTravelStyle) {
          return false;
        }

        // Price level filter
        if (filterState.selectedPriceLevel && dest.priceLevel !== filterState.selectedPriceLevel) {
          return false;
        }

        return true;
      })
      .sort((a, b) => {
        switch (filterState.sortBy) {
          case 'rating':
            return b.rating - a.rating;
          case 'nameAsc':
            return a.city.localeCompare(b.city);
          case 'nameDesc':
            return b.city.localeCompare(a.city);
          case 'popular':
          default:
            return b.reviewCount - a.reviewCount;
        }
      });
  }, [destinations, filterState]);

  // Group destinations if GroupBy is active
  const groupedDestinations = useMemo(() => {
    if (filterState.groupBy === 'none') {
      return null;
    }

    const groups: Record<string, Destination[]> = {};
    filteredDestinations.forEach((dest) => {
      let key = 'Other';
      if (filterState.groupBy === 'region') key = dest.region;
      if (filterState.groupBy === 'travelStyle') key = dest.travelStyle;
      if (filterState.groupBy === 'priceLevel') key = dest.priceLevel;

      if (!groups[key]) groups[key] = [];
      groups[key].push(dest);
    });

    return groups;
  }, [filteredDestinations, filterState.groupBy]);

  return (
    <div className="min-h-screen bg-[#F7F1E5] text-[#252525] flex flex-col justify-between">
      {/* Top Navbar */}
      <LandingNavbar />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-10 sm:space-y-12">
        {/* Large Travel Hero Banner Section */}
        <section id="explore">
          <HeroBanner
            searchQuery={filterState.searchQuery}
            onSearchChange={(q) => handleFilterChange({ searchQuery: q })}
            onSearchSubmit={() => {
              const target = document.getElementById('top-destinations');
              target?.scrollIntoView({ behavior: 'smooth' });
            }}
          />
        </section>

        {/* Filter and Control Toolbar (Search, Group By, Filter, Sort By) */}
        <section>
          <FilterToolbar
            filterState={filterState}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalResults={filteredDestinations.length}
          />
        </section>

        {/* Section: Top Regional Selections */}
        <section id="top-destinations" className="scroll-mt-24">
          <SectionHeader
            title="Top Regional Selections"
            subtitle="Curated world-class destinations handpicked for personalized travel planning"
            action={
              <div className="flex items-center gap-2 text-xs font-semibold text-[#6F6A60]">
                <span className="hidden sm:inline">Explore by popularity</span>
                <span className="w-2 h-2 rounded-full bg-[#E3B443]" />
              </div>
            }
          />

          {/* Grouped or Flat Cards Grid */}
          {groupedDestinations ? (
            <div className="space-y-8">
              {Object.entries(groupedDestinations).map(([groupTitle, groupItems]) => (
                <div key={groupTitle} className="space-y-4">
                  <div className="flex items-center gap-2 pb-1 border-b border-[#DAD4C7]/60">
                    <Compass className="w-4 h-4 text-[#C29326]" />
                    <h3 className="text-lg font-serif font-bold text-[#252525]">
                      {groupTitle} ({groupItems.length})
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {groupItems.map((dest) => (
                      <DestinationCard key={dest.id} destination={dest} />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : filteredDestinations.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
              {filteredDestinations.map((dest) => (
                <DestinationCard key={dest.id} destination={dest} />
              ))}
            </div>
          ) : (
            <div className="bg-[#FFF9EE] border border-[#DAD4C7]/80 rounded-2xl p-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-[#FCFAF5] border border-[#DAD4C7] mx-auto flex items-center justify-center text-[#6F6A60]">
                <MapPin className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#252525]">No destinations match your filters</h3>
              <p className="text-xs text-[#6F6A60] max-w-sm mx-auto">
                Try clearing your search query or adjusting your region and style filters.
              </p>
              <Button variant="outline" size="sm" onClick={handleResetFilters}>
                Reset all filters
              </Button>
            </div>
          )}
        </section>

        {/* Section: Previous Trips with Plan a Trip CTA */}
        <section id="previous-trips" className="scroll-mt-24 pt-4 border-t border-[#DAD4C7]/60">
          <SectionHeader
            title="Previous Trips"
            subtitle="Revisit your past journeys or create a new personalized travel itinerary"
            action={
              <Button
                variant="primary"
                size="md"
                onClick={handlePlanTrip}
                leftIcon={<Plus className="w-4 h-4 text-[#252525]" />}
                className="shadow-sm hover:shadow-md"
              >
                + Plan a Trip
              </Button>
            }
          />

          {trips.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
              {trips.map((trip) => (
                <PreviousTripCard key={trip.id} trip={trip} onViewTrip={handleViewTrip} />
              ))}
            </div>
          ) : (
            <div className="bg-[#FFF9EE] border border-[#DAD4C7]/80 rounded-2xl p-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#E7EFEA] mx-auto flex items-center justify-center text-[#4E7360]">
                <Compass className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-serif font-bold text-[#252525]">No previous trips yet</h3>
                <p className="text-xs text-[#6F6A60] mt-1">Start planning your first personalized travel adventure today.</p>
              </div>
              <Button
                variant="primary"
                onClick={handlePlanTrip}
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Plan a Trip
              </Button>
            </div>
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DAD4C7]/80 bg-[#FFF9EE]/80 backdrop-blur-md mt-16 py-8 px-4 sm:px-8">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-[#6F6A60]">
          <div className="flex items-center gap-3">
            <span className="font-serif font-bold text-[#252525] text-sm">
              Globe<span className="text-[#C29326]">Trotter</span>
            </span>
            <span>•</span>
            <span>Personalized Travel Planning Platform</span>
            <span>•</span>
            <span className="flex items-center gap-1 text-[#4E7360] font-medium">
              <ShieldCheck className="w-3.5 h-3.5" /> End-to-end verified
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs font-medium">
            <a href="#explore" className="hover:text-[#252525] transition-colors">Explore</a>
            <span>•</span>
            <a href="#top-destinations" className="hover:text-[#252525] transition-colors">Destinations</a>
            <span>•</span>
            <a href="#previous-trips" className="hover:text-[#252525] transition-colors">My Trips</a>
            <span>•</span>
            <span className="text-[#8C867B] flex items-center gap-1">
              Made with <Heart className="w-3 h-3 text-[#D96B43] fill-current" /> for Odoo Hackathon
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
