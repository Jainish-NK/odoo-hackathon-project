import React from 'react';
import {
  Clock,
  MapPin,
  Plane,
  Building2,
  Camera,
  Compass,
  Utensils,
  Sparkles,
  Edit2,
  Trash2,
} from 'lucide-react';
import { ItinerarySection, ItinerarySectionType } from '../../types/trip';
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

export interface TimelineGroup {
  dayNumber: number;
  dateStr: string;
  city?: string;
  sections: ItinerarySection[];
}

export interface ItineraryTimelineProps {
  groups: TimelineGroup[];
  onEditSection: (section: ItinerarySection) => void;
  onDeleteSection: (section: ItinerarySection) => void;
  highlightCategory?: string | null;
}

export const ItineraryTimeline: React.FC<ItineraryTimelineProps> = ({
  groups,
  onEditSection,
  onDeleteSection,
  highlightCategory,
}) => {
  return (
    <div className="space-y-8">
      {groups.map((group) => (
        <div key={`${group.dayNumber}-${group.dateStr}`} className="space-y-4">
          {/* Day & City Header */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-[#DAD4C7]">
            <div className="flex items-center gap-2.5">
              <span className="px-3 py-1 rounded-xl bg-[#252525] text-white text-xs font-bold shadow-2xs">
                Day {group.dayNumber}
              </span>
              <span className="text-sm font-serif font-bold text-[#252525]">
                {formatDisplayDate(group.dateStr)}
              </span>
            </div>

            {group.city && (
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#4E7360] bg-[#E7EFEA] px-2.5 py-0.5 rounded-full border border-[#C2D7CC]">
                <MapPin className="w-3 h-3" /> {group.city}
              </span>
            )}
          </div>

          {/* Timeline Nodes */}
          <div className="relative pl-6 sm:pl-8 space-y-4 border-l-2 border-[#DAD4C7]/80 ml-3 sm:ml-4">
            {group.sections.map((section) => {
              const Icon = categoryIcons[section.type] || Sparkles;
              const badge = categoryBadgeStyles[section.type] || categoryBadgeStyles.other;

              const isCategoryHighlighted =
                !highlightCategory ||
                (highlightCategory === 'travel' && section.type === 'travel') ||
                (highlightCategory === 'hotel' && section.type === 'hotel') ||
                (highlightCategory === 'activity' && (section.type === 'activity' || section.type === 'sightseeing')) ||
                (highlightCategory === 'food' && section.type === 'food') ||
                (highlightCategory === 'other' && section.type === 'other');

              return (
                <div
                  key={section.id}
                  className={`relative bg-[#FFF9EE] rounded-2xl border transition-all duration-300 p-4 sm:p-5 shadow-2xs group ${
                    isCategoryHighlighted
                      ? 'border-[#DAD4C7]/90 hover:border-[#E5B740]'
                      : 'opacity-40 grayscale-[40%]'
                  }`}
                >
                  {/* Timeline Dot on the left spine */}
                  <div className="absolute -left-[31px] sm:-left-[39px] top-5 w-4 h-4 rounded-full bg-[#FFF9EE] border-3 border-[#F4C95D] shadow-xs group-hover:scale-125 transition-transform" />

                  {/* Header: Time, Category & Actions */}
                  <div className="flex flex-wrap items-center justify-between gap-2 pb-2 mb-2 border-b border-[#DAD4C7]/50">
                    <div className="flex items-center gap-2">
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-[#252525] bg-white px-2.5 py-0.5 rounded-lg border border-[#DAD4C7]/70">
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
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-[#4E7360] bg-[#E7EFEA] px-2.5 py-0.5 rounded-lg">
                        ₹{(Number(section.budget) || 0).toLocaleString('en-IN')}
                      </span>

                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          type="button"
                          onClick={() => onEditSection(section)}
                          aria-label="Edit section"
                          className="p-1.5 text-[#8C867B] hover:text-[#252525] hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteSection(section)}
                          aria-label="Delete section"
                          className="p-1.5 text-[#8C867B] hover:text-[#D96B43] hover:bg-[#FAECE7] rounded-lg transition-colors cursor-pointer"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Section Title & Details */}
                  <div className="space-y-1">
                    <h4 className="text-sm font-serif font-bold text-[#252525] leading-tight">
                      {section.title}
                    </h4>

                    {section.description && (
                      <p className="text-xs text-[#6F6A60] leading-relaxed">
                        {section.description}
                      </p>
                    )}

                    {section.location && (
                      <p className="text-[11px] text-[#8C867B] flex items-center gap-1 pt-1">
                        <MapPin className="w-3 h-3 text-[#C29326]" />
                        {section.location}
                      </p>
                    )}

                    {section.notes && (
                      <p className="text-[11px] text-[#48443E] italic bg-[#FCFAF5] p-2 rounded-xl border border-[#DAD4C7]/60 mt-2">
                        Note: {section.notes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
};
