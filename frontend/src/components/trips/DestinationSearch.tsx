import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Plus } from 'lucide-react';
import { TripDestinationOption } from '../../types/trip';
import { availableDestinationOptions } from '../../data/tripSuggestions';

interface DestinationSearchProps {
  selectedDestinations: TripDestinationOption[];
  onAddDestination: (destination: TripDestinationOption) => void;
  onRemoveDestination: (id: string) => void;
  error?: string;
}

export const DestinationSearch: React.FC<DestinationSearchProps> = ({
  selectedDestinations,
  onAddDestination,
  onRemoveDestination,
  error,
}) => {
  const [query, setQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredOptions = availableDestinationOptions.filter((opt) => {
    const isAlreadySelected = selectedDestinations.some((d) => d.id === opt.id);
    if (isAlreadySelected) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase().trim();
    return (
      opt.city.toLowerCase().includes(q) ||
      opt.country.toLowerCase().includes(q) ||
      opt.region.toLowerCase().includes(q)
    );
  });

  const handleSelect = (dest: TripDestinationOption) => {
    onAddDestination(dest);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="w-full flex flex-col gap-2" ref={dropdownRef}>
      <label className="text-[13px] font-medium text-[#48443E] select-none flex items-center justify-between">
        <span>
          Select Destination(s) <span className="text-[#D96B43]">*</span>
        </span>
        <span className="text-xs text-[#6F6A60] font-normal">
          Multi-city supported
        </span>
      </label>

      {/* Search Input Bar */}
      <div className="relative">
        <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#8C867B] pointer-events-none">
          <Search className="w-4 h-4" />
        </div>

        <input
          type="text"
          placeholder="Search cities, countries, or regions (e.g. Paris, Tokyo, Amsterdam)..."
          value={query}
          onFocus={() => setIsOpen(true)}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          className={`w-full h-12 text-[14px] text-[#252525] placeholder:text-[#8C867B]/70 bg-white/85 border rounded-xl pl-11 pr-10 transition-all duration-200 focus:outline-none focus:bg-white ${
            error
              ? 'border-[#D96B43] focus:border-[#D96B43] focus:ring-4 focus:ring-[#D96B43]/15'
              : 'border-[#DAD4C7] hover:border-[#B7B0A2] focus:border-[#E3B443] focus:ring-4 focus:ring-[#F4C95D]/20'
          }`}
        />

        {query && (
          <button
            type="button"
            onClick={() => setQuery('')}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C867B] hover:text-[#252525] p-1"
          >
            <X className="w-4 h-4" />
          </button>
        )}

        {/* Autocomplete Dropdown List */}
        {isOpen && (
          <div
            className="absolute left-0 right-0 top-full mt-1.5 bg-[#FFF9EE] border border-white/80 rounded-2xl shadow-xl p-2 z-40 max-h-64 overflow-y-auto animate-in fade-in zoom-in-95 duration-150"
            style={{ boxShadow: '0 16px 36px -8px rgba(45, 37, 24, 0.2)' }}
          >
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleSelect(opt)}
                  className="w-full px-3.5 py-2.5 rounded-xl text-left flex items-center justify-between hover:bg-black/5 transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl shrink-0">{opt.flag}</span>
                    <div>
                      <p className="text-sm font-bold text-[#252525] group-hover:text-[#C29326] transition-colors leading-tight">
                        {opt.city}
                      </p>
                      <p className="text-[11px] text-[#6F6A60]">
                        {opt.country} • <span className="font-medium text-[#4E7360]">{opt.region}</span>
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-semibold text-[#4E7360] bg-[#E7EFEA] px-2.5 py-1 rounded-lg flex items-center gap-1 group-hover:bg-[#4E7360] group-hover:text-white transition-colors">
                    <Plus className="w-3 h-3" /> Add
                  </span>
                </button>
              ))
            ) : (
              <div className="py-4 text-center text-xs text-[#8C867B]">
                No matching destinations found for "{query}"
              </div>
            )}
          </div>
        )}
      </div>

      {error && (
        <p className="text-[12px] text-[#D96B43] mt-0.5 animate-in fade-in">
          {error}
        </p>
      )}

      {/* Selected Destinations Chips Container */}
      {selectedDestinations.length > 0 && (
        <div className="mt-2 pt-2 border-t border-[#DAD4C7]/60">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-[#6F6A60] block mb-2">
            Selected Itinerary Route ({selectedDestinations.length}):
          </span>

          <div className="flex flex-wrap gap-2 items-center">
            {selectedDestinations.map((dest, index) => (
              <div
                key={dest.id}
                className="inline-flex items-center gap-2 bg-[#FFF9EE] border border-[#E5B740] px-3.5 py-1.5 rounded-xl shadow-xs animate-in zoom-in-95 duration-200 group"
              >
                <span className="text-xs font-bold text-[#C29326]">#{index + 1}</span>
                <span className="text-sm">{dest.flag}</span>
                <span className="text-xs font-semibold text-[#252525]">{dest.city}</span>
                <span className="text-[10px] text-[#6F6A60]">({dest.country})</span>
                <button
                  type="button"
                  onClick={() => onRemoveDestination(dest.id)}
                  aria-label={`Remove ${dest.city}`}
                  className="p-0.5 text-[#8C867B] hover:text-[#D96B43] hover:bg-black/5 rounded-md transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="inline-flex items-center gap-1 text-xs font-semibold text-[#4E7360] hover:text-[#334D40] px-2.5 py-1.5 rounded-xl bg-[#E7EFEA] hover:bg-[#d8e6dc] transition-colors cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" /> Add another city
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
