import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  Plus,
} from 'lucide-react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { CalendarToolbar, CalendarViewMode } from '../components/calendar/CalendarToolbar';
import { MonthCalendar } from '../components/calendar/MonthCalendar';
import { CalendarAgenda } from '../components/calendar/CalendarAgenda';
import { CalendarEventModal } from '../components/calendar/CalendarEventModal';
import { Footer } from '../components/ui/Footer';
import { Button } from '../components/ui/Button';
import { tripService, getTripStatus, calculateTripDurationDays, normalizeToISODate } from '../services/tripService';
import { authService } from '../services/authService';
import { Trip, ItinerarySection } from '../types/trip';

export const Calendar: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([]);
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [viewMode, setViewMode] = useState<CalendarViewMode>('month');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedDestination, setSelectedDestination] = useState('all');

  // Modal states
  const [selectedDayDateStr, setSelectedDayDateStr] = useState<string | null>(null);

  // Load user trips on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      const userTrips = tripService.getUserTrips(user.id);
      setTrips(userTrips);
    }
  }, []);

  // Real-time calculated summary stats
  const summaryStats = useMemo(() => {
    let upcoming = 0;
    let ongoing = 0;
    let totalDays = 0;
    let totalActs = 0;

    trips.forEach((t) => {
      const s = getTripStatus(t.startDate, t.endDate);
      if (s === 'UPCOMING') upcoming++;
      else if (s === 'ONGOING') ongoing++;

      totalDays += calculateTripDurationDays(t.startDate, t.endDate);
      totalActs += t.sections ? t.sections.length : 0;
    });

    return {
      upcoming,
      ongoing,
      totalDays,
      totalActs,
    };
  }, [trips]);

  // Unique list of destinations across user trips
  const availableDestinations = useMemo(() => {
    const set = new Set<string>();
    trips.forEach((t) => {
      t.destinations?.forEach((d) => {
        if (d.city) set.add(d.city);
      });
    });
    return ['all', ...Array.from(set).sort()];
  }, [trips]);

  // Month Navigation Handlers
  const handlePrevMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentMonthDate((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  };

  const handleToday = () => {
    setCurrentMonthDate(new Date());
  };

  // Filtered trips
  const filteredTrips = useMemo(() => {
    let result = [...trips];

    // Status filter
    if (selectedStatus !== 'all') {
      result = result.filter((t) => getTripStatus(t.startDate, t.endDate) === selectedStatus);
    }

    // Destination filter
    if (selectedDestination !== 'all') {
      result = result.filter((t) =>
        t.destinations?.some((d) => d.city.toLowerCase() === selectedDestination.toLowerCase())
      );
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      result = result.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.destinations?.some((d) => d.city.toLowerCase().includes(q) || d.country.toLowerCase().includes(q)) ||
          t.sections?.some((s) => s.title.toLowerCase().includes(q) || s.location?.toLowerCase().includes(q))
      );
    }

    return result;
  }, [trips, selectedStatus, selectedDestination, searchQuery]);

  // Flatten and filter all activities with parent trip references
  const filteredActivities = useMemo(() => {
    const list: { trip: Trip; section: ItinerarySection }[] = [];

    filteredTrips.forEach((trip) => {
      trip.sections?.forEach((section) => {
        // Category filter
        if (selectedCategory !== 'all' && section.type !== selectedCategory) {
          return;
        }

        // Search query
        if (searchQuery.trim()) {
          const q = searchQuery.trim().toLowerCase();
          const matches =
            section.title.toLowerCase().includes(q) ||
            section.description?.toLowerCase().includes(q) ||
            section.location?.toLowerCase().includes(q) ||
            trip.name.toLowerCase().includes(q);
          if (!matches) return;
        }

        list.push({ trip, section });
      });
    });

    return list;
  }, [filteredTrips, selectedCategory, searchQuery]);

  // Active trips on selected day
  const selectedDayActiveTrips = useMemo(() => {
    if (!selectedDayDateStr) return [];
    return trips.filter((t) => {
      const start = normalizeToISODate(t.startDate);
      const end = normalizeToISODate(t.endDate) || start;
      return selectedDayDateStr >= start && selectedDayDateStr <= end;
    });
  }, [trips, selectedDayDateStr]);

  // Scheduled activities on selected day
  const selectedDayActivities = useMemo(() => {
    if (!selectedDayDateStr) return [];
    return filteredActivities.filter(({ section }) => {
      const start = normalizeToISODate(section.startDate);
      const end = normalizeToISODate(section.endDate) || start;
      return selectedDayDateStr >= start && selectedDayDateStr <= end;
    });
  }, [filteredActivities, selectedDayDateStr]);

  return (
    <div className="min-h-screen bg-[#F7F1E5] text-[#252525] flex flex-col justify-between selection:bg-[#F4C95D]/40">
      {/* 1. Global Navigation */}
      <LandingNavbar />

      {/* 2. Main Calendar Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
        {/* Calendar Editorial Header */}
        <div className="bg-[#FFF9EE] border border-[#DAD4C7]/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EFEA] border border-[#C2D7CC] text-xs font-bold text-[#4E7360]">
                <CalendarIcon className="w-3.5 h-3.5" /> Schedule & Timelines
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#252525] tracking-tight">
                Travel Calendar
              </h1>
              <p className="text-xs sm:text-sm text-[#6F6A60] max-w-2xl leading-relaxed">
                See your upcoming journeys, active trips, and day-by-day scheduled activities across all destinations.
              </p>
            </div>

            <Link to="/trips/create" className="self-start sm:self-auto shrink-0">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Plus className="w-4 h-4 text-[#252525]" />}
                className="text-xs font-bold shadow-sm"
              >
                + Plan New Trip
              </Button>
            </Link>
          </div>

          {/* Real Dynamically Calculated Summary KPI Pills */}
          <div className="pt-4 border-t border-[#DAD4C7]/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FCFAF5] p-3 rounded-2xl border border-[#DAD4C7]/60">
              <span className="text-[10px] uppercase font-bold text-[#8C867B] block">Upcoming Trips</span>
              <span className="text-lg font-serif font-bold text-[#4E7360]">{summaryStats.upcoming}</span>
            </div>
            <div className="bg-[#FCFAF5] p-3 rounded-2xl border border-[#DAD4C7]/60">
              <span className="text-[10px] uppercase font-bold text-[#8C867B] block">Active / Ongoing</span>
              <span className="text-lg font-serif font-bold text-[#F4C95D]">{summaryStats.ongoing}</span>
            </div>
            <div className="bg-[#FCFAF5] p-3 rounded-2xl border border-[#DAD4C7]/60">
              <span className="text-[10px] uppercase font-bold text-[#8C867B] block">Planned Days</span>
              <span className="text-lg font-serif font-bold text-[#252525]">{summaryStats.totalDays} Days</span>
            </div>
            <div className="bg-[#FCFAF5] p-3 rounded-2xl border border-[#DAD4C7]/60">
              <span className="text-[10px] uppercase font-bold text-[#8C867B] block">Scheduled Activities</span>
              <span className="text-lg font-serif font-bold text-[#252525]">{summaryStats.totalActs}</span>
            </div>
          </div>
        </div>

        {/* Calendar Control Toolbar */}
        <CalendarToolbar
          currentMonthDate={currentMonthDate}
          onPrevMonth={handlePrevMonth}
          onNextMonth={handleNextMonth}
          onToday={handleToday}
          viewMode={viewMode}
          onViewModeChange={setViewMode}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedDestination={selectedDestination}
          onDestinationChange={setSelectedDestination}
          availableDestinations={availableDestinations}
          onResetFilters={() => {
            setSearchQuery('');
            setSelectedStatus('all');
            setSelectedCategory('all');
            setSelectedDestination('all');
          }}
        />

        {/* Main Calendar View Body */}
        {trips.length === 0 ? (
          /* Empty State */
          <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-10 sm:p-14 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#FCFAF5] border border-[#DAD4C7] flex items-center justify-center mx-auto text-[#4E7360]">
              <CalendarIcon className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-[#252525]">
                Your travel calendar is waiting
              </h3>
              <p className="text-xs text-[#6F6A60] max-w-sm mx-auto">
                Create your first trip and see your daily timeline, destinations, and activities come to life.
              </p>
            </div>
            <Link to="/trips/create">
              <Button
                variant="primary"
                size="md"
                leftIcon={<Plus className="w-4 h-4" />}
                className="text-xs font-bold"
              >
                Plan Your First Trip
              </Button>
            </Link>
          </div>
        ) : viewMode === 'month' ? (
          /* Month Grid View */
          <MonthCalendar
            currentMonthDate={currentMonthDate}
            trips={filteredTrips}
            filteredActivities={filteredActivities}
            onSelectDay={(dateStr) => setSelectedDayDateStr(dateStr)}
          />
        ) : (
          /* Agenda / List View */
          <CalendarAgenda
            trips={filteredTrips}
            activities={filteredActivities}
            onSelectDay={(dateStr) => setSelectedDayDateStr(dateStr)}
          />
        )}
      </main>

      {/* Day / Event Details Modal */}
      <CalendarEventModal
        isOpen={Boolean(selectedDayDateStr)}
        onClose={() => setSelectedDayDateStr(null)}
        dateStr={selectedDayDateStr || ''}
        activeTrips={selectedDayActiveTrips}
        scheduledActivities={selectedDayActivities}
      />

      {/* Universal Footer */}
      <Footer />
    </div>
  );
};
