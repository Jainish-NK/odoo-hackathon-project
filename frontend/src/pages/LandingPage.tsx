import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { HeroBanner } from '../components/landing/HeroBanner';
import { FilterToolbar } from '../components/landing/FilterToolbar';
import { DestinationCard } from '../components/landing/DestinationCard';
import { PreviousTripCard } from '../components/landing/PreviousTripCard';
import { SectionHeader } from '../components/landing/SectionHeader';
import { Footer } from '../components/ui/Footer';
import { Button } from '../components/ui/Button';
import { CityDetailsModal } from '../components/discovery/CityDetailsModal';
import { AddToTripModal } from '../components/discovery/AddToTripModal';
import { mockDestinations, mockPreviousTrips } from '../data/landingData';
import { allActivitiesList } from '../data/tripSuggestions';
import { Destination, FilterState, PreviousTrip } from '../types/landing';
import { Trip, ActivityItem } from '../types/trip';
import {
  Plus,
  Compass,
  MapPin,
  Calendar,
  Wallet,
  Users,
  ArrowRight,
  Sparkles,
  Quote,
} from 'lucide-react';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { tripService } from '../services/tripService';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [destinations] = useState<Destination[]>(mockDestinations);
  const [trips, setTrips] = useState<PreviousTrip[]>(mockPreviousTrips);

  // Modal States for Destination Details and Add To Trip
  const [selectedCityForDetails, setSelectedCityForDetails] = useState<Destination | null>(null);
  const [targetForAddToTrip, setTargetForAddToTrip] = useState<
    | { type: 'city'; destination: Destination }
    | { type: 'activity'; activity: ActivityItem }
    | null
  >(null);

  // Load custom created trips from service on mount
  useEffect(() => {
    try {
      const user = authService.getCurrentUser();
      if (user) {
        const userTrips = tripService.getUserTrips(user.id);
        if (userTrips.length > 0) {
          const formatted: PreviousTrip[] = userTrips.map((t: Trip) => ({
            id: t.id,
            title: t.name,
            destinationSummary: t.destinations.map((d) => d.city).join(', '),
            startDate: new Date(t.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            endDate: new Date(t.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            destinationsCount: t.destinations.length,
            durationDays: Math.max(1, Math.round((new Date(t.endDate).getTime() - new Date(t.startDate).getTime()) / (1000 * 60 * 60 * 24))),
            image: t.destinations[0]?.image || 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=800&auto=format&fit=crop',
            status: 'Upcoming',
            budget: `₹${(t.totalBudget || 0).toLocaleString('en-IN')}`,
          }));
          setTrips(formatted);
          return;
        }
      }
      setTrips(mockPreviousTrips);
    } catch {
      setTrips(mockPreviousTrips);
    }
  }, []);

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

  const featuredExperiences = useMemo(() => {
    return allActivitiesList.slice(0, 4);
  }, []);

  return (
    <div className="min-h-screen bg-[#F7F1E5] text-[#252525] flex flex-col justify-between selection:bg-[#F4C95D]/40">
      {/* Top Navbar */}
      <LandingNavbar />

      {/* Main Page Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8 space-y-12 sm:space-y-16">
        {/* 1. Large Editorial Travel Hero Banner Section */}
        <section id="explore">
          <HeroBanner
            searchQuery={filterState.searchQuery}
            onSearchChange={(q) => handleFilterChange({ searchQuery: q })}
            onSearchSubmit={() => {
              const target = document.getElementById('top-destinations');
              target?.scrollIntoView({ behavior: 'smooth' });
            }}
            onPlanTrip={handlePlanTrip}
          />
        </section>

        {/* 2. Value Proposition & Trust Badges Section */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          <div className="bg-[#FFF9EE] p-5 rounded-2xl border border-[#DAD4C7]/80 shadow-2xs space-y-2 hover:border-[#E3B443] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#F4C95D]/20 text-[#C29326] flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-[#252525] text-base">
              Smart Day Schedules
            </h3>
            <p className="text-xs text-[#6F6A60] leading-relaxed">
              Design balanced day-by-day itineraries with automatic timing and easy drag-and-drop reordering.
            </p>
          </div>

          <div className="bg-[#FFF9EE] p-5 rounded-2xl border border-[#DAD4C7]/80 shadow-2xs space-y-2 hover:border-[#E3B443] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#4E7360]/20 text-[#4E7360] flex items-center justify-center">
              <Wallet className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-[#252525] text-base">
              Live Budget Tracking
            </h3>
            <p className="text-xs text-[#6F6A60] leading-relaxed">
              Real-time cost breakdown across accommodation, transport, sightseeing, and dining with daily averages.
            </p>
          </div>

          <div className="bg-[#FFF9EE] p-5 rounded-2xl border border-[#DAD4C7]/80 shadow-2xs space-y-2 hover:border-[#E3B443] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#D96B43]/20 text-[#D96B43] flex items-center justify-center">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-[#252525] text-base">
              Multi-City Journeys
            </h3>
            <p className="text-xs text-[#6F6A60] leading-relaxed">
              Seamlessly link multiple destination stops and explore curated attraction ideas for every stop.
            </p>
          </div>

          <div className="bg-[#FFF9EE] p-5 rounded-2xl border border-[#DAD4C7]/80 shadow-2xs space-y-2 hover:border-[#E3B443] transition-colors">
            <div className="w-10 h-10 rounded-xl bg-[#E3B443]/20 text-[#C29326] flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-serif font-bold text-[#252525] text-base">
              Community Clones
            </h3>
            <p className="text-xs text-[#6F6A60] leading-relaxed">
              Discover real itineraries shared by fellow travelers and copy them into your personal account in one click.
            </p>
          </div>
        </section>

        {/* 3. Filter and Control Toolbar (Search, Group By, Filter, Sort By) */}
        <section>
          <FilterToolbar
            filterState={filterState}
            onFilterChange={handleFilterChange}
            onResetFilters={handleResetFilters}
            totalResults={filteredDestinations.length}
          />
        </section>

        {/* 4. Section: Top Regional Selections */}
        <section id="top-destinations" className="scroll-mt-24 space-y-6">
          <SectionHeader
            title="Top Regional Selections"
            subtitle="Curated world-class destinations handpicked for personalized travel planning"
            action={
              <Link
                to="/cities"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#C29326] hover:text-[#252525] transition-colors"
              >
                <span>View All Cities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
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

        {/* 5. Section: Curated Travel Experiences & Activities */}
        <section className="space-y-6 pt-4 border-t border-[#DAD4C7]/60">
          <SectionHeader
            title="Curated Travel Experiences"
            subtitle="Iconic attractions, culinary walking tours, and bucket-list adventures"
            action={
              <Link
                to="/activities"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#4E7360] hover:text-[#252525] transition-colors"
              >
                <span>Browse All Activities</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            }
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {featuredExperiences.map((act) => (
              <div
                key={act.id}
                className="bg-[#FFF9EE] rounded-2xl border border-[#DAD4C7]/80 overflow-hidden shadow-2xs hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="relative h-44 overflow-hidden">
                    <img
                      src={act.image}
                      alt={act.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                    <span className="absolute top-2.5 left-2.5 px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-[11px] font-bold text-[#252525]">
                      {act.category}
                    </span>
                    <span className="absolute bottom-2.5 left-2.5 text-white text-xs font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-[#F4C95D]" /> {act.city}, {act.country}
                    </span>
                  </div>

                  <div className="p-4 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-[#C29326] flex items-center gap-1">
                        ⭐ {act.rating}
                      </span>
                      <span className="text-[#6F6A60] font-medium">{act.duration}</span>
                    </div>
                    <h4 className="font-serif font-bold text-sm text-[#252525] line-clamp-1 group-hover:text-[#C29326] transition-colors">
                      {act.name}
                    </h4>
                    <p className="text-xs text-[#6F6A60] line-clamp-2 leading-relaxed">
                      {act.description}
                    </p>
                  </div>
                </div>

                <div className="p-4 pt-0 flex items-center justify-between border-t border-[#DAD4C7]/50 mt-2">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8C867B] block">From</span>
                    <span className="text-xs font-bold text-[#252525]">{act.estimatedCost}</span>
                  </div>
                  <Link
                    to="/activities"
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-[#F4C95D] text-xs font-semibold text-[#252525] border border-[#DAD4C7] transition-colors shadow-2xs"
                  >
                    View Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* 6. Section: Previous Trips with Plan a Trip CTA */}
        <section id="previous-trips" className="scroll-mt-24 pt-4 border-t border-[#DAD4C7]/60">
          <SectionHeader
            title="Previous Trips & Active Journeys"
            subtitle="Revisit your past journeys or create a new personalized travel itinerary"
            action={
              <Button
                variant="primary"
                size="md"
                onClick={handlePlanTrip}
                leftIcon={<Plus className="w-4 h-4 text-[#252525]" />}
                className="shadow-sm hover:shadow-md font-bold"
              >
                Plan a Trip
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

        {/* 7. Community Explorer Spotlight Banner */}
        <section className="bg-gradient-to-br from-[#FFF9EE] via-[#FCFAF5] to-[#EFE7D5] border border-white rounded-[28px] p-6 sm:p-10 shadow-sm relative overflow-hidden">
          <div className="max-w-2xl relative z-10 space-y-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#DAD4C7] text-xs font-bold text-[#C29326]">
              <Sparkles className="w-3.5 h-3.5" /> Explorer Community Spotlight
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#252525] tracking-tight">
              "GlobeTrotter made planning our 10-day European tour effortless."
            </h3>
            <p className="text-xs sm:text-sm text-[#6F6A60] leading-relaxed">
              Discover real trip logs, hidden cafés, and cliffside trails published by active travelers. Read their stories or clone entire itineraries directly into your account.
            </p>
            <div className="pt-2">
              <Link to="/community">
                <Button variant="outline" size="sm" className="font-bold text-xs">
                  Browse Community Stories & Guides <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
                </Button>
              </Link>
            </div>
          </div>
          <Quote className="hidden md:block absolute right-8 bottom-6 w-32 h-32 text-[#DAD4C7]/30 pointer-events-none" />
        </section>

        {/* 8. Call to Action Banner */}
        <section className="bg-[#252525] text-white rounded-[28px] p-8 sm:p-12 text-center relative overflow-hidden shadow-xl shadow-black/10">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-2xl sm:text-4xl font-serif font-bold tracking-tight text-white">
              Ready for your next adventure?
            </h2>
            <p className="text-xs sm:text-sm text-[#EFEBE3]/80 leading-relaxed max-w-xl mx-auto">
              Build your custom day-by-day itinerary, track your budget, and explore the world with complete confidence.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={handlePlanTrip}
                leftIcon={<Plus className="w-4 h-4 text-[#252525]" />}
                className="w-full sm:w-auto font-bold"
              >
                Plan Your Trip Now
              </Button>
              <Link to="/cities" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-white border-white/30 hover:bg-white/10 hover:text-white font-semibold"
                >
                  Explore Destinations
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Universal Footer */}
      <Footer />

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
      />

      {/* Add To Trip Modal */}
      <AddToTripModal
        isOpen={Boolean(targetForAddToTrip)}
        onClose={() => setTargetForAddToTrip(null)}
        target={targetForAddToTrip}
        onSuccess={() => {
          showToast('success', 'Added to Trip', 'Item saved to your itinerary.');
        }}
      />
    </div>
  );
};
