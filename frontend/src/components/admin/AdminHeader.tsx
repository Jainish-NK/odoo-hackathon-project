import React from 'react';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

interface AdminHeaderProps {
  dateRange: string;
  onDateRangeChange: (range: '7d' | '30d' | '90d' | 'year') => void;
  onRefresh: () => void;
  isRefreshing?: boolean;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  dateRange,
  onDateRangeChange,
  onRefresh,
  isRefreshing = false,
}) => {
  return (
    <div className="bg-[#FFF9EE] border border-[#DAD4C7]/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-4">
      {/* Top Breadcrumb & Status */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 text-[#6F6A60] font-medium">
          <span>GlobeTrotter</span>
          <span className="text-[#DAD4C7]">/</span>
          <span className="text-[#252525] font-semibold">Admin Dashboard</span>
        </div>

        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E7EFEA] border border-[#C2D7CC] text-xs font-bold text-[#4E7360]">
          <span className="w-2 h-2 rounded-full bg-[#4E7360] animate-pulse" />
          <span>System Healthy • Live Feed</span>
        </div>
      </div>

      {/* Main Title & Action Strip */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pt-1">
        <div className="space-y-1.5 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#FCFAF5] border border-[#DAD4C7] text-xs font-bold text-[#252525]">
            <ShieldCheck className="w-4 h-4 text-[#C29326]" />
            <span>Executive Travel Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#252525] tracking-tight">
            Admin Dashboard
          </h1>

          <p className="text-xs sm:text-sm text-[#6F6A60] leading-relaxed">
            Monitor platform activity, manage registered travelers, and analyze global journey trends.
          </p>
        </div>

        {/* Date Filter & Refresh Button */}
        <div className="flex flex-wrap items-center gap-2.5 self-start md:self-auto">
          {/* Time Window Pills */}
          <div className="flex items-center bg-[#FCFAF5] p-1 rounded-2xl border border-[#DAD4C7]">
            {(
              [
                { label: '7 Days', value: '7d' },
                { label: '30 Days', value: '30d' },
                { label: '90 Days', value: '90d' },
                { label: 'Year', value: 'year' },
              ] as const
            ).map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => onDateRangeChange(opt.value)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  dateRange === opt.value
                    ? 'bg-[#F4C95D] text-[#252525] shadow-xs'
                    : 'text-[#6F6A60] hover:text-[#252525]'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Quick Refresh */}
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            leftIcon={<RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />}
            className="text-xs font-bold"
          >
            Sync
          </Button>
        </div>
      </div>
    </div>
  );
};
