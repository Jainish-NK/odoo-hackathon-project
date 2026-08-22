import React, { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Plus,
  AlertCircle,
  Sparkles,
  ArrowRight,
  Layers,
} from 'lucide-react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { TripSummary } from '../components/itinerary/TripSummary';
import { ItinerarySectionCard } from '../components/itinerary/ItinerarySectionCard';
import { ItinerarySectionForm } from '../components/itinerary/ItinerarySectionForm';
import { DeleteSectionModal } from '../components/itinerary/DeleteSectionModal';
import { SectionHeader } from '../components/landing/SectionHeader';
import { Button } from '../components/ui/Button';
import { tripService } from '../services/tripService';
import { authService } from '../services/authService';
import { Trip, ItinerarySection, SuggestedPlace, SuggestedActivity } from '../types/trip';
import { useToast } from '../context/ToastContext';

export const BuildItinerary: React.FC = () => {
  const { tripId } = useParams<{ tripId: string }>();
  const navigate = useNavigate();
  const { showToast } = useToast();

  const currentUser = authService.getCurrentUser();

  const [trip, setTrip] = useState<Trip | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Modal states
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingSection, setEditingSection] = useState<ItinerarySection | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingSection, setDeletingSection] = useState<ItinerarySection | null>(null);

  // Load trip on mount or param change
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
        setTrip(found);
      }
    }
    setIsLoading(false);
  }, [tripId, currentUser, navigate]);

  // Overlap detection helper
  const overlappingMap = useMemo(() => {
    if (!trip || trip.sections.length <= 1) return new Map<string, string>();

    const map = new Map<string, string>();
    for (let i = 0; i < trip.sections.length; i++) {
      for (let j = i + 1; j < trip.sections.length; j++) {
        const s1 = trip.sections[i];
        const s2 = trip.sections[j];

        // Check if date ranges overlap: max(start1, start2) <= min(end1, end2)
        const overlap = s1.startDate <= s2.endDate && s2.startDate <= s1.endDate;
        if (overlap) {
          map.set(s1.id, s2.title);
          map.set(s2.id, s1.title);
        }
      }
    }
    return map;
  }, [trip]);

  // Handlers for section actions
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
              We couldn't locate the requested trip itinerary. It might have been removed or belongs to a different account session.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link to="/trips/create">
                <Button variant="primary" size="md" fullWidth>
                  Create a New Trip
                </Button>
              </Link>
              <Link to="/">
                <Button variant="outline" size="md" fullWidth>
                  Return to Home
                </Button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F1E5] text-[#252525] flex flex-col justify-between">
      {/* Top Reusable Navbar */}
      <LandingNavbar />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6F6A60] hover:text-[#252525] bg-[#FFF9EE]/80 px-3.5 py-1.5 rounded-full border border-[#DAD4C7]/60 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to My Trips & Explore
          </Link>
        </div>

        {/* Page Heading */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EFEA] text-[#334D40] text-xs font-semibold mb-2.5">
            <Sparkles className="w-3 h-3 text-[#4E7360]" />
            <span>Itinerary Builder</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#252525] tracking-tight leading-tight">
            Build Your Itinerary
          </h1>
          <p className="text-sm text-[#6F6A60] mt-1.5 font-medium">
            Organize your journey day by day, schedule key activities, and keep every detail in one place.
          </p>
        </div>

        {/* Trip Summary Card */}
        <TripSummary trip={trip} />

        {/* Quick-Add Recommendations Bar (if any selected places/activities exist) */}
        {((trip.selectedPlaces && trip.selectedPlaces.length > 0) ||
          (trip.selectedActivities && trip.selectedActivities.length > 0)) && (
          <div className="bg-[#FFF9EE] border border-[#DAD4C7]/80 rounded-2xl p-4 sm:p-5 shadow-2xs space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-serif font-bold text-[#252525] flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#C29326]" /> Quick Add from Your Trip Selections
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

        {/* Itinerary Sections Section */}
        <section className="space-y-5">
          <SectionHeader
            title="Itinerary Timeline & Sections"
            subtitle="Manage your schedule, bookings, and regional segments in sequential order"
            action={
              <Button
                type="button"
                variant="primary"
                size="md"
                onClick={handleOpenCreateForm}
                leftIcon={<Plus className="w-4 h-4 text-[#252525]" />}
                className="shadow-sm hover:shadow-md"
              >
                + Add another Section
              </Button>
            }
          />

          {/* Sections List */}
          {trip.sections.length > 0 ? (
            <div className="space-y-4">
              {trip.sections.map((section, index) => (
                <ItinerarySectionCard
                  key={section.id}
                  section={section}
                  displayIndex={index + 1}
                  isFirst={index === 0}
                  isLast={index === trip.sections.length - 1}
                  hasOverlap={overlappingMap.has(section.id)}
                  overlappingSectionTitle={overlappingMap.get(section.id)}
                  onEdit={handleOpenEditForm}
                  onDelete={handleOpenDeleteModal}
                  onMoveUp={handleMoveUp}
                  onMoveDown={handleMoveDown}
                />
              ))}
            </div>
          ) : (
            /* Empty State */
            <div className="bg-[#FFF9EE] border border-[#DAD4C7]/80 rounded-3xl p-10 sm:p-12 text-center space-y-4 shadow-xs">
              <div className="w-14 h-14 rounded-full bg-[#E7EFEA] mx-auto flex items-center justify-center text-[#4E7360]">
                <Layers className="w-7 h-7" />
              </div>
              <div className="space-y-1 max-w-md mx-auto">
                <h3 className="text-lg font-serif font-bold text-[#252525]">
                  Your itinerary is currently empty
                </h3>
                <p className="text-xs text-[#6F6A60] leading-relaxed">
                  Start organizing your journey day by day. Add flights, hotel bookings, guided excursions, and dining reservations.
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
          )}

          {/* Secondary "+ Add another Section" Button below the list */}
          {trip.sections.length > 0 && (
            <div className="pt-2 text-center">
              <button
                type="button"
                onClick={handleOpenCreateForm}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#FFF9EE] hover:bg-white border-2 border-dashed border-[#DAD4C7] hover:border-[#E5B740] text-xs font-bold text-[#6F6A60] hover:text-[#252525] transition-all cursor-pointer shadow-2xs"
              >
                <Plus className="w-4 h-4 text-[#C29326]" /> Add another Section to this Itinerary
              </button>
            </div>
          )}
        </section>

        {/* Sticky Bottom Summary Bar */}
        <div className="sticky bottom-4 z-30 bg-[#FFF9EE]/95 backdrop-blur-md border border-white shadow-xl shadow-[#252525]/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-xs text-[#6F6A60] w-full sm:w-auto justify-between sm:justify-start">
            <div>
              <span className="text-[10px] uppercase font-semibold text-[#8C867B] block">Total Estimated Cost</span>
              <span className="text-base font-serif font-bold text-[#252525]">
                ₹{(trip.totalBudget ?? 0).toLocaleString('en-IN')}
              </span>
            </div>
            <span className="hidden sm:inline">•</span>
            <div className="hidden sm:block">
              <span className="text-[10px] uppercase font-semibold text-[#8C867B] block">Total Segments</span>
              <span className="font-semibold text-[#252525]">{trip.sections.length} activities scheduled</span>
            </div>
          </div>

          <div className="w-full sm:w-auto flex items-center gap-3">
            <Link to="/" className="w-full sm:w-auto">
              <Button
                variant="primary"
                size="md"
                fullWidth
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shadow-md hover:shadow-lg min-w-[200px]"
              >
                Done & Save Trip
              </Button>
            </Link>
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

      {/* Footer */}
      <footer className="border-t border-[#DAD4C7]/80 bg-[#FFF9EE]/80 backdrop-blur-md mt-16 py-6 px-4 sm:px-8 text-center text-xs text-[#8C867B]">
        GlobeTrotter Personalized Travel Planning Platform • Step 2: Itinerary Builder
      </footer>
    </div>
  );
};
