import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Calendar,
  Sparkles,
  MapPin,
  Compass,
  ArrowRight,
  CheckCircle2,
  Bookmark,
} from 'lucide-react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { Input } from '../components/ui/Input';
import { Button } from '../components/ui/Button';
import { DestinationSearch } from '../components/trips/DestinationSearch';
import { SuggestionPlaceCard } from '../components/trips/SuggestionPlaceCard';
import { SuggestionActivityCard } from '../components/trips/SuggestionActivityCard';
import { SectionHeader } from '../components/landing/SectionHeader';
import {
  availableDestinationOptions,
  mockSuggestedPlaces,
  mockSuggestedActivities,
} from '../data/tripSuggestions';
import { CreateTripFormData, TripDestinationOption } from '../types/trip';
import { tripService } from '../services/tripService';
import { authService } from '../services/authService';
import { useToast } from '../context/ToastContext';

export const CreateTrip: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<CreateTripFormData>({
    tripName: '',
    startDate: '',
    endDate: '',
    destinations: [availableDestinationOptions[0]], // Default pre-select Paris for smooth UX
    selectedPlaceIds: ['place_eiffel'],
    selectedActivityIds: ['act_seine_cruise'],
    notes: '',
  });

  const [errors, setErrors] = useState<{
    tripName?: string;
    startDate?: string;
    endDate?: string;
    destinations?: string;
  }>({});

  const [activeTab, setActiveTab] = useState<'all' | 'places' | 'activities'>('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Destination management
  const handleAddDestination = (dest: TripDestinationOption) => {
    setFormData((prev) => ({
      ...prev,
      destinations: [...prev.destinations, dest],
    }));
    setErrors((prev) => ({ ...prev, destinations: undefined }));
    showToast('info', 'Added Destination', `${dest.city} added to your itinerary route.`);
  };

  const handleRemoveDestination = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      destinations: prev.destinations.filter((d) => d.id !== id),
    }));
  };

  // Place & Activity toggles
  const handleTogglePlace = (id: string) => {
    setFormData((prev) => {
      const exists = prev.selectedPlaceIds.includes(id);
      const updated = exists
        ? prev.selectedPlaceIds.filter((p) => p !== id)
        : [...prev.selectedPlaceIds, id];
      return { ...prev, selectedPlaceIds: updated };
    });
  };

  const handleToggleActivity = (id: string) => {
    setFormData((prev) => {
      const exists = prev.selectedActivityIds.includes(id);
      const updated = exists
        ? prev.selectedActivityIds.filter((a) => a !== id)
        : [...prev.selectedActivityIds, id];
      return { ...prev, selectedActivityIds: updated };
    });
  };

  // Validation
  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    if (!formData.tripName.trim()) {
      newErrors.tripName = 'Please enter a trip name.';
    }

    if (!formData.startDate) {
      newErrors.startDate = 'Please select a start date.';
    }

    if (!formData.endDate) {
      newErrors.endDate = 'Please select an end date.';
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date cannot be before start date.';
    }

    if (formData.destinations.length === 0) {
      newErrors.destinations = 'Please select at least one destination.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Submission handler
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validate()) {
      showToast('error', 'Incomplete Form', 'Please correct the highlighted fields before proceeding.');
      return;
    }

    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      showToast('error', 'Authentication Required', 'Please sign in to save your trip.');
      navigate('/login?redirect=/trips/create');
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      // Find selected place objects
      const selectedPlaces = mockSuggestedPlaces.filter((p) =>
        formData.selectedPlaceIds.includes(p.id)
      );

      // Find selected activity objects
      const selectedActivities = mockSuggestedActivities.filter((a) =>
        formData.selectedActivityIds.includes(a.id)
      );

      // Save trip in service
      const newTrip = tripService.createTrip({
        userId: currentUser.id,
        name: formData.tripName.trim(),
        startDate: formData.startDate,
        endDate: formData.endDate,
        destinations: formData.destinations,
        selectedPlaces,
        selectedActivities,
        notes: formData.notes,
      });

      showToast(
        'success',
        'Trip Created!',
        `"${newTrip.name}" is initialized. Let's customize your itinerary schedule!`
      );

      setIsSubmitting(false);
      navigate(`/trips/${newTrip.id}/itinerary`);
    }, 600);
  };

  const totalSuggestionsAdded =
    formData.selectedPlaceIds.length + formData.selectedActivityIds.length;

  return (
    <div className="min-h-screen bg-[#F7F1E5] text-[#252525] flex flex-col justify-between">
      {/* Reusable Navbar */}
      <LandingNavbar />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
        {/* Back Link */}
        <div>
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#6F6A60] hover:text-[#252525] bg-[#FFF9EE]/80 px-3.5 py-1.5 rounded-full border border-[#DAD4C7]/60 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Back to Explore
          </Link>
        </div>

        {/* Page Title & Header */}
        <div className="text-center max-w-2xl mx-auto">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EFEA] text-[#334D40] text-xs font-semibold mb-2.5">
            <Sparkles className="w-3 h-3 text-[#4E7360]" />
            <span>AI-Assisted Trip Planner</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#252525] tracking-tight leading-tight">
            Create a New Trip
          </h1>
          <p className="text-sm text-[#6F6A60] mt-1.5 font-medium">
            Plan your journey, choose your destinations, and start building unforgettable memories.
          </p>
        </div>

        {/* Primary Trip Details Form Card */}
        <form onSubmit={handleSubmit} className="space-y-8" noValidate>
          <div
            className="glass-card rounded-[26px] p-6 sm:p-9 shadow-md relative z-10"
            style={{
              boxShadow: '0 20px 45px -10px rgba(45, 37, 24, 0.10)',
            }}
          >
            {/* Golden top highlight line */}
            <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#F4C95D]/60 to-transparent rounded-full" />

            <div className="flex items-center gap-2.5 pb-4 mb-6 border-b border-[#DAD4C7]/60">
              <div className="w-8 h-8 rounded-xl bg-[#F4C95D]/30 text-[#C29326] flex items-center justify-center">
                <Compass className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#252525]">Trip Overview</h3>
                <p className="text-xs text-[#6F6A60]">Define the core details of your upcoming adventure</p>
              </div>
            </div>

            <div className="space-y-5">
              {/* Trip Name Field */}
              <Input
                label="Trip Name"
                placeholder="e.g. European Grand Tour 2026, Tokyo Sakura Journey"
                value={formData.tripName}
                error={errors.tripName}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, tripName: e.target.value }));
                  setErrors((prev) => ({ ...prev, tripName: undefined }));
                }}
                required
              />

              {/* Dates Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-[13px] font-medium text-[#48443E] mb-1.5 select-none flex items-center justify-between">
                    <span>
                      Start Date <span className="text-[#D96B43]">*</span>
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-[#8C867B] pointer-events-none">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      value={formData.startDate}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, startDate: e.target.value }));
                        setErrors((prev) => ({ ...prev, startDate: undefined }));
                      }}
                      className={`w-full h-12 text-[14px] text-[#252525] bg-white/85 border rounded-xl pl-11 pr-3.5 transition-all duration-200 focus:outline-none focus:bg-white ${
                        errors.startDate
                          ? 'border-[#D96B43] focus:ring-4 focus:ring-[#D96B43]/15'
                          : 'border-[#DAD4C7] hover:border-[#B7B0A2] focus:border-[#E3B443] focus:ring-4 focus:ring-[#F4C95D]/20'
                      }`}
                    />
                  </div>
                  {errors.startDate && (
                    <p className="text-[12px] text-[#D96B43] mt-1">{errors.startDate}</p>
                  )}
                </div>

                <div>
                  <label className="text-[13px] font-medium text-[#48443E] mb-1.5 select-none flex items-center justify-between">
                    <span>
                      End Date <span className="text-[#D96B43]">*</span>
                    </span>
                  </label>
                  <div className="relative flex items-center">
                    <div className="absolute left-3.5 text-[#8C867B] pointer-events-none">
                      <Calendar className="w-4 h-4" />
                    </div>
                    <input
                      type="date"
                      value={formData.endDate}
                      min={formData.startDate || undefined}
                      onChange={(e) => {
                        setFormData((prev) => ({ ...prev, endDate: e.target.value }));
                        setErrors((prev) => ({ ...prev, endDate: undefined }));
                      }}
                      className={`w-full h-12 text-[14px] text-[#252525] bg-white/85 border rounded-xl pl-11 pr-3.5 transition-all duration-200 focus:outline-none focus:bg-white ${
                        errors.endDate
                          ? 'border-[#D96B43] focus:ring-4 focus:ring-[#D96B43]/15'
                          : 'border-[#DAD4C7] hover:border-[#B7B0A2] focus:border-[#E3B443] focus:ring-4 focus:ring-[#F4C95D]/20'
                      }`}
                    />
                  </div>
                  {errors.endDate && (
                    <p className="text-[12px] text-[#D96B43] mt-1">{errors.endDate}</p>
                  )}
                </div>
              </div>

              {/* Multi-Destination Search & Selection */}
              <DestinationSearch
                selectedDestinations={formData.destinations}
                onAddDestination={handleAddDestination}
                onRemoveDestination={handleRemoveDestination}
                error={errors.destinations}
              />
            </div>
          </div>

          {/* Section: Suggested Places to Visit & Activities */}
          <div className="space-y-5">
            <SectionHeader
              title="Recommended for Your Trip"
              subtitle="Handpicked sights, monuments, and experiences tailored to your selected destinations"
              action={
                <div className="flex items-center gap-1.5 bg-[#FFF9EE] p-1 rounded-xl border border-[#DAD4C7] text-xs font-semibold">
                  <button
                    type="button"
                    onClick={() => setActiveTab('all')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'all'
                        ? 'bg-[#F4C95D] text-[#252525] shadow-2xs'
                        : 'text-[#6F6A60] hover:text-[#252525]'
                    }`}
                  >
                    All
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('places')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'places'
                        ? 'bg-[#F4C95D] text-[#252525] shadow-2xs'
                        : 'text-[#6F6A60] hover:text-[#252525]'
                    }`}
                  >
                    Places ({mockSuggestedPlaces.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('activities')}
                    className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                      activeTab === 'activities'
                        ? 'bg-[#F4C95D] text-[#252525] shadow-2xs'
                        : 'text-[#6F6A60] hover:text-[#252525]'
                    }`}
                  >
                    Activities ({mockSuggestedActivities.length})
                  </button>
                </div>
              }
            />

            {/* Places Section */}
            {(activeTab === 'all' || activeTab === 'places') && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-serif font-bold text-[#252525] flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#C29326]" /> Must-Visit Places & Landmarks
                  </h3>
                  <span className="text-xs text-[#6F6A60]">
                    {formData.selectedPlaceIds.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockSuggestedPlaces.map((place) => (
                    <SuggestionPlaceCard
                      key={place.id}
                      place={place}
                      isAdded={formData.selectedPlaceIds.includes(place.id)}
                      onToggleAdd={handleTogglePlace}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Activities Section */}
            {(activeTab === 'all' || activeTab === 'activities') && (
              <div className="space-y-3 pt-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-serif font-bold text-[#252525] flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-[#4E7360]" /> Curated Activities & Experiences
                  </h3>
                  <span className="text-xs text-[#6F6A60]">
                    {formData.selectedActivityIds.length} selected
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {mockSuggestedActivities.map((act) => (
                    <SuggestionActivityCard
                      key={act.id}
                      activity={act}
                      isAdded={formData.selectedActivityIds.includes(act.id)}
                      onToggleAdd={handleToggleActivity}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sticky Bottom Action Bar */}
          <div className="sticky bottom-4 z-30 bg-[#FFF9EE]/95 backdrop-blur-md border border-white shadow-xl shadow-[#252525]/10 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-xs text-[#6F6A60] w-full sm:w-auto justify-between sm:justify-start">
              <div className="flex items-center gap-1.5 font-semibold text-[#252525]">
                <CheckCircle2 className="w-4 h-4 text-[#4E7360]" />
                <span>{formData.destinations.length} destination(s)</span>
              </div>
              <span>•</span>
              <div className="flex items-center gap-1.5">
                <Bookmark className="w-4 h-4 text-[#C29326]" />
                <span>{totalSuggestionsAdded} items added to plan</span>
              </div>
            </div>

            <div className="w-full sm:w-auto flex items-center gap-3">
              <Link to="/" className="hidden sm:inline-block">
                <Button type="button" variant="outline" size="md">
                  Cancel
                </Button>
              </Link>

              <Button
                type="submit"
                variant="primary"
                size="lg"
                fullWidth
                isLoading={isSubmitting}
                loadingText="Creating your trip..."
                rightIcon={<ArrowRight className="w-4 h-4" />}
                className="shadow-md hover:shadow-lg w-full sm:w-auto min-w-[200px]"
              >
                Create Trip
              </Button>
            </div>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#DAD4C7]/80 bg-[#FFF9EE]/80 backdrop-blur-md mt-16 py-6 px-4 sm:px-8 text-center text-xs text-[#8C867B]">
        GlobeTrotter Personalized Travel Planning Platform • Step 1: Trip Initialization
      </footer>
    </div>
  );
};
