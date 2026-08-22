import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  Clock,
  MapPin,
  Plane,
  Building2,
  Camera,
  Compass,
  Utensils,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { Trip, ItinerarySection, ItinerarySectionType } from '../../types/trip';
import { formatDisplayDate } from '../../services/tripService';
import { Button } from '../ui/Button';

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

export interface CalendarAgendaProps {
  trips: Trip[];
  activities: { trip: Trip; section: ItinerarySection }[];
  onSelectDay: (dateStr: string) => void;
}

export const CalendarAgenda: React.FC<CalendarAgendaProps> = ({
  trips,
  activities,
  onSelectDay,
}) => {
  // Group activities by date
  const groupedByDate: { [dateStr: string]: { trip: Trip; section: ItinerarySection }[] } = {};

  activities.forEach((item) => {
    const d = item.section.startDate || item.trip.startDate;
    if (!groupedByDate[d]) groupedByDate[d] = [];
    groupedByDate[d].push(item);
  });

  const sortedDates = Object.keys(groupedByDate).sort();

  if (trips.length === 0 && activities.length === 0) {
    return (
      <div className="p-10 bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7] text-center space-y-3">
        <p className="text-xs text-[#6F6A60]">No upcoming scheduled events in this period.</p>
        <Link to="/trips/create">
          <Button variant="primary" size="sm">
            Plan a New Trip
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedDates.map((dateStr) => {
        const dayActivities = groupedByDate[dateStr];
        const formattedDate = formatDisplayDate(dateStr);

        return (
          <div key={dateStr} className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-5 sm:p-6 space-y-4 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#DAD4C7]/60">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-[#252525] text-white">
                  <Calendar className="w-4 h-4 text-[#F4C95D]" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-serif font-bold text-[#252525]">
                    {formattedDate}
                  </h3>
                  <span className="text-[11px] text-[#8C867B]">
                    {dayActivities.length} {dayActivities.length === 1 ? 'activity' : 'activities'} scheduled
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => onSelectDay(dateStr)}
                className="text-xs font-bold text-[#4E7360] hover:underline cursor-pointer"
              >
                View Day Details
              </button>
            </div>

            <div className="space-y-3">
              {dayActivities.map(({ trip, section }) => {
                const Icon = categoryIcons[section.type] || Sparkles;
                const badge = categoryBadgeStyles[section.type] || categoryBadgeStyles.other;

                return (
                  <div
                    key={section.id}
                    className="p-4 bg-white rounded-2xl border border-[#DAD4C7]/70 hover:border-[#E5B740] transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                  >
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-1 text-xs font-bold text-[#252525] bg-[#FCFAF5] px-2.5 py-0.5 rounded-lg border border-[#DAD4C7]">
                          <Clock className="w-3 h-3 text-[#C29326]" />
                          {section.startTime || 'Scheduled'}
                          {section.endTime ? ` - ${section.endTime}` : ''}
                        </span>

                        <span
                          className={`inline-flex items-center gap-1 text-[11px] font-bold px-2 py-0.5 rounded-lg border ${badge.bg} ${badge.text} ${badge.border}`}
                        >
                          <Icon className="w-3 h-3" />
                          <span className="capitalize">{section.type}</span>
                        </span>

                        <span className="text-xs font-semibold text-[#6F6A60] bg-[#FCFAF5] px-2 py-0.5 rounded-md">
                          {trip.name}
                        </span>
                      </div>

                      <h4 className="text-sm font-serif font-bold text-[#252525]">
                        {section.title}
                      </h4>

                      {section.description && (
                        <p className="text-xs text-[#6F6A60] leading-relaxed line-clamp-2">
                          {section.description}
                        </p>
                      )}

                      {section.location && (
                        <p className="text-[11px] text-[#8C867B] flex items-center gap-1 pt-0.5">
                          <MapPin className="w-3 h-3 text-[#C29326]" />
                          {section.location}
                        </p>
                      )}
                    </div>

                    <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-2 shrink-0 border-t sm:border-t-0 pt-2 sm:pt-0 border-[#DAD4C7]/40">
                      <span className="text-xs font-bold text-[#4E7360] bg-[#E7EFEA] px-2.5 py-1 rounded-xl">
                        ₹{(Number(section.budget) || 0).toLocaleString('en-IN')}
                      </span>

                      <Link to={`/trips/${trip.id}/itinerary`}>
                        <Button
                          variant="outline"
                          size="sm"
                          rightIcon={<ArrowRight className="w-3 h-3" />}
                          className="text-[11px] font-bold"
                        >
                          Itinerary
                        </Button>
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
};
