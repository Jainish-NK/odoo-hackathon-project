import React from 'react';
import { Calendar } from 'lucide-react';

export interface DayTab {
  dayNumber: number | 'all';
  label: string;
  dateStr?: string;
  count: number;
}

export interface DaySelectorProps {
  days: DayTab[];
  selectedDay: number | 'all';
  onSelectDay: (day: number | 'all') => void;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  days,
  selectedDay,
  onSelectDay,
}) => {
  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-1 select-none no-scrollbar">
      {days.map((tab) => {
        const isSelected = selectedDay === tab.dayNumber;
        return (
          <button
            key={String(tab.dayNumber)}
            type="button"
            onClick={() => onSelectDay(tab.dayNumber)}
            className={`shrink-0 px-4 py-2 rounded-2xl text-xs font-bold transition-all duration-200 cursor-pointer flex items-center gap-2 ${
              isSelected
                ? 'bg-[#252525] text-white shadow-xs scale-[1.02]'
                : 'bg-[#FFF9EE] hover:bg-white text-[#6F6A60] hover:text-[#252525] border border-[#DAD4C7]/80'
            }`}
          >
            <Calendar className={`w-3.5 h-3.5 ${isSelected ? 'text-[#F4C95D]' : 'text-[#8C867B]'}`} />
            <span>{tab.label}</span>
            {tab.dateStr && (
              <span className={`text-[11px] font-normal ${isSelected ? 'text-white/70' : 'text-[#8C867B]'}`}>
                • {tab.dateStr}
              </span>
            )}
            <span
              className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                isSelected
                  ? 'bg-white/20 text-white'
                  : 'bg-[#FCFAF5] text-[#6F6A60] border border-[#DAD4C7]'
              }`}
            >
              {tab.count}
            </span>
          </button>
        );
      })}
    </div>
  );
};
