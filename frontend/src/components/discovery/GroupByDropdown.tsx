import { Layers } from 'lucide-react';

export interface GroupByOptionItem<T extends string = string> {
  value: T;
  label: string;
}

export interface GroupByDropdownProps<T extends string = string> {
  value: T;
  onChange: (val: T) => void;
  options: GroupByOptionItem<T>[];
  label?: string;
}

export const GroupByDropdown = <T extends string = string>({
  value,
  onChange,
  options,
  label = 'Group',
}: GroupByDropdownProps<T>) => {
  return (
    <div className="relative inline-flex items-center gap-1.5">
      <div className="h-11 px-3.5 bg-white/90 border border-[#DAD4C7] rounded-xl text-xs font-semibold text-[#252525] flex items-center gap-2 focus-within:border-[#E3B443] focus-within:ring-4 focus-within:ring-[#F4C95D]/20 transition-all shadow-2xs">
        <Layers className="w-3.5 h-3.5 text-[#4E7360] shrink-0 pointer-events-none" />
        <span className="text-[#8C867B] font-normal hidden sm:inline">{label}:</span>
        <select
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          className="bg-transparent text-[#252525] font-semibold text-xs focus:outline-none cursor-pointer pr-1"
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};
