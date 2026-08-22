import React from 'react';
import {
  Plane,
  MapPin,
  Compass,
  Wallet,
  Calendar,
  Clock,
} from 'lucide-react';
import { TravelSnapshotData } from '../../services/insightsService';

export interface TravelSnapshotProps {
  snapshot: TravelSnapshotData;
}

export const TravelSnapshot: React.FC<TravelSnapshotProps> = ({ snapshot }) => {
  return (
    <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-6 sm:p-8 space-y-6 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DAD4C7]/60 pb-4">
        <div>
          <span className="text-[11px] uppercase font-bold tracking-wider text-[#8C867B] block">
            Personal Travel Intelligence
          </span>
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#252525]">
            Your Travel Snapshot
          </h2>
        </div>

        <span className="text-xs font-semibold text-[#4E7360] bg-[#E7EFEA] px-3 py-1 rounded-full self-start sm:self-auto">
          {snapshot.upcomingTrips} Upcoming • {snapshot.ongoingTrips} Active
        </span>
      </div>

      {/* Snapshot Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        {/* Total Trips */}
        <div className="p-4 bg-[#FCFAF5] rounded-2xl border border-[#DAD4C7]/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#8C867B]">Total Trips</span>
            <Plane className="w-3.5 h-3.5 text-[#C29326]" />
          </div>
          <span className="text-2xl font-serif font-bold text-[#252525] block">
            {snapshot.totalTrips}
          </span>
        </div>

        {/* Cities Visited */}
        <div className="p-4 bg-[#FCFAF5] rounded-2xl border border-[#DAD4C7]/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#8C867B]">Cities</span>
            <MapPin className="w-3.5 h-3.5 text-[#4E7360]" />
          </div>
          <span className="text-2xl font-serif font-bold text-[#252525] block">
            {snapshot.citiesVisited}
          </span>
        </div>

        {/* Activities Planned */}
        <div className="p-4 bg-[#FCFAF5] rounded-2xl border border-[#DAD4C7]/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#8C867B]">Activities</span>
            <Compass className="w-3.5 h-3.5 text-[#E3B443]" />
          </div>
          <span className="text-2xl font-serif font-bold text-[#252525] block">
            {snapshot.activitiesPlanned}
          </span>
        </div>

        {/* Total Est. Spend */}
        <div className="p-4 bg-[#FCFAF5] rounded-2xl border border-[#DAD4C7]/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#8C867B]">Est. Spend</span>
            <Wallet className="w-3.5 h-3.5 text-[#D96B43]" />
          </div>
          <span className="text-2xl font-serif font-bold text-[#252525] block">
            ₹{(snapshot.totalEstimatedSpend).toLocaleString('en-IN')}
          </span>
        </div>

        {/* Avg Duration */}
        <div className="p-4 bg-[#FCFAF5] rounded-2xl border border-[#DAD4C7]/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#8C867B]">Avg Duration</span>
            <Calendar className="w-3.5 h-3.5 text-[#6F6A60]" />
          </div>
          <span className="text-2xl font-serif font-bold text-[#252525] block">
            {snapshot.avgTripDurationDays} <span className="text-xs font-normal text-[#8C867B]">Days</span>
          </span>
        </div>

        {/* Avg Spend / Day */}
        <div className="p-4 bg-[#FCFAF5] rounded-2xl border border-[#DAD4C7]/60 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] uppercase font-bold text-[#8C867B]">Cost / Day</span>
            <Clock className="w-3.5 h-3.5 text-[#4E7360]" />
          </div>
          <span className="text-2xl font-serif font-bold text-[#252525] block">
            ₹{(snapshot.avgSpendPerDay).toLocaleString('en-IN')}
          </span>
        </div>
      </div>
    </div>
  );
};
