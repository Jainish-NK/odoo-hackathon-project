import React from 'react';
import { Users, Compass, Navigation, TrendingUp, Sparkles } from 'lucide-react';
import { AdminStatsSummary } from '../../types/admin';

interface AdminStatsProps {
  stats: AdminStatsSummary;
}

export const AdminStats: React.FC<AdminStatsProps> = ({ stats }) => {
  const cards = [
    {
      label: 'Total Users',
      value: stats.totalUsers.toLocaleString('en-IN'),
      subtext: stats.usersGrowth,
      icon: Users,
      iconBg: 'bg-[#FCFAF5] text-[#C29326] border-[#DAD4C7]',
      trendColor: 'text-[#4E7360]',
    },
    {
      label: 'Trips Created',
      value: stats.totalTrips.toLocaleString('en-IN'),
      subtext: stats.tripsGrowth,
      icon: Compass,
      iconBg: 'bg-[#E7EFEA] text-[#4E7360] border-[#C2D7CC]',
      trendColor: 'text-[#4E7360]',
    },
    {
      label: 'Active Journeys',
      value: stats.activeTrips.toLocaleString('en-IN'),
      subtext: stats.activeTripsGrowth,
      icon: Navigation,
      iconBg: 'bg-[#FAECE7] text-[#D96B43] border-[#F5D5CB]',
      trendColor: 'text-[#D96B43]',
    },
    {
      label: 'Top Destination',
      value: stats.topDestination,
      subtext: stats.topDestinationPercentage,
      icon: Sparkles,
      iconBg: 'bg-[#FCFAF5] text-[#C29326] border-[#F4C95D]',
      trendColor: 'text-[#8C867B]',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, idx) => {
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className="bg-[#FFF9EE] p-5 rounded-3xl border border-[#DAD4C7]/80 space-y-3 shadow-2xs hover:border-[#E5B740] transition-colors"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-[#6F6A60]">
                {card.label}
              </span>
              <div className={`p-2.5 rounded-2xl border ${card.iconBg}`}>
                <Icon className="w-4 h-4" />
              </div>
            </div>

            <div>
              <h3 className="text-2xl sm:text-3xl font-serif font-bold text-[#252525] tracking-tight">
                {card.value}
              </h3>
              <p className={`text-[11px] font-semibold mt-1 flex items-center gap-1 ${card.trendColor}`}>
                <TrendingUp className="w-3 h-3 shrink-0" />
                <span>{card.subtext}</span>
              </p>
            </div>
          </div>
        );
      })}
    </div>
  );
};
