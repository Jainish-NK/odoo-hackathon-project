import React from 'react';
import { Link } from 'react-router-dom';
import { Search, Sparkles, MapPin, ArrowRight, Compass } from 'lucide-react';

interface HeroBannerProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onSearchSubmit?: () => void;
  onPlanTrip?: () => void;
}

export const HeroBanner: React.FC<HeroBannerProps> = ({
  searchQuery,
  onSearchChange,
  onSearchSubmit,
  onPlanTrip,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearchSubmit) onSearchSubmit();
  };

  return (
    <div className="relative w-full rounded-[28px] sm:rounded-[36px] overflow-hidden shadow-2xl shadow-[#252525]/15 border border-white/70 mb-10 sm:mb-14">
      {/* Background Photography with Warm Multi-layered Overlay */}
      <div
        className="absolute inset-0 bg-cover bg-center transition-transform duration-1000 scale-105"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?q=80&w=2021&auto=format&fit=crop')`,
        }}
      />
      {/* Warm Gradient & Contrast Overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/50 to-black/30" />
      <div className="absolute inset-0 bg-[#F4C95D]/10 mix-blend-overlay" />
      <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-[#F4C95D]/20 blur-3xl pointer-events-none" />

      {/* Content Container */}
      <div className="relative z-10 min-h-[420px] sm:min-h-[480px] flex flex-col items-center justify-center text-center px-4 sm:px-8 py-12 sm:py-16 max-w-4xl mx-auto">
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 text-white text-xs font-semibold mb-4 shadow-sm animate-in fade-in duration-300">
          <Sparkles className="w-3.5 h-3.5 text-[#F4C95D]" />
          <span>Curated Travel Planning & Smart Itineraries</span>
        </div>

        {/* Editorial Heading */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-serif font-extrabold text-white tracking-tight leading-[1.15] mb-4">
          Plan Journeys You'll Remember.
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-base md:text-lg text-[#FFF9EE]/90 max-w-2xl mb-8 leading-relaxed font-normal">
          Discover world-class destinations, build day-by-day itineraries, track your budget in real time, and explore together.
        </p>

        {/* Hero Search Bar */}
        <form onSubmit={handleSubmit} className="w-full max-w-xl mb-6">
          <div className="relative flex items-center bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl shadow-black/30 border border-white p-1.5 transition-all focus-within:ring-4 focus-within:ring-[#F4C95D]/40">
            <div className="pl-3.5 text-[#8C867B] flex items-center pointer-events-none shrink-0">
              <Search className="w-5 h-5" />
            </div>

            <input
              type="text"
              placeholder="Search cities, countries, or regions (e.g. Paris, Tokyo, Italy)..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-11 sm:h-12 bg-transparent text-[14px] sm:text-[15px] text-[#252525] placeholder:text-[#8C867B] px-3 focus:outline-none font-medium"
            />

            <button
              type="submit"
              className="px-4 sm:px-6 h-10 sm:h-11 bg-[#F4C95D] hover:bg-[#E3B443] text-[#252525] font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs shrink-0 flex items-center gap-1.5 cursor-pointer active:scale-95 border border-[#E3B443]/40"
            >
              <span>Explore</span>
              <ArrowRight className="w-3.5 h-3.5 hidden sm:inline" />
            </button>
          </div>
        </form>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs text-white/90">
          <span className="text-white/70 text-[11px] sm:text-xs font-semibold">Popular:</span>
          {['Paris', 'Tokyo', 'Amalfi Coast', 'Bali', 'Jaipur', 'Amsterdam'].map((city) => (
            <button
              key={city}
              type="button"
              onClick={() => onSearchChange(city)}
              className="px-3 py-1 rounded-full bg-white/15 hover:bg-white/30 active:scale-95 text-white backdrop-blur-xs transition-all cursor-pointer flex items-center gap-1 text-[11px] sm:text-xs shadow-2xs border border-white/20 font-medium"
            >
              <MapPin className="w-2.5 h-2.5 text-[#F4C95D]" /> {city}
            </button>
          ))}
        </div>

        {/* Direct Action CTAs Row */}
        <div className="flex items-center gap-3 mt-8">
          <Link
            to="/cities"
            className="px-5 py-2.5 rounded-xl bg-white/90 hover:bg-white text-xs font-bold text-[#252525] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer"
          >
            <Compass className="w-4 h-4 text-[#C29326]" /> Explore Destinations
          </Link>
          <button
            type="button"
            onClick={onPlanTrip}
            className="px-5 py-2.5 rounded-xl bg-[#F4C95D] hover:bg-[#E3B443] text-xs font-bold text-[#252525] transition-all shadow-sm flex items-center gap-1.5 cursor-pointer border border-[#E3B443]/40"
          >
            <Sparkles className="w-4 h-4 text-[#252525]" /> Plan a Trip
          </button>
        </div>
      </div>
    </div>
  );
};
