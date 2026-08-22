import React from 'react';
import { X, RotateCcw } from 'lucide-react';

export interface FilterChip {
  id: string;
  label: string;
  value: string;
  onRemove: () => void;
}

export interface ActiveFilterChipsProps {
  chips: FilterChip[];
  onClearAll: () => void;
}

export const ActiveFilterChips: React.FC<ActiveFilterChipsProps> = ({
  chips,
  onClearAll,
}) => {
  if (chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-1 pb-2">
      <span className="text-xs text-[#8C867B] font-medium mr-1">Active filters:</span>

      {chips.map((chip) => (
        <span
          key={chip.id}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-[#FFF9EE] border border-[#DAD4C7] text-xs font-semibold text-[#252525] shadow-2xs group animate-in zoom-in-95 duration-150"
        >
          <span className="text-[#6F6A60] font-normal">{chip.label}:</span>
          <span>{chip.value}</span>
          <button
            type="button"
            onClick={chip.onRemove}
            aria-label={`Remove filter ${chip.label}`}
            className="p-0.5 text-[#8C867B] hover:text-[#D96B43] hover:bg-black/5 rounded-md transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </span>
      ))}

      <button
        type="button"
        onClick={onClearAll}
        className="inline-flex items-center gap-1 text-xs font-bold text-[#D96B43] hover:text-[#b8522d] px-2.5 py-1 rounded-xl hover:bg-[#FAECE7] transition-colors cursor-pointer ml-1"
      >
        <RotateCcw className="w-3 h-3" />
        <span>Clear All</span>
      </button>
    </div>
  );
};
