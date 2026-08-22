import React from 'react';
import {
  TrendingUp,
  Users,
  Compass,
  Wallet,
  Clock,
  PieChart,
  BarChart2,
  Sparkles,
} from 'lucide-react';
import { MonthlyTrendData, CategoryDistribution } from '../../types/admin';

interface UserAnalyticsProps {
  monthlyTrends: MonthlyTrendData[];
  categoryDistributions: CategoryDistribution[];
}

export const UserAnalytics: React.FC<UserAnalyticsProps> = ({
  monthlyTrends,
  categoryDistributions,
}) => {
  const maxUsers = Math.max(...monthlyTrends.map((m) => m.users));
  const maxTrips = Math.max(...monthlyTrends.map((m) => m.trips));

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-[#FFF9EE] p-4 sm:p-5 rounded-3xl border border-[#DAD4C7]/80 flex flex-wrap items-center justify-between gap-3 shadow-2xs">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#252525]">
            Platform Trends & Travel Behavior Analytics
          </h2>
          <p className="text-xs text-[#6F6A60]">
            Longitudinal telemetry of traveler growth, trip volume, and activity category distributions.
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EFEA] text-[#4E7360] border border-[#C2D7CC] text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Real-time Aggregation</span>
        </div>
      </div>

      {/* Grid of Visualizations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 1. User Growth Trajectory (Monthly Line/Area Visualization) */}
        <div className="bg-[#FFF9EE] p-5 sm:p-6 rounded-3xl border border-[#DAD4C7]/80 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#252525] flex items-center gap-2">
                <Users className="w-4 h-4 text-[#4E7360]" />
                Registered Traveler Growth
              </h3>
              <p className="text-xs text-[#6F6A60]">Cumulative account registrations over 6 months</p>
            </div>
            <span className="text-xs font-bold text-[#4E7360] bg-[#E7EFEA] px-2.5 py-1 rounded-xl">
              +208% YTD
            </span>
          </div>

          {/* SVG Area / Line Chart */}
          <div className="pt-2">
            <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-[#DAD4C7]/60 pb-2">
              {monthlyTrends.map((item, idx) => {
                const heightPercent = Math.round((item.users / maxUsers) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="text-[10px] font-bold text-[#4E7360] opacity-0 group-hover:opacity-100 transition-opacity">
                      {(item.users / 1000).toFixed(1)}k
                    </div>
                    <div
                      className="w-full max-w-[36px] bg-gradient-to-t from-[#4E7360] to-[#88AF9C] rounded-t-xl transition-all duration-500 group-hover:brightness-110 shadow-xs"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-xs font-bold text-[#6F6A60] group-hover:text-[#252525]">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#6F6A60] pt-1">
            <span>Baseline: 4.8k (Apr 2026)</span>
            <span className="font-bold text-[#252525]">Current: 14.8k Active Accounts</span>
          </div>
        </div>

        {/* 2. Trips Created Volume (Monthly Bar Chart) */}
        <div className="bg-[#FFF9EE] p-5 sm:p-6 rounded-3xl border border-[#DAD4C7]/80 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#252525] flex items-center gap-2">
                <Compass className="w-4 h-4 text-[#C29326]" />
                Itineraries & Trips Created
              </h3>
              <p className="text-xs text-[#6F6A60]">Total completed travel plans built</p>
            </div>
            <span className="text-xs font-bold text-[#C29326] bg-[#FCFAF5] border border-[#F4C95D] px-2.5 py-1 rounded-xl">
              +24.1% MoM
            </span>
          </div>

          {/* Bar Chart */}
          <div className="pt-2">
            <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2 border-b border-[#DAD4C7]/60 pb-2">
              {monthlyTrends.map((item, idx) => {
                const heightPercent = Math.round((item.trips / maxTrips) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2 group h-full justify-end">
                    <div className="text-[10px] font-bold text-[#C29326] opacity-0 group-hover:opacity-100 transition-opacity">
                      {item.trips}
                    </div>
                    <div
                      className="w-full max-w-[36px] bg-gradient-to-t from-[#C29326] to-[#F4C95D] rounded-t-xl transition-all duration-500 group-hover:brightness-110 shadow-xs"
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-xs font-bold text-[#6F6A60] group-hover:text-[#252525]">
                      {item.month}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex items-center justify-between text-xs text-[#6F6A60] pt-1">
            <span>Peak Itinerary Velocity: August</span>
            <span className="font-bold text-[#252525]">4,290 Total Trips</span>
          </div>
        </div>
      </div>

      {/* Two-Column Analytics: Categories & Behavioral Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 3. Activity Categories Breakdown */}
        <div className="bg-[#FFF9EE] p-5 sm:p-6 rounded-3xl border border-[#DAD4C7]/80 space-y-4 shadow-2xs">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <h3 className="text-sm sm:text-base font-serif font-bold text-[#252525] flex items-center gap-2">
                <PieChart className="w-4 h-4 text-[#D96B43]" />
                Experience Category Preference
              </h3>
              <p className="text-xs text-[#6F6A60]">Distribution of activities added to itineraries</p>
            </div>
          </div>

          {/* Stacked Progress Bar */}
          <div className="space-y-3 pt-2">
            <div className="h-4 w-full rounded-full overflow-hidden flex bg-[#FCFAF5] border border-[#DAD4C7]">
              {categoryDistributions.map((cat, idx) => (
                <div
                  key={idx}
                  style={{ width: `${cat.percentage}%`, backgroundColor: cat.color }}
                  className="h-full transition-all duration-500 hover:opacity-90"
                  title={`${cat.category}: ${cat.percentage}%`}
                />
              ))}
            </div>

            {/* Category Rows */}
            <div className="space-y-2.5 pt-2">
              {categoryDistributions.map((cat, idx) => (
                <div key={idx} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-3 h-3 rounded-md shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="font-semibold text-[#252525]">{cat.category}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-[#6F6A60]">{cat.count.toLocaleString('en-IN')} bookings</span>
                    <span className="font-bold text-[#252525] w-10 text-right">{cat.percentage}%</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 4. Travel Engagement & Budget Metrics */}
        <div className="bg-[#FFF9EE] p-5 sm:p-6 rounded-3xl border border-[#DAD4C7]/80 space-y-4 shadow-2xs flex flex-col justify-between">
          <div className="space-y-0.5">
            <h3 className="text-sm sm:text-base font-serif font-bold text-[#252525] flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-[#4E7360]" />
              Traveler Engagement Indicators
            </h3>
            <p className="text-xs text-[#6F6A60]">Key operational health and user behavior metrics</p>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-4 bg-white rounded-2xl border border-[#DAD4C7]/80 space-y-1">
              <div className="flex items-center gap-1.5 text-[#6F6A60] text-xs font-semibold">
                <Wallet className="w-3.5 h-3.5 text-[#4E7360]" /> Average Budget
              </div>
              <p className="text-xl font-serif font-bold text-[#252525]">₹62,400</p>
              <p className="text-[10px] text-[#4E7360] font-bold">+12% vs last quarter</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#DAD4C7]/80 space-y-1">
              <div className="flex items-center gap-1.5 text-[#6F6A60] text-xs font-semibold">
                <Clock className="w-3.5 h-3.5 text-[#C29326]" /> Trip Length
              </div>
              <p className="text-xl font-serif font-bold text-[#252525]">6.2 Days</p>
              <p className="text-[10px] text-[#4E7360] font-bold">+0.8 days increase</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#DAD4C7]/80 space-y-1">
              <div className="flex items-center gap-1.5 text-[#6F6A60] text-xs font-semibold">
                <TrendingUp className="w-3.5 h-3.5 text-[#D96B43]" /> Completion Rate
              </div>
              <p className="text-xl font-serif font-bold text-[#252525]">88.4%</p>
              <p className="text-[10px] text-[#4E7360] font-bold">High builder retention</p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-[#DAD4C7]/80 space-y-1">
              <div className="flex items-center gap-1.5 text-[#6F6A60] text-xs font-semibold">
                <Compass className="w-3.5 h-3.5 text-[#4E7360]" /> Cities / Trip
              </div>
              <p className="text-xl font-serif font-bold text-[#252525]">2.4 Cities</p>
              <p className="text-[10px] text-[#8C867B]">Multi-city preference</p>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-[#FCFAF5] border border-[#DAD4C7] text-xs text-[#6F6A60] flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#C29326] shrink-0" />
            <span>Multi-destination rail itineraries in Europe and Japan show the fastest adoption growth.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
