import React from 'react';
import { CategorySpendBreakdown } from '../../services/insightsService';

export interface SpendingBreakdownProps {
  breakdown: CategorySpendBreakdown[];
  budgetInsight: string;
  totalSpend: number;
}

export const SpendingBreakdown: React.FC<SpendingBreakdownProps> = ({
  breakdown,
  budgetInsight,
  totalSpend,
}) => {
  return (
    <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#DAD4C7]/60 pb-3">
        <h3 className="text-base font-serif font-bold text-[#252525]">
          Spending & Budget Allocation
        </h3>
        <span className="text-xs font-bold text-[#4E7360] bg-[#E7EFEA] px-2.5 py-0.5 rounded-lg">
          ₹{totalSpend.toLocaleString('en-IN')} Total
        </span>
      </div>

      {breakdown.length === 0 || totalSpend === 0 ? (
        <p className="text-xs text-[#8C867B] py-4 text-center">
          No budget data recorded. Add estimates to your itinerary sections to unlock spending breakdowns.
        </p>
      ) : (
        <div className="space-y-3.5">
          {breakdown.map((item) => (
            <div key={item.key} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#252525]">{item.label}</span>
                <span className="font-bold text-[#252525]">
                  ₹{item.amount.toLocaleString('en-IN')}{' '}
                  <span className="text-[#8C867B] font-normal">({item.percentage}%)</span>
                </span>
              </div>

              <div className="h-2 w-full rounded-full bg-[#FCFAF5] border border-[#DAD4C7]/50 overflow-hidden">
                <div
                  style={{ width: `${item.percentage}%` }}
                  className={`h-full ${item.color} rounded-full transition-all duration-500`}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Observation Insight Box */}
      <div className="p-3.5 bg-[#FCFAF5] rounded-2xl border border-[#DAD4C7]/70 text-xs text-[#6F6A60] leading-relaxed">
        <strong className="text-[#252525] block mb-0.5">Budget Observation:</strong>
        {budgetInsight}
      </div>
    </div>
  );
};
