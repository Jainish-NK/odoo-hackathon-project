import React, { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Plus,
  Compass,
  Search,
  RotateCcw,
} from 'lucide-react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { Button } from '../components/ui/Button';
import { TripCard } from '../components/trips/TripCard';
import { TripFilterBar } from '../components/trips/TripFilterBar';
import { DeleteTripModal } from '../components/trips/DeleteTripModal';
import { tripService, getTripStatus, normalizeToISODate } from '../services/tripService';
import { authService } from '../services/authService';
import { Trip, TripDestinationOption, TripFilterState } from '../types/trip';
import { User } from '../types/auth';
import { useToast } from '../context/ToastContext';

export const MyTrips: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [trips, setTrips] = useState<Trip[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Filters and Sorting
  const [filters, setFilters] = useState<TripFilterState>({
    searchQuery: '',
    status: 'ALL',
    destinationCity: '',
    sortBy: 'newest',
  });

  // Delete modal state
  const [tripToDelete, setTripToDelete] = useState<Trip | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // 1. Initial Load & Auth Check
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (!user) {
      navigate('/login?redirect=/trips', { state: { from: '/trips' }, replace: true });
      return;
    }
    setCurrentUser(user);

    // Fetch user's trips from tripService
    const userTrips = tripService.getUserTrips(user.id);
    setTrips(userTrips);
    setIsLoading(false);
  }, [navigate]);

  // 2. Extract unique available cities from user's trips for destination filter
  const availableCities = useMemo(() => {
    const citySet = new Set<string>();
    trips.forEach((t) => {
      t.destinations?.forEach((d: TripDestinationOption) => {
        if (d.city) citySet.add(d.city);
      });
    });
    return Array.from(citySet).sort();
  }, [trips]);

  // 3. Count trips dynamically by calculated status
  const counts = useMemo(() => {
    let ongoing = 0;
    let upcoming = 0;
    let completed = 0;

    trips.forEach((t) => {
      const s = getTripStatus(t.startDate, t.endDate);
      if (s === 'ONGOING') ongoing++;
      else if (s === 'UPCOMING') upcoming++;
      else if (s === 'COMPLETED') completed++;
    });

    return {
      all: trips.length,
      ongoing,
      upcoming,
      completed,
    };
  }, [trips]);

  // 4. Filter and Sort user trips
  const filteredAndSortedTrips = useMemo(() => {
    let result = [...trips];

    // Search query filter (name, destination cities/countries, notes)
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      result = result.filter((t) => {
        const nameMatch = t.name.toLowerCase().includes(q);
        const notesMatch = t.notes ? t.notes.toLowerCase().includes(q) : false;
        const destMatch = t.destinations?.some(
          (d: TripDestinationOption) =>
            d.city.toLowerCase().includes(q) ||
            d.country.toLowerCase().includes(q) ||
            d.region.toLowerCase().includes(q)
        );
        return nameMatch || notesMatch || destMatch;
      });
    }

    // Destination city filter
    if (filters.destinationCity) {
      result = result.filter((t) =>
        t.destinations?.some((d: TripDestinationOption) => d.city.toLowerCase() === filters.destinationCity.toLowerCase())
      );
    }

    // Status filter
    if (filters.status !== 'ALL') {
      result = result.filter((t) => getTripStatus(t.startDate, t.endDate) === filters.status);
    }

    // Sorting
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
        case 'oldest':
          return new Date(a.createdAt || 0).getTime() - new Date(b.createdAt || 0).getTime();
        case 'date-asc':
          return (
            new Date(normalizeToISODate(a.startDate) || 0).getTime() -
            new Date(normalizeToISODate(b.startDate) || 0).getTime()
          );
        case 'date-desc':
          return (
            new Date(normalizeToISODate(b.startDate) || 0).getTime() -
            new Date(normalizeToISODate(a.startDate) || 0).getTime()
          );
        case 'name-asc':
          return a.name.localeCompare(b.name);
        case 'name-desc':
          return b.name.localeCompare(a.name);
        default:
          return 0;
      }
    });

    return result;
  }, [trips, filters]);

  // Categorize for the "ALL" view when no search is active
  const isDefaultView = filters.status === 'ALL' && !filters.searchQuery.trim() && !filters.destinationCity;

  const ongoingTrips = useMemo(
    () => filteredAndSortedTrips.filter((t) => getTripStatus(t.startDate, t.endDate) === 'ONGOING'),
    [filteredAndSortedTrips]
  );
  const upcomingTrips = useMemo(
    () => filteredAndSortedTrips.filter((t) => getTripStatus(t.startDate, t.endDate) === 'UPCOMING'),
    [filteredAndSortedTrips]
  );
  const completedTrips = useMemo(
    () => filteredAndSortedTrips.filter((t) => getTripStatus(t.startDate, t.endDate) === 'COMPLETED'),
    [filteredAndSortedTrips]
  );

  // 5. Handle Delete Flow
  const handleDeleteTrigger = (trip: Trip) => {
    setTripToDelete(trip);
  };

  const handleConfirmDelete = () => {
    if (!tripToDelete || !currentUser) return;
    setIsDeleting(true);

    setTimeout(() => {
      const success = tripService.deleteTrip(tripToDelete.id, currentUser.id);
      if (success) {
        const updated = tripService.getUserTrips(currentUser.id);
        setTrips(updated);
        showToast('success', 'Trip Deleted', `"${tripToDelete.name}" was successfully removed.`);
      } else {
        showToast('error', 'Error', 'Failed to delete trip. Please try again.');
      }
      setIsDeleting(false);
      setTripToDelete(null);
    }, 400);
  };

  if (!currentUser && isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F1E5] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#F4C95D] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-semibold text-[#6F6A60]">Loading your adventures...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F1E5] text-[#252525] flex flex-col justify-between selection:bg-[#F4C95D]/40">
      {/* 1. Global Navigation Bar */}
      <LandingNavbar />

      {/* 2. Main Body Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
        {/* Page Header with Stats & Action */}
        <div className="bg-gradient-to-br from-[#FFF9EE] via-[#FCFAF5] to-[#EFE7D5] border border-white/90 rounded-[28px] p-6 sm:p-8 shadow-sm relative overflow-hidden">
          <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/80 border border-[#DAD4C7]/60 text-[11px] font-bold text-[#C29326]">
                <Compass className="w-3.5 h-3.5" /> Explorer Travel Portfolio
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#252525] tracking-tight">
                My Trips
              </h1>
              <p className="text-xs sm:text-sm text-[#6F6A60] leading-relaxed">
                Keep all your adventures organized in one place. View active routes, monitor budgets, and design custom itineraries.
              </p>
            </div>

            {/* Header Right: New Trip CTA & Compact Stats */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
              {/* Stat Pills */}
              <div className="flex items-center gap-2 p-1.5 bg-white/70 backdrop-blur-sm border border-[#DAD4C7]/80 rounded-2xl">
                <div className="px-3 py-1 text-center border-r border-[#DAD4C7]/50">
                  <span className="text-[10px] uppercase font-bold text-[#8C867B] block">Total</span>
                  <span className="text-sm font-bold text-[#252525]">{counts.all}</span>
                </div>
                <div className="px-3 py-1 text-center border-r border-[#DAD4C7]/50">
                  <span className="text-[10px] uppercase font-bold text-[#4E7360] block">Ongoing</span>
                  <span className="text-sm font-bold text-[#4E7360]">{counts.ongoing}</span>
                </div>
                <div className="px-3 py-1 text-center">
                  <span className="text-[10px] uppercase font-bold text-[#C29326] block">Upcoming</span>
                  <span className="text-sm font-bold text-[#C29326]">{counts.upcoming}</span>
                </div>
              </div>

              {/* Plan New Trip CTA */}
              <Link to="/trips/create">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="shadow-sm w-full sm:w-auto font-bold"
                >
                  Plan a New Trip
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* 3. Search & Filter Bar */}
        {trips.length > 0 && (
          <TripFilterBar
            filters={filters}
            onFilterChange={setFilters}
            availableCities={availableCities}
            counts={counts}
          />
        )}

        {/* 4. Trips Content Area */}
        {trips.length === 0 ? (
          /* Entirely Empty State (User has no trips yet) */
          <div className="bg-[#FFF9EE] rounded-3xl border border-dashed border-[#DAD4C7] p-8 sm:p-14 text-center space-y-4 max-w-2xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-[#F4C95D]/20 text-[#C29326] flex items-center justify-center mx-auto shadow-inner">
              <Compass className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#252525]">
                Your next adventure starts here.
              </h2>
              <p className="text-xs sm:text-sm text-[#6F6A60] max-w-md mx-auto leading-relaxed">
                Start planning a trip and build your perfect itinerary with smart activities, hotels, and custom travel routes.
              </p>
            </div>
            <div className="pt-2">
              <Link to="/trips/create">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="shadow-sm font-bold"
                >
                  Plan Your First Trip
                </Button>
              </Link>
            </div>
          </div>
        ) : filteredAndSortedTrips.length === 0 ? (
          /* Search / Filter Zero State */
          <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-8 sm:p-12 text-center space-y-4 max-w-xl mx-auto shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-black/5 text-[#8C867B] flex items-center justify-center mx-auto">
              <Search className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-[#252525]">
                No matching trips found
              </h3>
              <p className="text-xs text-[#6F6A60]">
                We couldn't find any trips matching your active search query or filter selection.
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setFilters({
                  searchQuery: '',
                  status: 'ALL',
                  destinationCity: '',
                  sortBy: 'newest',
                })
              }
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white border border-[#DAD4C7] text-xs font-semibold text-[#252525] hover:bg-[#F4C95D] transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Clear Search & Filters
            </button>
          </div>
        ) : isDefaultView ? (
          /* Default "ALL" View: Categorized by Ongoing, Upcoming, Completed */
          <div className="space-y-10">
            {/* Section A: Ongoing Trips */}
            {ongoingTrips.length > 0 && (
              <section className="space-y-4 animate-in fade-in duration-300">
                <div className="flex items-center justify-between pb-2 border-b border-[#DAD4C7]/60">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#4E7360] animate-pulse" />
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-[#252525] flex items-center gap-2">
                      Ongoing Adventures
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#E7EFEA] text-[#4E7360] text-xs font-bold">
                      {ongoingTrips.length}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[#4E7360]">Currently Traveling</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {ongoingTrips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrigger} />
                  ))}
                </div>
              </section>
            )}

            {/* Section B: Upcoming Trips */}
            <section className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#DAD4C7]/60">
                <div className="flex items-center gap-2.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#E3B443]" />
                  <h2 className="text-lg sm:text-xl font-serif font-bold text-[#252525]">
                    Upcoming Trips
                  </h2>
                  <span className="px-2 py-0.5 rounded-full bg-[#FCFAF5] border border-[#F4C95D]/40 text-[#C29326] text-xs font-bold">
                    {upcomingTrips.length}
                  </span>
                </div>
                <span className="text-xs font-medium text-[#6F6A60]">Scheduled Ahead</span>
              </div>

              {upcomingTrips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {upcomingTrips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrigger} />
                  ))}
                </div>
              ) : (
                <div className="bg-[#FFF9EE]/70 rounded-2xl border border-dashed border-[#DAD4C7] p-6 text-center text-xs text-[#6F6A60]">
                  No upcoming adventures yet. Plan a new trip to explore the world!
                </div>
              )}
            </section>

            {/* Section C: Completed Trips */}
            {completedTrips.length > 0 && (
              <section className="space-y-4 pt-2">
                <div className="flex items-center justify-between pb-2 border-b border-[#DAD4C7]/60">
                  <div className="flex items-center gap-2.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#8C867B]" />
                    <h2 className="text-lg sm:text-xl font-serif font-bold text-[#252525]">
                      Past Journeys & Travel History
                    </h2>
                    <span className="px-2 py-0.5 rounded-full bg-[#EFEBE3] text-[#6F6A60] text-xs font-bold">
                      {completedTrips.length}
                    </span>
                  </div>
                  <span className="text-xs font-medium text-[#8C867B]">Completed</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-95">
                  {completedTrips.map((trip) => (
                    <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrigger} />
                  ))}
                </div>
              </section>
            )}
          </div>
        ) : (
          /* Filtered or Searched Single Unified Grid */
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DAD4C7]/60">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#252525]">
                {filters.status === 'ALL'
                  ? 'All Matching Trips'
                  : filters.status === 'ONGOING'
                  ? 'Ongoing Trips'
                  : filters.status === 'UPCOMING'
                  ? 'Upcoming Trips'
                  : 'Completed Trips'}
                <span className="ml-2 text-xs font-normal text-[#6F6A60]">
                  ({filteredAndSortedTrips.length} {filteredAndSortedTrips.length === 1 ? 'trip' : 'trips'})
                </span>
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredAndSortedTrips.map((trip) => (
                <TripCard key={trip.id} trip={trip} onDelete={handleDeleteTrigger} />
              ))}
            </div>
          </div>
        )}
      </main>

      {/* 5. Delete Trip Confirmation Modal */}
      <DeleteTripModal
        isOpen={Boolean(tripToDelete)}
        onClose={() => setTripToDelete(null)}
        onConfirm={handleConfirmDelete}
        trip={tripToDelete}
        isDeleting={isDeleting}
      />

      {/* 6. Footer */}
      <footer className="border-t border-[#DAD4C7]/80 bg-[#FFF9EE]/80 backdrop-blur-md mt-16 py-6 px-4 sm:px-8 text-center text-xs text-[#8C867B]">
        GlobeTrotter Personalized Travel Planning Platform • My Trips
      </footer>
    </div>
  );
};
