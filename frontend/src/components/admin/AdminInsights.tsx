import React from 'react';
import {
  Sparkles,
  TrendingUp,
  Shield,
  Lightbulb,
  Info,
  CheckCircle2,
} from 'lucide-react';
import { AdminTabType, AdminInsightItem } from '../../types/admin';

interface AdminInsightsProps {
  activeTab: AdminTabType;
  insights: AdminInsightItem[];
}

const tabDescriptions: Record<
  AdminTabType,
  { title: string; subtitle: string; icon: React.ComponentType<{ className?: string }> }
> = {
  users: {
    title: 'Manage Users & Permissions',
    subtitle:
      'Oversee registered travelers, manage account statuses, assign administrative roles, and audit recent journey logs.',
    icon: Shield,
  },
  cities: {
    title: 'Popular Destination Trends',
    subtitle:
      'Analyze the cities and regions receiving the highest traveler demand, budget allocation, and seasonal popularity.',
    icon: TrendingUp,
  },
  activities: {
    title: 'Experience Adoption Metrics',
    subtitle:
      'Understand which activities, food tours, and cultural excursions travelers are adding to their active itineraries.',
    icon: Sparkles,
  },
  analytics: {
    title: 'Platform Intelligence & Growth',
    subtitle:
      'Track longitudinal platform growth, trip creation velocities, category distribution, and behavioral patterns.',
    icon: Lightbulb,
  },
};

const badgeStyles = {
  sage: 'bg-[#E7EFEA] text-[#4E7360] border-[#C2D7CC]',
  gold: 'bg-[#FCFAF5] text-[#C29326] border-[#F4C95D]',
  terracotta: 'bg-[#FAECE7] text-[#D96B43] border-[#F5D5CB]',
  neutral: 'bg-[#F2ECE0] text-[#6F6A60] border-[#DAD4C7]',
};

export const AdminInsights: React.FC<AdminInsightsProps> = ({ activeTab, insights }) => {
  const currentTabInfo = tabDescriptions[activeTab] || tabDescriptions.users;
  const HeaderIcon = currentTabInfo.icon;

  return (
    <div className="space-y-6">
      {/* 1. Wireframe "About this Section" Explanatory Card */}
      <div className="bg-[#FFF9EE] p-5 sm:p-6 rounded-3xl border border-[#DAD4C7]/80 space-y-3 shadow-2xs">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6F6A60]">
          <Info className="w-3.5 h-3.5 text-[#C29326]" />
          <span>Section Overview</span>
        </div>

        <div className="space-y-1.5">
          <h3 className="text-base sm:text-lg font-serif font-bold text-[#252525] flex items-center gap-2">
            <HeaderIcon className="w-4 h-4 text-[#4E7360]" />
            {currentTabInfo.title}
          </h3>
          <p className="text-xs text-[#6F6A60] leading-relaxed">
            {currentTabInfo.subtitle}
          </p>
        </div>

        <div className="pt-2 border-t border-[#DAD4C7]/60 flex items-center justify-between text-[11px] text-[#4E7360] font-semibold">
          <span className="flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> Live Data Synchronized
          </span>
          <span>Updated just now</span>
        </div>
      </div>

      {/* 2. Contextual Insight Highlights */}
      <div className="bg-[#FFF9EE] p-5 sm:p-6 rounded-3xl border border-[#DAD4C7]/80 space-y-4 shadow-2xs">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#6F6A60]">
            <Sparkles className="w-3.5 h-3.5 text-[#C29326]" />
            <span>Admin Intelligence</span>
          </div>
          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E7EFEA] text-[#4E7360]">
            AI Curated
          </span>
        </div>

        <div className="space-y-3">
          {insights.map((item) => (
            <div
              key={item.id}
              className="p-4 bg-white rounded-2xl border border-[#DAD4C7]/80 space-y-2 hover:border-[#E5B740] transition-colors"
            >
              <div className="flex items-center justify-between gap-2">
                <h4 className="text-xs sm:text-sm font-serif font-bold text-[#252525]">
                  {item.title}
                </h4>
                {item.badgeText && (
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${
                      badgeStyles[item.badgeType || 'sage']
                    }`}
                  >
                    {item.badgeText}
                  </span>
                )}
              </div>

              <p className="text-xs text-[#6F6A60] leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 3. Quick System Health / Administrative Notes */}
      <div className="bg-[#252525] text-white p-5 sm:p-6 rounded-3xl space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-[#F4C95D] uppercase tracking-wider">
            Operational Audit
          </span>
          <span className="w-2 h-2 rounded-full bg-[#4E7360] animate-ping" />
        </div>

        <p className="text-xs text-white/80 leading-relaxed">
          All administrative actions (user status updates, itinerary telemetry, and category classifications) are logged and versioned locally.
        </p>

        <div className="pt-2 border-t border-white/10 flex items-center justify-between text-[11px] text-[#F4C95D]">
          <span>Security Protocol: v2.4</span>
          <span>Access: Admin Verified</span>
        </div>
      </div>
    </div>
  );
};
