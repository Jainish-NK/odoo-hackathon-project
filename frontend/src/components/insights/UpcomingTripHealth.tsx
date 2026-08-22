import React from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Compass,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { TripHealthItem } from '../../services/insightsService';
import { formatDisplayDate } from '../../services/tripService';
import { Button } from '../ui/Button';

export interface UpcomingTripHealthProps {
  healthItems: TripHealthItem[];
}

export const UpcomingTripHealth: React.FC<UpcomingTripHealthProps> = ({
  healthItems,
}) => {
  return (
    <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-6 space-y-5 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#DAD4C7]/60 pb-3">
        <div>
          <h3 className="text-base font-serif font-bold text-[#252525]">
            Upcoming Trip Pacing & Health
          </h3>
          <p className="text-xs text-[#6F6A60]">
            Planning completeness, activity density, and schedule balance
          </p>
        </div>

        <span className="text-xs font-semibold text-[#8C867B]">
          {healthItems.length} Active / Upcoming Trip{healthItems.length === 1 ? '' : 's'}
        </span>
      </div>

      {healthItems.length === 0 ? (
        <div className="p-8 bg-[#FCFAF5] rounded-2xl border border-[#DAD4C7]/60 text-center space-y-3">
          <p className="text-xs text-[#6F6A60]">
            You have no upcoming journeys planned right now.
          </p>
          <Link to="/trips/create">
            <Button variant="primary" size="sm" className="text-xs font-bold">
              + Plan a New Trip
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {healthItems.map((item) => (
            <div
              key={item.trip.id}
              className="p-5 bg-white rounded-2xl border border-[#DAD4C7]/80 hover:border-[#E5B740] transition-colors space-y-4 shadow-2xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-base font-serif font-bold text-[#252525]">
                      {item.trip.name}
                    </h4>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E7EFEA] text-[#4E7360] border border-[#C2D7CC]">
                      {item.durationDays} Days
                    </span>
                  </div>

                  <div className="flex flex-wrap items-center gap-3 text-xs text-[#6F6A60] mt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#C29326]" />
                      {formatDisplayDate(item.trip.startDate)} — {formatDisplayDate(item.trip.endDate)}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#4E7360]" />
                      {item.citiesCount} {item.citiesCount === 1 ? 'City' : 'Cities'}
                    </span>
                    <span className="flex items-center gap-1">
                      <Compass className="w-3.5 h-3.5 text-[#E3B443]" />
                      {item.activitiesCount} Activities
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-[#8C867B] block">
                      Est. Total
                    </span>
                    <span className="text-sm font-bold text-[#252525]">
                      ₹{item.totalBudget.toLocaleString('en-IN')}
                    </span>
                  </div>

                  <Link to={`/trips/${item.trip.id}/itinerary`}>
                    <Button
                      variant="outline"
                      size="sm"
                      rightIcon={<ArrowRight className="w-3.5 h-3.5" />}
                      className="text-xs font-bold"
                    >
                      Itinerary
                    </Button>
                  </Link>
                </div>
              </div>

              {/* Completeness Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#8C867B] flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#4E7360]" />
                    Planning Completeness
                  </span>
                  <span className="font-bold text-[#252525]">
                    {item.completenessPercentage}%
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-[#FCFAF5] border border-[#DAD4C7]/50 overflow-hidden">
                  <div
                    style={{ width: `${item.completenessPercentage}%` }}
                    className="h-full bg-[#4E7360] rounded-full transition-all duration-500"
                  />
                </div>
              </div>

              {/* Balance & Overload Notes */}
              <div className="flex flex-wrap gap-2 pt-1">
                {item.balanceNotes.map((note, idx) => (
                  <span
                    key={idx}
                    className="text-[11px] font-medium px-2.5 py-1 rounded-lg bg-[#FCFAF5] border border-[#DAD4C7]/70 text-[#6F6A60]"
                  >
                    💡 {note}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
