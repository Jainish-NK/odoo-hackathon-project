import React from 'react';
import { Search, Sparkles, MapPin } from 'lucide-react';

interface HeroBannerProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit();
  };

  return (
    <div className="relative w-full rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-xl shadow-[#252525]/10 border border-white/60 mb-8 sm:mb-10">
      {/* Background Photography with Warm Multi-layered Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')`,
        }}
      />
      {/* Warm Gradient & Contrast Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/45 to-black/30" />
      <div className="absolute inset-0 bg-[#F4C95D]/10 mix-blend-overlay" />

      {/* Content Container */}
      <div className="relative z-10 min-h-[340px] sm:min-h-[380px] flex flex-col items-center justify-center text-center px-4 sm:px-8 py-8 sm:py-12 max-w-3xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold mb-4 shadow-sm animate-in fade-in duration-300">
          <Sparkles className="w-3.5 h-3.5 text-[#F4C95D]" />
          <span>Personalized Travel Planning Platform</span>
        </div>

        {/* Heading */}
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-extrabold text-white tracking-tight leading-tight mb-3">
          Discover your next adventure
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base text-[#FFF9EE]/90 max-w-xl mb-6 sm:mb-8 leading-relaxed font-normal">
          Explore curated destinations, build tailor-made trips, and turn your travel dreams into unforgettable journeys.
        </p>

        {/* Hero Search Bar */}
        <form onSubmit={handleSubmit} className="w-full max-w-lg">
          <div className="relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-xl shadow-black/25 border border-white p-1.5 transition-all focus-within:ring-4 focus-within:ring-[#F4C95D]/40">
            <div className="pl-3.5 text-[#8C867B] flex items-center pointer-events-none shrink-0">
              <Search className="w-5 h-5" />
            </div>

            <input
              type="text"
              placeholder="Search cities, countries, or destinations..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-11 sm:h-12 bg-transparent text-[14px] sm:text-[15px] text-[#252525] placeholder:text-[#8C867B] px-3 focus:outline-none"
            />

            <button
              type="submit"
              className="px-4 sm:px-5 h-10 sm:h-11 bg-[#F4C95D] hover:bg-[#E3B443] text-[#252525] font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Search</span>
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 mt-4 text-xs text-white/85">
          <span className="text-white/70 text-[11px] sm:text-xs">Popular:</span>
          {['Paris', 'Tokyo', 'Amalfi Coast', 'Bali', 'Dubai'].map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => onSearchChange(city)}
              className="px-2.5 py-1 rounded-full bg-white/15 hover:bg-white/25 active:scale-95 text-white backdrop-blur-xs transition-all cursor-pointer flex items-center gap-1 text-[11px] sm:text-xs shadow-2xs"
            >
              <MapPin className="w-2.5 h-2.5 text-[#F4C95D]" /> {city}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
