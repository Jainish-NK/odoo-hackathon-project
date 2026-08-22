import React from 'react';
import { Sparkles } from 'lucide-react';
import { TravelStyleScore } from '../../services/insightsService';

export interface TravelStyleCardProps {
  styles: TravelStyleScore[];
  insightNote: string;
}

export const TravelStyleCard: React.FC<TravelStyleCardProps> = ({
  styles,
  insightNote,
}) => {
  return (
    <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-6 space-y-5 shadow-sm">
      <div className="flex items-center justify-between border-b border-[#DAD4C7]/60 pb-3">
        <h3 className="text-base font-serif font-bold text-[#252525]">
          Your Travel Style & Inferred Interests
        </h3>
        <span className="text-[11px] font-bold text-[#C29326] bg-[#FCFAF5] border border-[#DAD4C7] px-2.5 py-0.5 rounded-full flex items-center gap-1">
          <Sparkles className="w-3 h-3" /> Profile Intelligence
        </span>
      </div>

      {styles.length === 0 ? (
        <p className="text-xs text-[#8C867B] py-4 text-center">
          Plan more activities in your trips to generate detailed travel style scores.
        </p>
      ) : (
        <div className="space-y-3.5">
          {styles.map((item) => (
            <div key={item.style} className="space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#252525]">{item.style}</span>
                <span className="font-bold text-[#6F6A60]">{item.percentage}%</span>
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

      {/* Insight Note Box */}
      <div className="p-3.5 bg-[#FCFAF5] rounded-2xl border border-[#DAD4C7]/70 text-xs text-[#6F6A60] leading-relaxed">
        <strong className="text-[#252525] block mb-0.5">Travel Persona Insight:</strong>
        {insightNote}
      </div>
    </div>
  );
};
