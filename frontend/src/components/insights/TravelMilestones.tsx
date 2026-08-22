import React from 'react';
import {
  Compass,
  MapPin,
  Plane,
  Sparkles,
  Calendar,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { TravelMilestone } from '../../services/insightsService';

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Compass,
  MapPin,
  Plane,
  Sparkles,
  Calendar,
};

export interface TravelMilestonesProps {
  milestones: TravelMilestone[];
}

export const TravelMilestones: React.FC<TravelMilestonesProps> = ({ milestones }) => {
  return (
    <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#DAD4C7]/60 pb-3">
        <h3 className="text-base font-serif font-bold text-[#252525]">
          Travel Milestones & Badges
        </h3>
        <span className="text-xs font-semibold text-[#4E7360] bg-[#E7EFEA] px-2.5 py-0.5 rounded-lg">
          {milestones.filter((m) => m.isAchieved).length} of {milestones.length} Unlocked
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
        {milestones.map((m) => {
          const Icon = iconMap[m.iconName] || Sparkles;

          return (
            <div
              key={m.id}
              className={`p-4 rounded-2xl border transition-all space-y-2.5 ${
                m.isAchieved
                  ? 'bg-white border-[#E5B740] shadow-2xs'
                  : 'bg-[#FCFAF5]/70 border-[#DAD4C7]/60 opacity-60'
              }`}
            >
              <div className="flex items-center justify-between">
                <div
                  className={`p-2 rounded-xl ${
                    m.isAchieved
                      ? 'bg-[#F4C95D]/30 text-[#C29326]'
                      : 'bg-[#DAD4C7]/40 text-[#8C867B]'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>

                {m.isAchieved ? (
                  <CheckCircle2 className="w-4 h-4 text-[#4E7360]" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-[#8C867B]" />
                )}
              </div>

              <div className="space-y-0.5">
                <h4 className="text-xs font-bold text-[#252525]">{m.title}</h4>
                <p className="text-[11px] text-[#6F6A60] leading-snug line-clamp-2">
                  {m.description}
                </p>
              </div>

              <span
                className={`text-[10px] font-bold block pt-1 ${
                  m.isAchieved ? 'text-[#4E7360]' : 'text-[#8C867B]'
                }`}
              >
                {m.progressText}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
