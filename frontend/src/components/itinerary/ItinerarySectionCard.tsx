import React from 'react';
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
  Pencil,
  Trash2,
  ChevronUp,
  ChevronDown,
  AlertTriangle,
  Wallet,
} from 'lucide-react';
import { ItinerarySection, ItinerarySectionType } from '../../types/trip';
import { formatDisplayDate } from '../../services/tripService';

interface ItinerarySectionCardProps {
  section: ItinerarySection;
  displayIndex: number;
  isFirst: boolean;
  isLast: boolean;
  hasOverlap?: boolean;
  overlappingSectionTitle?: string;
  onEdit: (section: ItinerarySection) => void;
  onDelete: (section: ItinerarySection) => void;
  onMoveUp: (sectionId: string) => void;
  onMoveDown: (sectionId: string) => void;
}

const typeConfig: Record<
  ItinerarySectionType,
  { label: string; icon: React.ComponentType<{ className?: string }>; bg: string; text: string; border: string }
> = {
  travel: {
    label: 'Travel',
    icon: Plane,
    bg: 'bg-[#EFF6FF]',
    text: 'text-[#1D4ED8]',
    border: 'border-[#BFDBFE]',
  },
  hotel: {
    label: 'Hotel / Stay',
    icon: Building2,
    bg: 'bg-[#FDF4FF]',
    text: 'text-[#A21CAF]',
    border: 'border-[#F5D0FE]',
  },
  sightseeing: {
    label: 'Sightseeing',
    icon: Camera,
    bg: 'bg-[#FEF3C7]',
    text: 'text-[#B45309]',
    border: 'border-[#FDE68A]',
  },
  activity: {
    label: 'Activity',
    icon: Compass,
    bg: 'bg-[#E7EFEA]',
    text: 'text-[#334D40]',
    border: 'border-[#C1D9CA]',
  },
  food: {
    label: 'Food & Dining',
    icon: Utensils,
    bg: 'bg-[#FFF1F2]',
    text: 'text-[#BE123C]',
    border: 'border-[#FECDD3]',
  },
  other: {
    label: 'General / Other',
    icon: Sparkles,
    bg: 'bg-[#F3F4F6]',
    text: 'text-[#374151]',
    border: 'border-[#E5E7EB]',
  },
};

export const ItinerarySectionCard: React.FC<ItinerarySectionCardProps> = ({
  section,
  displayIndex,
  isFirst,
  isLast,
  hasOverlap,
  overlappingSectionTitle,
  onEdit,
  onDelete,
  onMoveUp,
  onMoveDown,
}) => {
  const config = typeConfig[section.type] || typeConfig.other;
  const IconComponent = config.icon;

  const startDateFormatted = formatDisplayDate(section.startDate, false);
  const endDateFormatted = formatDisplayDate(section.endDate, false);

  const isSameDay = section.startDate === section.endDate;
  const dateDisplay = isSameDay
    ? startDateFormatted
    : `${startDateFormatted} — ${endDateFormatted}`;

  return (
    <div
      className="bg-[#FFF9EE] rounded-[22px] border border-[#DAD4C7]/80 hover:border-[#E5B740] transition-all duration-200 p-5 sm:p-6 shadow-xs hover:shadow-md relative group"
    >
      {/* Top Bar: Section Number, Type Badge, Reorder Buttons */}
      <div className="flex items-center justify-between gap-3 pb-3.5 mb-3.5 border-b border-[#DAD4C7]/50">
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Section Number Badge */}
          <span className="text-xs font-serif font-bold text-[#252525] bg-[#F4C95D]/25 border border-[#F4C95D]/60 px-3 py-1 rounded-xl">
            Section {displayIndex}
          </span>

          {/* Type Badge with Icon */}
          <span
            className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-semibold border ${config.bg} ${config.text} ${config.border}`}
          >
            <IconComponent className="w-3.5 h-3.5" />
            <span>{config.label}</span>
          </span>
        </div>

        {/* Action Controls (Reorder, Edit, Delete) */}
        <div className="flex items-center gap-1 sm:gap-1.5">
          {/* Move Up */}
          <button
            type="button"
            onClick={() => onMoveUp(section.id)}
            disabled={isFirst}
            aria-label="Move Section Up"
            title="Move Section Up"
            className="p-1.5 rounded-lg text-[#6F6A60] hover:text-[#252525] hover:bg-black/5 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronUp className="w-4 h-4" />
          </button>

          {/* Move Down */}
          <button
            type="button"
            onClick={() => onMoveDown(section.id)}
            disabled={isLast}
            aria-label="Move Section Down"
            title="Move Section Down"
            className="p-1.5 rounded-lg text-[#6F6A60] hover:text-[#252525] hover:bg-black/5 disabled:opacity-30 disabled:pointer-events-none transition-colors cursor-pointer"
          >
            <ChevronDown className="w-4 h-4" />
          </button>

          <span className="w-px h-4 bg-[#DAD4C7] mx-1" />

          {/* Edit Button */}
          <button
            type="button"
            onClick={() => onEdit(section)}
            aria-label="Edit Section"
            className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#252525] hover:text-[#C29326] bg-white/70 hover:bg-white border border-[#DAD4C7] rounded-lg transition-all cursor-pointer shadow-2xs"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Edit</span>
          </button>

          {/* Delete Button */}
          <button
            type="button"
            onClick={() => onDelete(section)}
            aria-label="Delete Section"
            className="p-1.5 text-[#8C867B] hover:text-[#D96B43] hover:bg-[#FAECE7] rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="space-y-2.5">
        <h3 className="text-base sm:text-lg font-serif font-bold text-[#252525] leading-snug">
          {section.title}
        </h3>

        {section.description && (
          <p className="text-xs sm:text-sm text-[#48443E] leading-relaxed">
            {section.description}
          </p>
        )}

        {/* Details Grid: Dates, Time, Location, Budget */}
        <div className="pt-2 flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-[#6F6A60]">
          {/* Date Range */}
          <div className="flex items-center gap-1.5 font-medium text-[#252525]">
            <Calendar className="w-3.5 h-3.5 text-[#C29326]" />
            <span>{dateDisplay}</span>
          </div>

          {/* Time Range (if any) */}
          {(section.startTime || section.endTime) && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#8C867B]" />
              <span>
                {section.startTime || '00:00'} {section.endTime ? `— ${section.endTime}` : ''}
              </span>
            </div>
          )}

          {/* Location */}
          {section.location && (
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#4E7360]" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{section.location}</span>
            </div>
          )}

          {/* Budget Tag */}
          <div className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFF9EE] border border-[#E5B740] text-xs font-bold text-[#252525] shadow-2xs">
            <Wallet className="w-3.5 h-3.5 text-[#C29326]" />
            <span>₹{(Number(section.budget) || 0).toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* Section Notes (if any) */}
        {section.notes && (
          <div className="mt-2 text-[11px] text-[#6F6A60] bg-black/[0.02] border border-[#DAD4C7]/40 rounded-xl px-3 py-1.5 italic">
            Note: {section.notes}
          </div>
        )}

        {/* Overlap Warning Indicator */}
        {hasOverlap && (
          <div className="mt-2 text-xs text-[#B45309] bg-[#FFFBEB] border border-[#FDE68A] rounded-xl px-3 py-1.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-[#B45309] shrink-0" />
            <span>
              Timeline Notice: This section shares dates with "{overlappingSectionTitle || 'another activity'}".
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
