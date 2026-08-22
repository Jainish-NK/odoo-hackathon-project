import React from 'react';
import { Link } from 'react-router-dom';
import { Globe, Plane, Award } from 'lucide-react';
import { Trip } from '../../types/trip';
import { Button } from '../ui/Button';

export interface TravelPatternCardProps {
  mostVisitedRegion: string;
  mostActiveTrip: Trip | null;
  highestBudgetTrip: Trip | null;
}

export const TravelPatternCard: React.FC<TravelPatternCardProps> = ({
  mostVisitedRegion,
  mostActiveTrip,
  highestBudgetTrip,
}) => {
  return (
    <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#DAD4C7]/60 pb-3">
        <h3 className="text-base font-serif font-bold text-[#252525]">
          Travel Patterns & Highlights
        </h3>
        <span className="text-xs font-semibold text-[#8C867B]">
          Global Journeys
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Most Visited Region */}
        <div className="p-4 bg-white rounded-2xl border border-[#DAD4C7]/80 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#C29326]">
            <Globe className="w-4 h-4" /> Top Region
          </div>
          <span className="text-lg font-serif font-bold text-[#252525] block">
            {mostVisitedRegion}
          </span>
          <p className="text-[11px] text-[#6F6A60]">
            Your primary destination hub for explorations.
          </p>
        </div>

        {/* Most Detailed Itinerary */}
        <div className="p-4 bg-white rounded-2xl border border-[#DAD4C7]/80 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#4E7360]">
            <Award className="w-4 h-4" /> Most Detailed Trip
          </div>
          <span className="text-base font-serif font-bold text-[#252525] truncate block">
            {mostActiveTrip ? mostActiveTrip.name : 'None yet'}
          </span>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#6F6A60]">
              {mostActiveTrip?.sections?.length || 0} scheduled activities
            </span>
            {mostActiveTrip && (
              <Link to={`/trips/${mostActiveTrip.id}/itinerary`}>
                <Button variant="outline" size="sm" className="text-[10px] font-bold px-2 py-0.5">
                  View
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Highest Estimated Trip */}
        <div className="p-4 bg-white rounded-2xl border border-[#DAD4C7]/80 space-y-2 shadow-2xs">
          <div className="flex items-center gap-2 text-xs font-bold text-[#D96B43]">
            <Plane className="w-4 h-4" /> Highest Planned Budget
          </div>
          <span className="text-base font-serif font-bold text-[#252525] truncate block">
            {highestBudgetTrip ? highestBudgetTrip.name : 'None yet'}
          </span>
          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-[#4E7360] font-bold">
              ₹
              {(
                highestBudgetTrip?.sections?.reduce(
                  (acc, s) => acc + (Number(s.budget) || 0),
                  0
                ) || highestBudgetTrip?.totalBudget || 0
              ).toLocaleString('en-IN')}
            </span>
            {highestBudgetTrip && (
              <Link to={`/trips/${highestBudgetTrip.id}/itinerary`}>
                <Button variant="outline" size="sm" className="text-[10px] font-bold px-2 py-0.5">
                  View
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
