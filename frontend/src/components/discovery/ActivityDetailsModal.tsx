import React from 'react';
import {
  Star,
  MapPin,
  Clock,
  Tag,
  Plus,
  Check,
  Sparkles,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { ActivityItem } from '../../types/trip';

export interface ActivityDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  activity: ActivityItem | null;
  onAddToTrip: (activity: ActivityItem) => void;
  isAddedToActiveTrip?: boolean;
}

export const ActivityDetailsModal: React.FC<ActivityDetailsModalProps> = ({
  isOpen,
  onClose,
  activity,
  onAddToTrip,
  isAddedToActiveTrip = false,
}) => {
  if (!activity) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={activity.name}
      subtitle={`${activity.city}, ${activity.country} • ${activity.category}`}
      maxWidth="lg"
    >
      <div className="space-y-6 pt-1">
        {/* Large Hero Image */}
        <div className="relative h-64 sm:h-72 w-full rounded-2xl overflow-hidden bg-[#EFE7D5] border border-[#DAD4C7]">
          <img
            src={activity.image}
            alt={activity.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-end justify-between gap-3 text-white">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full bg-[#F4C95D] text-[#252525] text-xs font-bold shadow-xs">
                  {activity.category}
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#4E7360] text-white text-xs font-semibold">
                  {activity.priceLevel}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold tracking-tight">
                {activity.name}
              </h2>
              <p className="text-xs text-white/90 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-[#F4C95D]" />
                {activity.city}, {activity.country}
              </p>
            </div>

            <div className="flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/20">
              <Star className="w-4 h-4 fill-[#F4C95D] text-[#F4C95D]" />
              <span className="text-sm font-bold">{activity.rating.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Quick Metrics Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          <div className="p-3 bg-[#FCFAF5] rounded-2xl border border-[#DAD4C7]/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#E7EFEA] text-[#4E7360]">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#8C867B]">Duration</p>
              <p className="text-xs font-bold text-[#252525]">{activity.duration}</p>
            </div>
          </div>

          <div className="p-3 bg-[#FCFAF5] rounded-2xl border border-[#DAD4C7]/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FCFAF5] text-[#C29326]">
              <Tag className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#8C867B]">Cost</p>
              <p className="text-xs font-bold text-[#252525] truncate">{activity.estimatedCost}</p>
            </div>
          </div>

          <div className="col-span-2 sm:col-span-1 p-3 bg-[#FCFAF5] rounded-2xl border border-[#DAD4C7]/80 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-[#FFF9EE] text-[#D96B43]">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#8C867B]">Experience Type</p>
              <p className="text-xs font-bold text-[#252525]">{activity.category}</p>
            </div>
          </div>
        </div>

        {/* Description */}
        <div className="space-y-2">
          <h3 className="text-sm font-serif font-bold text-[#252525]">
            About this Experience
          </h3>
          <p className="text-xs sm:text-sm text-[#48443E] leading-relaxed bg-[#FCFAF5] p-4 rounded-2xl border border-[#DAD4C7]/70">
            {activity.description}
          </p>
        </div>

        {/* Highlights */}
        {activity.highlights && activity.highlights.length > 0 && (
          <div className="space-y-2.5">
            <h3 className="text-sm font-serif font-bold text-[#252525] flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-[#C29326]" /> What's Included & Highlights
            </h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#252525]">
              {activity.highlights.map((h, i) => (
                <li
                  key={i}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-[#DAD4C7]/70"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#4E7360] shrink-0" />
                  <span>{h}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Modal Footer Controls */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DAD4C7]/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              onAddToTrip(activity);
            }}
            leftIcon={isAddedToActiveTrip ? <Check className="w-4 h-4 text-[#4E7360]" /> : <Plus className="w-4 h-4" />}
            className={isAddedToActiveTrip ? 'bg-[#E7EFEA] text-[#4E7360] border border-[#C2D7CC]' : ''}
          >
            {isAddedToActiveTrip ? 'Already in Itinerary' : 'Add to My Itinerary'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
