import React from 'react';
import {
  Plane,
  Building2,
  Camera,
  Compass,
  Utensils,
  Sparkles,
} from 'lucide-react';
import { Trip, ItinerarySection, ItinerarySectionType } from '../../types/trip';
import { normalizeToISODate } from '../../services/tripService';

const categoryIcons: Record<ItinerarySectionType, React.ComponentType<{ className?: string }>> = {
  travel: Plane,
  hotel: Building2,
  sightseeing: Camera,
  activity: Compass,
  food: Utensils,
  other: Sparkles,
};

const categoryPillColors: Record<ItinerarySectionType, { bg: string; text: string; border: string }> = {
  travel: { bg: 'bg-[#FCFAF5]', text: 'text-[#C29326]', border: 'border-[#F4C95D]' },
  hotel: { bg: 'bg-[#E7EFEA]', text: 'text-[#4E7360]', border: 'border-[#C2D7CC]' },
  sightseeing: { bg: 'bg-[#FCFAF5]', text: 'text-[#C29326]', border: 'border-[#E5B740]' },
  activity: { bg: 'bg-[#E7EFEA]', text: 'text-[#4E7360]', border: 'border-[#C2D7CC]' },
  food: { bg: 'bg-[#FAECE7]', text: 'text-[#D96B43]', border: 'border-[#F5D5CB]' },
  other: { bg: 'bg-[#F2EFE9]', text: 'text-[#6F6A60]', border: 'border-[#DAD4C7]' },
};

const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export interface MonthCalendarProps {
  currentMonthDate: Date;
  trips: Trip[];
  filteredActivities: { trip: Trip; section: ItinerarySection }[];
  onSelectDay: (dateStr: string) => void;
}

export const MonthCalendar: React.FC<MonthCalendarProps> = ({
  currentMonthDate,
  trips,
  filteredActivities,
  onSelectDay,
}) => {
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  // Today ISO string
  const today = new Date();
  const todayISO = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(
    today.getDate()
  ).padStart(2, '0')}`;

  // First day of month (0 = Sun, 1 = Mon...)
  const firstDayIndex = new Date(year, month, 1).getDay();

  // Total days in current month
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  // Total days in previous month
  const totalDaysInPrevMonth = new Date(year, month, 0).getDate();

  // Build grid calendar cells (matrix of 35 or 42 cells)
  const cells: {
    dayNumber: number;
    dateISO: string;
    isCurrentMonth: boolean;
    isToday: boolean;
  }[] = [];

  // 1. Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    const d = totalDaysInPrevMonth - i;
    const prevMonthDate = new Date(year, month - 1, d);
    const dateISO = `${prevMonthDate.getFullYear()}-${String(prevMonthDate.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(d).padStart(2, '0')}`;
    cells.push({
      dayNumber: d,
      dateISO,
      isCurrentMonth: false,
      isToday: dateISO === todayISO,
    });
  }

  // 2. Current month days
  for (let d = 1; d <= totalDaysInMonth; d++) {
    const dateISO = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    cells.push({
      dayNumber: d,
      dateISO,
      isCurrentMonth: true,
      isToday: dateISO === todayISO,
    });
  }

  // 3. Next month leading days (fill up grid to multiples of 7)
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    const nextMonthDate = new Date(year, month + 1, d);
    const dateISO = `${nextMonthDate.getFullYear()}-${String(nextMonthDate.getMonth() + 1).padStart(
      2,
      '0'
    )}-${String(d).padStart(2, '0')}`;
    cells.push({
      dayNumber: d,
      dateISO,
      isCurrentMonth: false,
      isToday: dateISO === todayISO,
    });
  }

  return (
    <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 overflow-hidden shadow-sm">
      {/* Weekday Header Row */}
      <div className="grid grid-cols-7 border-b border-[#DAD4C7]/80 bg-[#FCFAF5] text-center text-xs font-bold text-[#6F6A60] py-3">
        {weekdays.map((day) => (
          <div key={day} className="tracking-wide">
            {day}
          </div>
        ))}
      </div>

      {/* Days Grid */}
      <div className="grid grid-cols-7 divide-x divide-y divide-[#DAD4C7]/60">
        {cells.map((cell) => {
          // Find matching trips for this date
          const activeTrips = trips.filter((t) => {
            const start = normalizeToISODate(t.startDate);
            const end = normalizeToISODate(t.endDate) || start;
            return cell.dateISO >= start && cell.dateISO <= end;
          });

          // Find matching activities for this date
          const dayActivities = filteredActivities.filter(({ section }) => {
            const start = normalizeToISODate(section.startDate);
            const end = normalizeToISODate(section.endDate) || start;
            return cell.dateISO >= start && cell.dateISO <= end;
          });

          const hasEvents = activeTrips.length > 0 || dayActivities.length > 0;

          return (
            <div
              key={cell.dateISO}
              onClick={() => onSelectDay(cell.dateISO)}
              className={`min-h-[90px] sm:min-h-[120px] p-1.5 sm:p-2.5 transition-colors cursor-pointer flex flex-col justify-between group ${
                cell.isCurrentMonth
                  ? 'bg-[#FFF9EE] hover:bg-[#FAF3E3]'
                  : 'bg-[#F2ECE0]/50 text-[#8C867B]/60 hover:bg-[#EAE2D2]'
              } ${cell.isToday ? 'ring-2 ring-inset ring-[#F4C95D]' : ''}`}
            >
              {/* Date Header Number */}
              <div className="flex items-center justify-between">
                <span
                  className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center ${
                    cell.isToday
                      ? 'bg-[#252525] text-white shadow-xs'
                      : cell.isCurrentMonth
                      ? 'text-[#252525]'
                      : 'text-[#8C867B]'
                  }`}
                >
                  {cell.dayNumber}
                </span>

                {hasEvents && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E3B443] sm:hidden" />
                )}
              </div>

              {/* Event Indicators (Desktop/Tablet) */}
              <div className="space-y-1 mt-1 flex-1 hidden sm:flex flex-col justify-start">
                {/* Active Trip Banner */}
                {activeTrips.slice(0, 1).map((t) => (
                  <div
                    key={t.id}
                    className="px-1.5 py-0.5 rounded-md bg-[#F4C95D]/30 border border-[#E3B443]/60 text-[10px] font-bold text-[#252525] truncate"
                    title={`${t.name} (${t.destinations?.map((d) => d.city).join(', ') || ''})`}
                  >
                    ✈ {t.name}
                  </div>
                ))}

                {/* Day Activities Chips */}
                {dayActivities.slice(0, 2).map(({ section }) => {
                  const Icon = categoryIcons[section.type] || Sparkles;
                  const pill = categoryPillColors[section.type] || categoryPillColors.other;

                  return (
                    <div
                      key={section.id}
                      className={`px-1.5 py-0.5 rounded-md border text-[10px] font-medium flex items-center gap-1 truncate ${pill.bg} ${pill.text} ${pill.border}`}
                      title={`${section.startTime ? section.startTime + ' ' : ''}${section.title}`}
                    >
                      <Icon className="w-2.5 h-2.5 shrink-0" />
                      <span className="truncate">{section.title}</span>
                    </div>
                  );
                })}

                {/* Overflow count */}
                {dayActivities.length > 2 && (
                  <span className="text-[9px] font-semibold text-[#6F6A60] block px-1">
                    +{dayActivities.length - 2} more
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
