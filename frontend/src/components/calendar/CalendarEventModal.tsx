import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar as CalendarIcon,
  MapPin,
  Clock,
  ArrowRight,
  Plane,
  Building2,
  Camera,
  Compass,
  Utensils,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Trip, ItinerarySection, ItinerarySectionType } from '../../types/trip';
import { formatDisplayDate } from '../../services/tripService';

const categoryIcons: Record<ItinerarySectionType, React.ComponentType<{ className?: string }>> = {
  travel: Plane,
  hotel: Building2,
  sightseeing: Camera,
  activity: Compass,
  food: Utensils,
  other: Sparkles,
};

const categoryBadgeStyles: Record<ItinerarySectionType, { bg: string; text: string; border: string }> = {
  travel: { bg: 'bg-[#FCFAF5]', text: 'text-[#C29326]', border: 'border-[#F4C95D]' },
  hotel: { bg: 'bg-[#E7EFEA]', text: 'text-[#4E7360]', border: 'border-[#C2D7CC]' },
  sightseeing: { bg: 'bg-[#FCFAF5]', text: 'text-[#C29326]', border: 'border-[#E5B740]' },
  activity: { bg: 'bg-[#E7EFEA]', text: 'text-[#4E7360]', border: 'border-[#C2D7CC]' },
  food: { bg: 'bg-[#FAECE7]', text: 'text-[#D96B43]', border: 'border-[#F5D5CB]' },
  other: { bg: 'bg-[#F2EFE9]', text: 'text-[#6F6A60]', border: 'border-[#DAD4C7]' },
};

export interface CalendarEventModalProps {
  isOpen: boolean;
  onClose: () => void;
  dateStr: string;
  activeTrips: Trip[];
  scheduledActivities: { trip: Trip; section: ItinerarySection }[];
}

export const CalendarEventModal: React.FC<CalendarEventModalProps> = ({
  isOpen,
  onClose,
  dateStr,
  activeTrips,
  scheduledActivities,
}) => {
  if (!isOpen) return null;

  const formattedDate = formatDisplayDate(dateStr);

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={formattedDate}
      subtitle="Scheduled trips, regional segments, and day activities"
      maxWidth="lg"
    >
      <div className="space-y-6 pt-1">
        {/* Active Trips on this Date */}
        {activeTrips.length > 0 && (
          <div className="space-y-3">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#8C867B] block">
              Active Trips ({activeTrips.length})
            </span>

            <div className="space-y-2.5">
              {activeTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-[#FCFAF5] p-4 rounded-2xl border border-[#DAD4C7]/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#F4C95D]" />
                      <h4 className="text-sm font-serif font-bold text-[#252525]">
                        {trip.name}
                      </h4>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-xs text-[#6F6A60]">
                      <span className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5 text-[#C29326]" />
                        {formatDisplayDate(trip.startDate)} — {formatDisplayDate(trip.endDate)}
                      </span>

                      {trip.destinations && trip.destinations.length > 0 && (
                        <span className="flex items-center gap-1 font-semibold text-[#252525]">
                          <MapPin className="w-3.5 h-3.5 text-[#4E7360]" />
                          {trip.destinations.map((d) => d.city).join(', ')}
                        </span>
                      )}
                    </div>
                  </div>

                  <Link to={`/trips/${trip.id}/itinerary`}>
                    <Button
                      variant="outline"
                      size="sm"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      className="font-bold text-xs shrink-0"
                    >
                      View Itinerary
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Scheduled Activities on this Date */}
        <div className="space-y-3">
          <span className="text-[11px] uppercase font-bold tracking-wider text-[#8C867B] block">
            Day Schedule & Activities ({scheduledActivities.length})
          </span>

          {scheduledActivities.length === 0 ? (
            <div className="p-6 bg-[#FCFAF5] rounded-2xl border border-[#DAD4C7]/60 text-center space-y-2">
              <p className="text-xs text-[#6F6A60]">
                No specific timed activities or bookings scheduled for this date.
              </p>
              {activeTrips.length > 0 && (
                <Link to={`/trips/${activeTrips[0].id}/itinerary`}>
                  <Button variant="outline" size="sm" className="text-xs font-bold">
                    + Add Activities to Itinerary
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-2.5">
              {scheduledActivities.map(({ trip, section }) => {
                const Icon = categoryIcons[section.type] || Sparkles;
                const badge = categoryBadgeStyles[section.type] || categoryBadgeStyles.other;

                return (
                  <div
                    key={section.id}
                    className="p-4 bg-white rounded-2xl border border-[#DAD4C7]/80 hover:border-[#E5B740] transition-colors space-y-2 shadow-2xs"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#252525] bg-[#FCFAF5] px-2.5 py-0.5 rounded-lg border border-[#DAD4C7]">
                          <Clock className="w-3 h-3 text-[#C29326]" />
                          {section.startTime || 'All Day'}
                          {section.endTime ? ` - ${section.endTime}` : ''}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span className="capitalize">{section.type}</span>
                        </span>
                      </div>

                      <span className="text-xs font-bold text-[#4E7360] bg-[#E7EFEA] px-2.5 py-0.5 rounded-lg">
                        ₹{(Number(section.budget) || 0).toLocaleString('en-IN')}
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <h4 className="text-sm font-serif font-bold text-[#252525]">
                        {section.title}
                      </h4>
                      {section.description && (
                        <p className="text-xs text-[#6F6A60] leading-relaxed">
                          {section.description}
                        </p>
                      )}
                      {section.location && (
                        <p className="text-[11px] text-[#8C867B] flex items-center gap-1 pt-0.5">
                          <MapPin className="w-3 h-3 text-[#C29326]" />
                          {section.location} • <span className="text-[#252525] font-semibold">{trip.name}</span>
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Actions */}
        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#DAD4C7]/60">
          <Button variant="outline" size="sm" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
