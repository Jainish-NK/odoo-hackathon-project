import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import {
  Plane,
  Building2,
  Camera,
  Compass,
  Utensils,
  Sparkles,
  Calendar,
  Clock,
  MapPin,
  Wallet,
  AlertCircle,
} from 'lucide-react';
import { ItinerarySection, ItinerarySectionType, Trip } from '../../types/trip';
import { normalizeToISODate } from '../../services/tripService';

interface ItinerarySectionFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (sectionData: Omit<ItinerarySection, 'id' | 'order'>) => void;
  initialData?: ItinerarySection | null;
  trip: Trip;
  mode: 'create' | 'edit';
}

interface SectionFormData {
  type: ItinerarySectionType;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  startTime: string;
  endTime: string;
  location: string;
  budget: string;
  notes: string;
}

const typeOptions: {
  type: ItinerarySectionType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  { type: 'travel', label: 'Travel', icon: Plane },
  { type: 'hotel', label: 'Hotel / Stay', icon: Building2 },
  { type: 'sightseeing', label: 'Sightseeing', icon: Camera },
  { type: 'activity', label: 'Activity', icon: Compass },
  { type: 'food', label: 'Food & Dining', icon: Utensils },
  { type: 'other', label: 'Other', icon: Sparkles },
];

export const ItinerarySectionForm: React.FC<ItinerarySectionFormProps> = ({
  isOpen,
  onClose,
  onSave,
  initialData,
  trip,
  mode,
}) => {
  const tripStartISO = normalizeToISODate(trip.startDate);
  const tripEndISO = normalizeToISODate(trip.endDate);

  const [formData, setFormData] = useState<SectionFormData>({
    type: 'activity',
    title: '',
    description: '',
    startDate: tripStartISO || '',
    endDate: tripStartISO || '',
    startTime: '',
    endTime: '',
    location: '',
    budget: '0',
    notes: '',
  });

  const [errors, setErrors] = useState<{
    title?: string;
    startDate?: string;
    endDate?: string;
    time?: string;
    budget?: string;
  }>({});

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize or reset form state ONLY when modal is opened or target initialData changes
  useEffect(() => {
    if (!isOpen) return;

    setIsSubmitting(false);
    setErrors({});

    if (initialData) {
      setFormData({
        type: initialData.type || 'activity',
        title: initialData.title || '',
        description: initialData.description || '',
        startDate: normalizeToISODate(initialData.startDate) || tripStartISO,
        endDate: normalizeToISODate(initialData.endDate) || tripStartISO,
        startTime: initialData.startTime || '',
        endTime: initialData.endTime || '',
        location: initialData.location || '',
        budget: String(initialData.budget ?? '0'),
        notes: initialData.notes || '',
      });
    } else {
      const defaultCity =
        trip.destinations && trip.destinations.length > 0
          ? `${trip.destinations[0].city}, ${trip.destinations[0].country}`
          : '';

      setFormData({
        type: 'activity',
        title: '',
        description: '',
        startDate: tripStartISO,
        endDate: tripStartISO,
        startTime: '',
        endTime: '',
        location: defaultCity,
        budget: '0',
        notes: '',
      });
    }
  }, [isOpen, initialData, tripStartISO]);

  const validate = (): boolean => {
    const newErrors: typeof errors = {};

    // 1. Title validation
    if (!formData.title.trim()) {
      newErrors.title = 'Section title is required.';
    }

    // 2. Start date validation
    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required.';
    } else if (tripStartISO && formData.startDate < tripStartISO) {
      newErrors.startDate = `Start date cannot be before trip start date (${tripStartISO}).`;
    } else if (tripEndISO && formData.startDate > tripEndISO) {
      newErrors.startDate = `Start date cannot be after trip end date (${tripEndISO}).`;
    }

    // 3. End date validation
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required.';
    } else if (formData.startDate && formData.endDate < formData.startDate) {
      newErrors.endDate = 'End date cannot be before start date.';
    } else if (tripEndISO && formData.endDate > tripEndISO) {
      newErrors.endDate = `End date cannot be after trip end date (${tripEndISO}).`;
    }

    // 4. Optional time validation (if on same day and both provided)
    if (
      formData.startDate === formData.endDate &&
      formData.startTime &&
      formData.endTime &&
      formData.endTime < formData.startTime
    ) {
      newErrors.time = 'End time must be after start time.';
    }

    // 5. Budget validation (must be non-negative number, 0 is allowed)
    const numBudget = Number(formData.budget);
    if (isNaN(numBudget)) {
      newErrors.budget = 'Please enter a valid numeric amount.';
    } else if (numBudget < 0) {
      newErrors.budget = 'Budget cannot be negative.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (!validate()) {
      return;
    }

    setIsSubmitting(true);

    const cleanData: Omit<ItinerarySection, 'id' | 'order'> = {
      type: formData.type,
      title: formData.title.trim(),
      description: formData.description.trim(),
      startDate: formData.startDate,
      endDate: formData.endDate,
      startTime: formData.startTime.trim() ? formData.startTime.trim() : undefined,
      endTime: formData.endTime.trim() ? formData.endTime.trim() : undefined,
      location: formData.location.trim() ? formData.location.trim() : undefined,
      budget: Math.max(0, Number(formData.budget) || 0),
      notes: formData.notes.trim() ? formData.notes.trim() : undefined,
    };

    onSave(cleanData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'Add Itinerary Section' : 'Edit Itinerary Section'}
      subtitle="Configure this schedule segment and allocate its estimated budget"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1" noValidate>
        {/* Section Type / Category Selector */}
        <div>
          <label className="text-[13px] font-medium text-[#48443E] mb-2 block select-none">
            Section Category <span className="text-[#D96B43]">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {typeOptions.map((opt) => {
              const Icon = opt.icon;
              const isSelected = formData.type === opt.type;
              return (
                <button
                  key={opt.type}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, type: opt.type }))}
                  className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-semibold transition-all cursor-pointer select-none ${
                    isSelected
                      ? 'bg-[#F4C95D] border-[#C29326] text-[#252525] shadow-xs ring-2 ring-[#F4C95D]/30'
                      : 'bg-white/80 border-[#DAD4C7] text-[#6F6A60] hover:bg-white hover:text-[#252525] hover:border-[#B7B0A2]'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Section Title Input */}
        <Input
          label="Section Title"
          placeholder="e.g. Louvre Museum Guided Tour, Eurostar Paris to Amsterdam..."
          value={formData.title}
          error={errors.title}
          onChange={(e) => {
            const val = e.target.value;
            setFormData((prev) => ({ ...prev, title: val }));
            if (errors.title) {
              setErrors((prev) => ({ ...prev, title: undefined }));
            }
          }}
          required
        />

        {/* Description Textarea */}
        <Textarea
          label="Description / Details (Optional)"
          placeholder="Add details, itinerary highlights, meeting locations, or confirmations..."
          rows={2}
          value={formData.description}
          onChange={(e) => {
            const val = e.target.value;
            setFormData((prev) => ({ ...prev, description: val }));
          }}
        />

        {/* Date Range Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[13px] font-medium text-[#48443E] mb-1.5 block select-none">
              Start Date <span className="text-[#D96B43]">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C867B] pointer-events-none">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                min={tripStartISO || undefined}
                max={tripEndISO || undefined}
                value={formData.startDate}
                onChange={(e) => {
                  const newStart = e.target.value;
                  setFormData((prev) => {
                    const nextEnd = prev.endDate && prev.endDate < newStart ? newStart : prev.endDate;
                    return { ...prev, startDate: newStart, endDate: nextEnd };
                  });
                  setErrors((prev) => ({ ...prev, startDate: undefined, endDate: undefined }));
                }}
                className={`w-full h-11 text-[13px] text-[#252525] bg-white/85 border rounded-xl pl-10 pr-3 focus:outline-none focus:bg-white transition-all cursor-pointer ${
                  errors.startDate
                    ? 'border-[#D96B43] focus:ring-2 focus:ring-[#D96B43]/20'
                    : 'border-[#DAD4C7] focus:border-[#E3B443] focus:ring-2 focus:ring-[#F4C95D]/20'
                }`}
              />
            </div>
            {errors.startDate && (
              <p className="text-[11px] text-[#D96B43] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.startDate}</span>
              </p>
            )}
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#48443E] mb-1.5 block select-none">
              End Date <span className="text-[#D96B43]">*</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C867B] pointer-events-none">
                <Calendar className="w-4 h-4" />
              </div>
              <input
                type="date"
                min={formData.startDate || tripStartISO || undefined}
                max={tripEndISO || undefined}
                value={formData.endDate}
                onChange={(e) => {
                  const newEnd = e.target.value;
                  setFormData((prev) => ({ ...prev, endDate: newEnd }));
                  setErrors((prev) => ({ ...prev, endDate: undefined }));
                }}
                className={`w-full h-11 text-[13px] text-[#252525] bg-white/85 border rounded-xl pl-10 pr-3 focus:outline-none focus:bg-white transition-all cursor-pointer ${
                  errors.endDate
                    ? 'border-[#D96B43] focus:ring-2 focus:ring-[#D96B43]/20'
                    : 'border-[#DAD4C7] focus:border-[#E3B443] focus:ring-2 focus:ring-[#F4C95D]/20'
                }`}
              />
            </div>
            {errors.endDate && (
              <p className="text-[11px] text-[#D96B43] mt-1 flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{errors.endDate}</span>
              </p>
            )}
          </div>
        </div>

        {/* Optional Time Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[13px] font-medium text-[#48443E] mb-1.5 block select-none">
              Start Time <span className="text-xs font-normal text-[#8C867B]">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C867B] pointer-events-none">
                <Clock className="w-4 h-4" />
              </div>
              <input
                type="time"
                value={formData.startTime}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({ ...prev, startTime: val }));
                  setErrors((prev) => ({ ...prev, time: undefined }));
                }}
                className="w-full h-11 text-[13px] text-[#252525] bg-white/85 border border-[#DAD4C7] rounded-xl pl-10 pr-3 focus:outline-none focus:bg-white focus:border-[#E3B443] focus:ring-2 focus:ring-[#F4C95D]/20 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="text-[13px] font-medium text-[#48443E] mb-1.5 block select-none">
              End Time <span className="text-xs font-normal text-[#8C867B]">(Optional)</span>
            </label>
            <div className="relative">
              <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C867B] pointer-events-none">
                <Clock className="w-4 h-4" />
              </div>
              <input
                type="time"
                value={formData.endTime}
                onChange={(e) => {
                  const val = e.target.value;
                  setFormData((prev) => ({ ...prev, endTime: val }));
                  setErrors((prev) => ({ ...prev, time: undefined }));
                }}
                className="w-full h-11 text-[13px] text-[#252525] bg-white/85 border border-[#DAD4C7] rounded-xl pl-10 pr-3 focus:outline-none focus:bg-white focus:border-[#E3B443] focus:ring-2 focus:ring-[#F4C95D]/20 cursor-pointer"
              />
            </div>
          </div>
        </div>
        {errors.time && (
          <p className="text-[11px] text-[#D96B43] flex items-center gap-1">
            <AlertCircle className="w-3 h-3 shrink-0" />
            <span>{errors.time}</span>
          </p>
        )}

        {/* Location & Budget Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Location (Optional)"
            placeholder="e.g. Champ de Mars, Paris"
            leftIcon={<MapPin className="w-4 h-4" />}
            value={formData.location}
            onChange={(e) => {
              const val = e.target.value;
              setFormData((prev) => ({ ...prev, location: val }));
            }}
          />

          <Input
            label="Section Budget (₹)"
            type="number"
            min="0"
            step="100"
            placeholder="e.g. 5000"
            leftIcon={<Wallet className="w-4 h-4" />}
            value={formData.budget}
            error={errors.budget}
            onChange={(e) => {
              const val = e.target.value;
              setFormData((prev) => ({ ...prev, budget: val }));
              if (errors.budget) {
                setErrors((prev) => ({ ...prev, budget: undefined }));
              }
            }}
            required
          />
        </div>

        {/* Notes Textarea */}
        <Textarea
          label="Internal Notes / Booking Confirmation (Optional)"
          placeholder="e.g. Voucher code: GT-PARIS-2026, keep ID ready at gate..."
          rows={2}
          value={formData.notes}
          onChange={(e) => {
            const val = e.target.value;
            setFormData((prev) => ({ ...prev, notes: val }));
          }}
        />

        {/* Action Buttons: Cancel and Save */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DAD4C7]/60">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            loadingText={mode === 'create' ? 'Saving Section...' : 'Updating Section...'}
            className="shadow-sm hover:shadow-md min-w-[140px]"
          >
            {mode === 'create' ? 'Save Section' : 'Save Changes'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
