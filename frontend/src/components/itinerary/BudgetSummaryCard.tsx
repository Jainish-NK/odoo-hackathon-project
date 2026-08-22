import React, { useMemo } from 'react';
import {
  Wallet,
  Plane,
  Building2,
  Compass,
  Utensils,
  Sparkles,
} from 'lucide-react';
import { Trip, ItinerarySection } from '../../types/trip';

export interface BudgetSummaryCardProps {
  trip: Trip;
  durationDays: number;
  selectedCategoryFilter?: string | null;
  onSelectCategoryFilter?: (category: string | null) => void;
}

export const BudgetSummaryCard: React.FC<BudgetSummaryCardProps> = ({
  trip,
  durationDays,
  selectedCategoryFilter,
  onSelectCategoryFilter,
}) => {
  // Derive category breakdown
  const { total, breakdown, perDay } = useMemo(() => {
    let transport = 0;
    let stay = 0;
    let activities = 0;
    let food = 0;
    let other = 0;

    trip.sections.forEach((sec: ItinerarySection) => {
      const b = Number(sec.budget) || 0;
      switch (sec.type) {
        case 'travel':
          transport += b;
          break;
        case 'hotel':
          stay += b;
          break;
        case 'sightseeing':
        case 'activity':
          activities += b;
          break;
        case 'food':
          food += b;
          break;
        default:
          other += b;
          break;
      }
    });

    const sum = transport + stay + activities + food + other;
    const days = Math.max(1, durationDays || 1);
    const avgPerDay = Math.round(sum / days);

    return {
      total: sum,
      perDay: avgPerDay,
      breakdown: [
        {
          key: 'travel',
          label: 'Transport & Travel',
          amount: transport,
          percentage: sum > 0 ? (transport / sum) * 100 : 0,
          color: 'bg-[#F4C95D]',
          textColor: 'text-[#C29326]',
          icon: Plane,
        },
        {
          key: 'hotel',
          label: 'Hotel & Stays',
          amount: stay,
          percentage: sum > 0 ? (stay / sum) * 100 : 0,
          color: 'bg-[#4E7360]',
          textColor: 'text-[#4E7360]',
          icon: Building2,
        },
        {
          key: 'activity',
          label: 'Activities & Sights',
          amount: activities,
          percentage: sum > 0 ? (activities / sum) * 100 : 0,
          color: 'bg-[#E3B443]',
          textColor: 'text-[#C29326]',
          icon: Compass,
        },
        {
          key: 'food',
          label: 'Food & Dining',
          amount: food,
          percentage: sum > 0 ? (food / sum) * 100 : 0,
          color: 'bg-[#D96B43]',
          textColor: 'text-[#D96B43]',
          icon: Utensils,
        },
        {
          key: 'other',
          label: 'Other Incidentals',
          amount: other,
          percentage: sum > 0 ? (other / sum) * 100 : 0,
          color: 'bg-[#8C867B]',
          textColor: 'text-[#8C867B]',
          icon: Sparkles,
        },
      ],
    };
  }, [trip.sections, durationDays]);

  return (
    <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-5 sm:p-6 shadow-sm space-y-5">
      {/* Header Row */}
      <div className="flex items-center justify-between pb-3 border-b border-[#DAD4C7]/70">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-[#F4C95D]/20 text-[#C29326]">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-serif font-bold text-[#252525]">
              Estimated Trip Cost
            </h3>
            <p className="text-[11px] text-[#6F6A60]">
              Calculated dynamically from {trip.sections.length} itinerary segments
            </p>
          </div>
        </div>

        <span className="text-xs font-bold text-[#4E7360] bg-[#E7EFEA] px-2.5 py-1 rounded-full">
          {durationDays} Days
        </span>
      </div>

      {/* Main Numbers Callout */}
      <div className="grid grid-cols-2 gap-3 bg-[#FCFAF5] p-4 rounded-2xl border border-[#DAD4C7]/60">
        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C867B] block">
            Total Estimated Budget
          </span>
          <span className="text-xl sm:text-2xl font-serif font-bold text-[#252525]">
            ₹{total.toLocaleString('en-IN')}
          </span>
        </div>

        <div>
          <span className="text-[10px] uppercase font-bold tracking-wider text-[#8C867B] block">
            Average Cost / Day
          </span>
          <span className="text-xl sm:text-2xl font-serif font-bold text-[#4E7360]">
            ₹{perDay.toLocaleString('en-IN')}
          </span>
        </div>
      </div>

      {/* Composite Progress Bar */}
      <div className="space-y-1.5">
        <div className="h-3 w-full rounded-full overflow-hidden bg-[#DAD4C7]/40 flex">
          {breakdown.map((item) =>
            item.percentage > 0 ? (
              <div
                key={item.key}
                style={{ width: `${item.percentage}%` }}
                className={`${item.color} transition-all duration-500`}
                title={`${item.label}: ₹${item.amount.toLocaleString('en-IN')} (${item.percentage.toFixed(0)}%)`}
              />
            ) : null
          )}
        </div>
        <div className="flex items-center justify-between text-[10px] text-[#8C867B]">
          <span>Cost Allocation</span>
          <span>100% of planned expenses</span>
        </div>
      </div>

      {/* Category Breakdown Rows */}
      <div className="space-y-2 pt-1">
        <span className="text-[11px] uppercase font-bold tracking-wider text-[#8C867B] block">
          Breakdown by Category
        </span>

        <div className="space-y-1.5">
          {breakdown.map((item) => {
            const Icon = item.icon;
            const isSelected = selectedCategoryFilter === item.key;
            return (
              <button
                key={item.key}
                type="button"
                onClick={() =>
                  onSelectCategoryFilter &&
                  onSelectCategoryFilter(isSelected ? null : item.key)
                }
                className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-white border border-[#E5B740] shadow-xs'
                    : 'hover:bg-white/80 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg bg-[#FCFAF5] ${item.textColor}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="font-semibold text-[#252525]">{item.label}</span>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-bold text-[#252525]">
                    ₹{item.amount.toLocaleString('en-IN')}
                  </span>
                  <span className="text-[10px] font-semibold text-[#8C867B] w-9 text-right">
                    {item.percentage.toFixed(0)}%
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
