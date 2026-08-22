import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  AlertCircle,
  Sparkles,
  Layers,
  ShieldAlert,
  Share2,
  Calendar,
  MapPin,
  Clock,
  Filter,
  ArrowUpDown,
  Search,
  RotateCcw,
  List,
} from 'lucide-react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { ItinerarySectionCard } from '../components/itinerary/ItinerarySectionCard';
import { ItinerarySectionForm } from '../components/itinerary/ItinerarySectionForm';
import { DeleteSectionModal } from '../components/itinerary/DeleteSectionModal';
import { BudgetSummaryCard } from '../components/itinerary/BudgetSummaryCard';
import { DaySelector, DayTab } from '../components/itinerary/DaySelector';
import { ItineraryTimeline, TimelineGroup } from '../components/itinerary/ItineraryTimeline';
import { ShareTripModal } from '../components/itinerary/ShareTripModal';
import { Footer } from '../components/ui/Footer';
import { Button } from '../components/ui/Button';
import {
  tripService,
  formatDisplayDate,
  calculateTripDurationDays,
  normalizeToISODate,
  getTripStatus,
} from '../services/tripService';
import { authService } from '../services/authService';
import { Trip, ItinerarySection, SuggestedPlace, SuggestedActivity } from '../types/trip';
import { useToast } from '../context/ToastContext';

type ItineraryViewMode = 'timeline' | 'list' | 'builder';
type ItinerarySortOption = 'time-asc' | 'time-desc' | 'cost-asc' | 'cost-desc' | 'name-asc';

export const BuildItinerary: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const currentUser = authService.getCurrentUser();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUnauthorized, setIsUnauthorized] = useState(false);

  // View & Filter States
  const [viewMode, setViewMode] = useState<ItineraryViewMode>('timeline');
  const [selectedDay, setSelectedDay] = useState<number | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | 'all'>('all');
  const [sortBy, setSortBy] = useState<ItinerarySortOption>('time-asc');

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ItinerarySection | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSection, setDeletingSection] = useState<ItinerarySection | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);

  // Load trip on mount
  useEffect(() => {
    if (!currentUser) {
      navigate(`/login?redirect=${encodeURIComponent(`/trips/${tripId}/itinerary`)}`, {
        state: { from: `/trips/${tripId}/itinerary` },
        replace: true,
      });
      return;
    }

    if (tripId) {
      const found = tripService.getTripById(tripId);
      if (found) {
        if (found.userId && found.userId !== currentUser.id && found.userId !== 'usr_default_1') {
          setIsUnauthorized(true);
        } else {
          setTrip(found);
        }
      }
    }
    setIsLoading(false);
  }, [tripId, currentUser, navigate]);

  // Total Duration
  const durationDays = useMemo(() => {
    if (!trip) return 1;
    return calculateTripDurationDays(trip.startDate, trip.endDate) || 1;
  }, [trip]);

  // Day Tabs Calculation
  const dayTabs: DayTab[] = useMemo(() => {
    if (!trip) return [];
    const totalDays = durationDays;
    const startISO = normalizeToISODate(trip.startDate);
    const startDateObj = startISO ? new Date(startISO) : new Date();

    const tabs: DayTab[] = [
      {
        dayNumber: 'all',
        label: 'All Days',
        count: trip.sections.length,
      },
    ];

    for (let i = 1; i <= totalDays; i++) {
      const currentDayDate = new Date(startDateObj);
      currentDayDate.setDate(startDateObj.getDate() + (i - 1));
      const dateStrISO = currentDayDate.toISOString().split('T')[0];

      // Count sections matching this day
      const count = trip.sections.filter((s) => {
        const sStart = normalizeToISODate(s.startDate);
        const sEnd = normalizeToISODate(s.endDate);
        if (!sStart) return false;
        return dateStrISO >= sStart && dateStrISO <= (sEnd || sStart);
      }).length;

      const dateStrDisplay = currentDayDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      tabs.push({
        dayNumber: i,
        label: `Day ${i}`,
        dateStr: dateStrDisplay,
        count,
      });
    }

    return tabs;
  }, [trip, durationDays]);

  // Filtered & Sorted Sections
  const filteredSections = useMemo(() => {
    if (!trip) return [];

    let list = [...trip.sections];

    // 1. Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.title.toLowerCase().includes(q) ||
          s.description?.toLowerCase().includes(q) ||
          s.location?.toLowerCase().includes(q) ||
          s.notes?.toLowerCase().includes(q)
      );
    }

    // 2. Category Filter
    if (selectedCategory !== 'all') {
      if (selectedCategory === 'activity') {
        list = list.filter((s) => s.type === 'activity' || s.type === 'sightseeing');
      } else {
        list = list.filter((s) => s.type === selectedCategory);
      }
    }

    // 3. Day Filter
    if (selectedDay !== 'all' && trip) {
      const startISO = normalizeToISODate(trip.startDate);
      if (startISO) {
        const startDateObj = new Date(startISO);
        const targetDate = new Date(startDateObj);
        targetDate.setDate(startDateObj.getDate() + (selectedDay - 1));
        const targetISO = targetDate.toISOString().split('T')[0];

        list = list.filter((s) => {
          const sStart = normalizeToISODate(s.startDate);
          const sEnd = normalizeToISODate(s.endDate);
          if (!sStart) return false;
          return targetISO >= sStart && targetISO <= (sEnd || sStart);
        });
      }
    }

    // 4. Sort
    list.sort((a, b) => {
      switch (sortBy) {
        case 'time-asc':
          return (a.startDate || '').localeCompare(b.startDate || '') || (a.startTime || '').localeCompare(b.startTime || '');
        case 'time-desc':
          return (b.startDate || '').localeCompare(a.startDate || '') || (b.startTime || '').localeCompare(a.startTime || '');
        case 'cost-asc':
          return (Number(a.budget) || 0) - (Number(b.budget) || 0);
        case 'cost-desc':
          return (Number(b.budget) || 0) - (Number(a.budget) || 0);
        case 'name-asc':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return list;
  }, [trip, searchQuery, selectedCategory, selectedDay, sortBy]);

  // Timeline Groups Structure
  const timelineGroups: TimelineGroup[] = useMemo(() => {
    if (!trip) return [];

    const totalDays = durationDays;
    const startISO = normalizeToISODate(trip.startDate);
    const startDateObj = startISO ? new Date(startISO) : new Date();

    const groups: TimelineGroup[] = [];

    const daysToRender = selectedDay === 'all' ? Array.from({ length: totalDays }, (_, i) => i + 1) : [selectedDay];

    daysToRender.forEach((dayNum) => {
      const currentDayDate = new Date(startDateObj);
      currentDayDate.setDate(startDateObj.getDate() + (dayNum - 1));
      const dateStrISO = currentDayDate.toISOString().split('T')[0];

      // Match sections for this day
      const daySections = filteredSections.filter((s) => {
        const sStart = normalizeToISODate(s.startDate);
        const sEnd = normalizeToISODate(s.endDate);
        if (!sStart) return false;
        return dateStrISO >= sStart && dateStrISO <= (sEnd || sStart);
      });

      // Find appropriate destination city
      let matchedCity: string | undefined;
      if (trip.destinations && trip.destinations.length > 0) {
        // Distribute destinations proportionally across days
        const cityIndex = Math.min(
          trip.destinations.length - 1,
          Math.floor(((dayNum - 1) / totalDays) * trip.destinations.length)
        );
        matchedCity = `${trip.destinations[cityIndex].city}, ${trip.destinations[cityIndex].country}`;
      }

      if (daySections.length > 0 || selectedDay !== 'all') {
        groups.push({
          dayNumber: dayNum,
          dateStr: dateStrISO,
          city: matchedCity,
          sections: daySections,
        });
      }
    });

    return groups;
  }, [trip, durationDays, selectedDay, filteredSections]);

  // Overlap detection
  const overlappingMap = useMemo(() => {
    if (!trip || trip.sections.length <= 1) return new Map<string, string>();

    const map = new Map<string, string>();
    for (let i = 0; i < trip.sections.length; i++) {
      for (let j = i + 1; j < trip.sections.length; j++) {
        const s1 = trip.sections[i];
        const s2 = trip.sections[j];

        const overlap = s1.startDate <= s2.endDate && s2.startDate <= s1.endDate;
        if (overlap) {
          map.set(s1.id, s2.title);
          map.set(s2.id, s1.title);
        }
      }
    }
    return map;
  }, [trip]);

  // Section CRUD Handlers
  const handleOpenCreateForm = () => {
    setEditingSection(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (section: ItinerarySection) => {
    setEditingSection(section);
    setIsFormOpen(true);
  };

  const handleSaveSection = (sectionData: Omit<ItinerarySection, 'id' | 'order'>) => {
    if (!trip) return;

    if (editingSection) {
      const updated = tripService.updateItinerarySection(trip.id, editingSection.id, sectionData);
      if (updated) {
        setTrip({ ...updated });
        showToast('success', 'Section Updated', `"${sectionData.title}" has been updated.`);
        setIsFormOpen(false);
        setEditingSection(null);
      }
    } else {
      const updated = tripService.addItinerarySection(trip.id, sectionData);
      if (updated) {
        setTrip({ ...updated });
        showToast('success', 'Section Added', `"${sectionData.title}" added to your itinerary.`);
        setIsFormOpen(false);
        setEditingSection(null);
      }
    }
  };

  const handleOpenDeleteModal = (section: ItinerarySection) => {
    setDeletingSection(section);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    if (!trip || !deletingSection) return;

    const updated = tripService.deleteItinerarySection(trip.id, deletingSection.id);
    if (updated) {
      setTrip({ ...updated });
      showToast('info', 'Section Removed', `"${deletingSection.title}" was removed from the itinerary.`);
    }
    setIsDeleteModalOpen(false);
    setDeletingSection(null);
  };

  const handleMoveUp = (sectionId: string) => {
    if (!trip) return;
    const index = trip.sections.findIndex((s) => s.id === sectionId);
    if (index <= 0) return;

    const newSections = [...trip.sections];
    const temp = newSections[index - 1];
    newSections[index - 1] = newSections[index];
    newSections[index] = temp;

    const updated = tripService.reorderItinerarySections(
      trip.id,
      newSections.map((s) => s.id)
    );
    if (updated) setTrip({ ...updated });
  };

  const handleMoveDown = (sectionId: string) => {
    if (!trip) return;
    const index = trip.sections.findIndex((s) => s.id === sectionId);
    if (index === -1 || index >= trip.sections.length - 1) return;

    const newSections = [...trip.sections];
    const temp = newSections[index + 1];
    newSections[index + 1] = newSections[index];
    newSections[index] = temp;

    const updated = tripService.reorderItinerarySections(
      trip.id,
      newSections.map((s) => s.id)
    );
    if (updated) setTrip({ ...updated });
  };

  // Quick-add suggestion into a new section
  const handleQuickAddPlace = (place: SuggestedPlace) => {
    if (!trip) return;
    const sectionData: Omit<ItinerarySection, 'id' | 'order'> = {
      type: 'sightseeing',
      title: place.name,
      description: `Visit ${place.name} (${place.category}) in ${place.city}.`,
      startDate: trip.startDate,
      endDate: trip.startDate,
      location: `${place.name}, ${place.city}`,
      budget: 2500,
    };
    const updated = tripService.addItinerarySection(trip.id, sectionData);
    if (updated) {
      setTrip({ ...updated });
      showToast('success', 'Added to Itinerary', `"${place.name}" added to your schedule.`);
    }
  };

  const handleQuickAddActivity = (act: SuggestedActivity) => {
    if (!trip) return;
    let budget = 4500;
    const match = act.estimatedCost.match(/([0-9,]+)/);
    if (match) {
      const num = parseInt(match[1].replace(/,/g, ''), 10);
      budget = num > 0 ? (act.estimatedCost.includes('€') ? num * 90 : num) : 4500;
    }

    const sectionData: Omit<ItinerarySection, 'id' | 'order'> = {
      type: 'activity',
      title: act.name,
      description: `Experience ${act.name} in ${act.city}. Duration: ${act.duration}.`,
      startDate: trip.endDate,
      endDate: trip.endDate,
      location: `${act.name}, ${act.city}`,
      budget,
    };
    const updated = tripService.addItinerarySection(trip.id, sectionData);
    if (updated) {
      setTrip({ ...updated });
      showToast('success', 'Added to Itinerary', `"${act.name}" added to your schedule.`);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#F7F1E5] flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-10 h-10 border-3 border-[#F4C95D] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs text-[#6F6A60] font-medium">Loading your itinerary...</p>
        </div>
      </div>
    );
  }

  if (isUnauthorized) {
    return (
      <div className="min-h-screen bg-[#F7F1E5] flex flex-col justify-between">
        <LandingNavbar />
        <main className="flex-1 max-w-lg mx-auto px-4 flex items-center justify-center py-16">
          <div className="bg-[#FFF9EE] border border-[#DAD4C7] rounded-3xl p-8 text-center space-y-4 shadow-sm w-full">
            <div className="w-14 h-14 rounded-full bg-[#FAECE7] text-[#D96B43] mx-auto flex items-center justify-center">
              <ShieldAlert className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#252525]">Private Trip</h2>
            <p className="text-xs text-[#6F6A60] leading-relaxed">
              You do not have permission to view or edit this trip itinerary because it belongs to a different explorer account.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/trips">
                <Button variant="primary" size="md" fullWidth>
                  Go to My Trips
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!trip) {
    return (
      <div className="min-h-screen bg-[#F7F1E5] flex flex-col justify-between">
        <LandingNavbar />
        <main className="flex-1 max-w-lg mx-auto px-4 flex items-center justify-center py-16">
          <div className="bg-[#FFF9EE] border border-[#DAD4C7] rounded-3xl p-8 text-center space-y-4 shadow-sm w-full">
            <div className="w-14 h-14 rounded-full bg-[#FAECE7] text-[#D96B43] mx-auto flex items-center justify-center">
              <AlertCircle className="w-7 h-7" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#252525]">Trip Not Found</h2>
            <p className="text-xs text-[#6F6A60] leading-relaxed">
              We couldn't locate the requested trip itinerary. It might have been removed or belongs to a different session.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/trips">
                <Button variant="primary" size="md" fullWidth>
                  Return to My Trips
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F1E5] text-[#252525] flex flex-col justify-between selection:bg-[#F4C95D]/40">
      {/* 1. Global Navigation */}
      <LandingNavbar />

      {/* 2. Main Discovery & Itinerary Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            to="/trips"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6F6A60] hover:text-[#252525] bg-[#FFF9EE]/90 px-3.5 py-1.5 rounded-full border border-[#DAD4C7]/60 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Trips
          </Link>
        </div>

        {/* 3. Trip Editorial Header (Screen 9 Specification) */}
        <div className="bg-[#FFF9EE] border border-[#DAD4C7]/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-3 py-1 rounded-full bg-[#E7EFEA] border border-[#C2D7CC] text-xs font-bold text-[#4E7360]">
                  {getTripStatus(trip.startDate, trip.endDate)}
                </span>
                <span className="text-xs font-semibold text-[#6F6A60] flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-[#C29326]" />
                  {formatDisplayDate(trip.startDate)} — {formatDisplayDate(trip.endDate)}
                </span>
              </div>

              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#252525] tracking-tight">
                {trip.name}
              </h1>

              {/* Destination Badges */}
              <div className="flex flex-wrap items-center gap-2 pt-1">
                {trip.destinations && trip.destinations.length > 0 ? (
                  trip.destinations.map((d) => (
                    <span
                      key={d.id}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-[#252525] bg-white px-3 py-1 rounded-xl border border-[#DAD4C7]/80 shadow-2xs"
                    >
                      <MapPin className="w-3.5 h-3.5 text-[#C29326]" />
                      {d.city}, {d.country}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-[#8C867B] italic">No destinations assigned yet</span>
                )}
              </div>

              {/* Metrics Pill */}
              <p className="text-xs font-bold text-[#8C867B] pt-1">
                {durationDays} Days • {trip.destinations?.length || 0} Cities • {trip.sections.length} Activities & Segments
              </p>
            </div>

            {/* Header Action CTAs */}
            <div className="flex flex-wrap items-center gap-3 shrink-0">
              <Button
                type="button"
                variant="outline"
                size="md"
                onClick={() => setIsShareModalOpen(true)}
                leftIcon={<Share2 className="w-4 h-4 text-[#C29326]" />}
                className="text-xs font-bold"
              >
                Share Trip
              </Button>

              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleOpenCreateForm}
                leftIcon={<Plus className="w-4 h-4" />}
                className="text-xs font-bold shadow-sm"
              >
                + Add Itinerary Section
              </Button>
            </div>
          </div>

          {/* View Mode Toggle Switch */}
          <div className="pt-4 border-t border-[#DAD4C7]/60 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center p-1 bg-[#FCFAF5] rounded-2xl border border-[#DAD4C7]/80">
              <button
                type="button"
                onClick={() => setViewMode('timeline')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'timeline'
                    ? 'bg-[#F4C95D] text-[#252525] shadow-xs'
                    : 'text-[#6F6A60] hover:text-[#252525]'
                }`}
              >
                <Clock className="w-3.5 h-3.5" /> Timeline View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'list'
                    ? 'bg-[#F4C95D] text-[#252525] shadow-xs'
                    : 'text-[#6F6A60] hover:text-[#252525]'
                }`}
              >
                <List className="w-3.5 h-3.5" /> Day-by-Day List
              </button>
              <button
                type="button"
                onClick={() => setViewMode('builder')}
                className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  viewMode === 'builder'
                    ? 'bg-[#F4C95D] text-[#252525] shadow-xs'
                    : 'text-[#6F6A60] hover:text-[#252525]'
                }`}
              >
                <Layers className="w-3.5 h-3.5" /> Builder & Ordering
              </button>
            </div>

            {/* Quick Stats Pill */}
            <div className="text-xs font-semibold text-[#6F6A60]">
              Estimated Budget: <span className="font-bold text-[#252525]">₹{(trip.totalBudget ?? 0).toLocaleString('en-IN')}</span>
            </div>
          </div>
        </div>

        {/* 4. Quick Add Recommendations Bar (if any selected places/activities exist) */}
        {((trip.selectedPlaces && trip.selectedPlaces.length > 0) ||
          (trip.selectedActivities && trip.selectedActivities.length > 0)) && (
          <div className="bg-[#FFF9EE] border border-[#DAD4C7]/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-[#252525] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C29326]" /> Quick Add from Your Trip Wishlist
              </span>
              <span className="text-[11px] text-[#6F6A60]">1-click add to itinerary</span>
            </div>

            <div className="flex flex-wrap gap-2">
              {trip.selectedPlaces?.map((place) => (
                <button
                  key={place.id}
                  type="button"
                  onClick={() => handleQuickAddPlace(place)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-white/80 hover:bg-white border border-[#DAD4C7] hover:border-[#E5B740] text-xs font-medium text-[#252525] transition-colors cursor-pointer shadow-2xs group"
                >
                  <Plus className="w-3 h-3 text-[#C29326] group-hover:scale-110 transition-transform" />
                  <span>{place.name}</span>
                </button>
              ))}

              {trip.selectedActivities?.map((act) => (
                <button
                  key={act.id}
                  type="button"
                  onClick={() => handleQuickAddActivity(act)}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#E7EFEA]/80 hover:bg-[#E7EFEA] border border-[#C1D9CA] text-xs font-medium text-[#334D40] transition-colors cursor-pointer shadow-2xs group"
                >
                  <Plus className="w-3 h-3 text-[#4E7360] group-hover:scale-110 transition-transform" />
                  <span>{act.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 5. Main Screen Layout: Itinerary Timeline & Budget Breakdown Panel */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Main Itinerary Content Column (8 cols on desktop) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Search, Filter & Sort Controls Toolbar */}
            <div className="bg-[#FFF9EE] p-4 rounded-2xl border border-[#DAD4C7]/80 space-y-3 shadow-2xs">
              <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C867B]" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search activities, hotel stays, tours, notes..."
                    className="w-full h-10 pl-9 pr-8 bg-white border border-[#DAD4C7] rounded-xl text-xs text-[#252525] focus:outline-none focus:border-[#E3B443] focus:ring-2 focus:ring-[#F4C95D]/20"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#8C867B] hover:text-[#252525]"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-1.5 shrink-0 text-xs">
                  <Filter className="w-3.5 h-3.5 text-[#C29326]" />
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="h-10 px-2.5 bg-white border border-[#DAD4C7] rounded-xl font-semibold text-[#252525] focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="all">All Categories</option>
                    <option value="travel">Transport & Travel</option>
                    <option value="hotel">Hotel & Stays</option>
                    <option value="activity">Activities & Sightseeing</option>
                    <option value="food">Food & Dining</option>
                    <option value="other">Other</option>
                  </select>
                </div>

                {/* Sort Order */}
                <div className="flex items-center gap-1.5 shrink-0 text-xs">
                  <ArrowUpDown className="w-3.5 h-3.5 text-[#C29326]" />
                  <select
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value as ItinerarySortOption)}
                    className="h-10 px-2.5 bg-white border border-[#DAD4C7] rounded-xl font-semibold text-[#252525] focus:outline-none cursor-pointer text-xs"
                  >
                    <option value="time-asc">Time (Earliest First)</option>
                    <option value="time-desc">Time (Latest First)</option>
                    <option value="cost-desc">Cost (High to Low)</option>
                    <option value="cost-asc">Cost (Low to High)</option>
                    <option value="name-asc">Title (A-Z)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Horizontal Day Selector */}
            <DaySelector
              days={dayTabs}
              selectedDay={selectedDay}
              onSelectDay={(day) => setSelectedDay(day)}
            />

            {/* Main Sections Output based on View Mode */}
            {filteredSections.length === 0 ? (
              /* Empty State */
              <div className="bg-[#FFF9EE] border border-[#DAD4C7]/80 rounded-3xl p-10 text-center space-y-4 shadow-xs">
                <div className="w-14 h-14 rounded-full bg-[#E7EFEA] mx-auto flex items-center justify-center text-[#4E7360]">
                  <Layers className="w-7 h-7" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="text-lg font-serif font-bold text-[#252525]">
                    Your itinerary is ready to be planned
                  </h3>
                  <p className="text-xs text-[#6F6A60] leading-relaxed">
                    Add activities, hotel bookings, guided excursions, and dining reservations to build your perfect trip.
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="md"
                  onClick={handleOpenCreateForm}
                  leftIcon={<Plus className="w-4 h-4" />}
                >
                  + Add First Section
                </Button>
              </div>
            ) : viewMode === 'timeline' ? (
              /* Timeline View */
              <ItineraryTimeline
                groups={timelineGroups}
                onEditSection={handleOpenEditForm}
                onDeleteSection={handleOpenDeleteModal}
                highlightCategory={selectedCategory !== 'all' ? selectedCategory : null}
              />
            ) : (
              /* List & Builder Views */
              <div className="space-y-4">
                {filteredSections.map((section, index) => (
                  <ItinerarySectionCard
                    key={section.id}
                    section={section}
                    displayIndex={index + 1}
                    isFirst={index === 0}
                    isLast={index === filteredSections.length - 1}
                    hasOverlap={overlappingMap.has(section.id)}
                    overlappingSectionTitle={overlappingMap.get(section.id)}
                    onEdit={handleOpenEditForm}
                    onDelete={handleOpenDeleteModal}
                    onMoveUp={handleMoveUp}
                    onMoveDown={handleMoveDown}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Column: Budget Breakdown Summary Card (4 cols on desktop) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <BudgetSummaryCard
              trip={trip}
              durationDays={durationDays}
              selectedCategoryFilter={selectedCategory !== 'all' ? selectedCategory : null}
              onSelectCategoryFilter={(cat) => setSelectedCategory(cat || 'all')}
            />

            {/* Quick Actions Panel */}
            <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-5 space-y-3 text-xs shadow-xs">
              <span className="text-[11px] uppercase font-bold tracking-wider text-[#8C867B] block">
                Trip Explorer Actions
              </span>
              <div className="space-y-2">
                <Link to="/cities" className="block">
                  <Button variant="outline" size="sm" fullWidth className="font-semibold text-xs">
                    Explore More Cities
                  </Button>
                </Link>
                <Link to="/activities" className="block">
                  <Button variant="outline" size="sm" fullWidth className="font-semibold text-xs">
                    Browse Activity Ideas
                  </Button>
                </Link>
                <Link to="/community" className="block">
                  <Button variant="outline" size="sm" fullWidth className="font-semibold text-xs">
                    See Community Guides
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Section Create / Edit Modal Form */}
      <ItinerarySectionForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingSection(null);
        }}
        onSave={handleSaveSection}
        initialData={editingSection}
        trip={trip}
        mode={editingSection ? 'edit' : 'create'}
      />

      {/* Delete Confirmation Modal */}
      <DeleteSectionModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingSection(null);
        }}
        onConfirm={handleConfirmDelete}
        section={deletingSection}
      />

      {/* Share Trip Modal */}
      <ShareTripModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        trip={trip}
      />

      {/* Universal Footer */}
      <Footer />
    </div>
  );
};
