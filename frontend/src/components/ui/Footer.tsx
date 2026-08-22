import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Compass,
  Sparkles,
  ShieldCheck,
  Send,
  Heart,
  Globe,
  MapPin,
  Calendar,
  TrendingUp,
  Users,
  CheckCircle2,
} from 'lucide-react';
import { useToast } from '../../context/ToastContext';

export const Footer: React.FC = () => {
  const { showToast } = useToast();
  const [email, setEmail] = useState('');
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !email.includes('@')) {
      showToast('error', 'Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsSubscribed(true);
    showToast(
      'success',
      'Subscribed to Travel Dispatch!',
      'You will receive our monthly curated itineraries and secret destination guides.'
    );
    setEmail('');
  };

  return (
    <footer className="border-t border-[#DAD4C7]/90 bg-[#FFF9EE]/90 backdrop-blur-md mt-16 text-[#252525]">
      {/* Top Main Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10">
          {/* Column 1: Brand & Mission (4 cols on lg) */}
          <div className="lg:col-span-4 space-y-4">
            <Link to="/" className="inline-flex items-center gap-2.5 group select-none">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#F4C95D] to-[#E3B443] flex items-center justify-center text-[#252525] shadow-xs shadow-[#F4C95D]/30 border border-white/70">
                <Compass className="w-5 h-5 transition-transform duration-500 group-hover:rotate-45" />
              </div>
              <span className="text-[22px] font-serif font-bold tracking-tight text-[#252525] leading-tight">
                Globe<span className="text-[#C29326]">Trotter</span>
              </span>
            </Link>

            <p className="text-xs sm:text-[13px] text-[#6F6A60] leading-relaxed max-w-sm">
              Handcrafted, personalized travel itineraries, live budget tracking, and community-tested journeys designed for curious explorers worldwide.
            </p>

            <div className="pt-2 flex items-center gap-4 text-xs font-semibold text-[#4E7360]">
              <span className="inline-flex items-center gap-1 bg-[#E7EFEA] px-2.5 py-1 rounded-full border border-[#C2D7CC]">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Travel Engine
              </span>
              <span className="inline-flex items-center gap-1 bg-[#FFF9EE] px-2.5 py-1 rounded-full border border-[#DAD4C7]">
                <Sparkles className="w-3.5 h-3.5 text-[#C29326]" /> Smart Scheduling
              </span>
            </div>
          </div>

          {/* Column 2: Explore (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C867B]">
              Explore
            </h4>
            <ul className="space-y-2 text-xs font-medium text-[#5C574E]">
              <li>
                <Link to="/cities" className="hover:text-[#252525] transition-colors flex items-center gap-1.5">
                  <Globe className="w-3 h-3 text-[#C29326]" /> Destinations & Cities
                </Link>
              </li>
              <li>
                <Link to="/activities" className="hover:text-[#252525] transition-colors flex items-center gap-1.5">
                  <MapPin className="w-3 h-3 text-[#4E7360]" /> Activities & Sights
                </Link>
              </li>
              <li>
                <Link to="/community" className="hover:text-[#252525] transition-colors flex items-center gap-1.5">
                  <Users className="w-3 h-3 text-[#D96B43]" /> Community Stories
                </Link>
              </li>
              <li>
                <a href="/#top-destinations" className="hover:text-[#252525] transition-colors">
                  Popular Selections
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Plan & Organize (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C867B]">
              Plan & Organize
            </h4>
            <ul className="space-y-2 text-xs font-medium text-[#5C574E]">
              <li>
                <Link to="/trips/create" className="hover:text-[#252525] transition-colors font-semibold text-[#252525]">
                  + Plan a New Trip
                </Link>
              </li>
              <li>
                <Link to="/trips" className="hover:text-[#252525] transition-colors">
                  My Trips Portfolio
                </Link>
              </li>
              <li>
                <Link to="/calendar" className="hover:text-[#252525] transition-colors flex items-center gap-1.5">
                  <Calendar className="w-3 h-3 text-[#C29326]" /> Travel Calendar
                </Link>
              </li>
              <li>
                <Link to="/insights" className="hover:text-[#252525] transition-colors flex items-center gap-1.5">
                  <TrendingUp className="w-3 h-3 text-[#4E7360]" /> Travel Insights & Health
                </Link>
              </li>
              <li>
                <Link to="/profile" className="hover:text-[#252525] transition-colors">
                  Profile & Preferences
                </Link>
              </li>
            </ul>
          </div>

          {/* Column 4: Newsletter & Dispatch (3 cols on lg) */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C867B]">
              Traveler Dispatch
            </h4>
            <p className="text-xs text-[#6F6A60] leading-relaxed">
              Receive handpicked seasonal itineraries, flight booking tips, and hidden local destinations once a month.
            </p>

            {isSubscribed ? (
              <div className="p-3 bg-[#E7EFEA] border border-[#C2D7CC] rounded-xl flex items-center gap-2 text-xs font-semibold text-[#334D40]">
                <CheckCircle2 className="w-4 h-4 text-[#4E7360] shrink-0" />
                <span>You are subscribed to the Dispatch!</span>
              </div>
            ) : (
              <form onSubmit={handleSubscribe} className="space-y-2">
                <div className="relative flex items-center">
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="explorer@globetrotter.com"
                    required
                    className="w-full h-10 bg-white border border-[#DAD4C7] rounded-xl pl-3 pr-9 text-xs text-[#252525] placeholder:text-[#8C867B] focus:outline-none focus:border-[#E3B443] focus:ring-2 focus:ring-[#F4C95D]/20 font-medium"
                  />
                  <button
                    type="submit"
                    aria-label="Subscribe to dispatch"
                    className="absolute right-1.5 p-1.5 rounded-lg bg-[#F4C95D] hover:bg-[#E3B443] text-[#252525] transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>
                </div>
                <span className="text-[11px] text-[#8C867B] block">
                  Zero spam. Unsubscribe at any time.
                </span>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Bottom Sub-bar */}
      <div className="border-t border-[#DAD4C7]/70 py-6 px-4 sm:px-8 bg-[#FCFAF5]/70">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#6F6A60]">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3">
            <span className="font-semibold text-[#252525]">
              © 2026 GlobeTrotter
            </span>
            <span>•</span>
            <span>Personalized Travel Planning Platform</span>
            <span>•</span>
            <span className="text-[#8C867B] flex items-center gap-1">
              Engineered with <Heart className="w-3 h-3 text-[#D96B43] fill-current" /> for Odoo Hackathon
            </span>
          </div>

          <div className="flex items-center gap-4 font-medium text-[12px]">
            <Link to="/cities" className="hover:text-[#252525] transition-colors">
              Destinations
            </Link>
            <span>•</span>
            <Link to="/community" className="hover:text-[#252525] transition-colors">
              Community
            </Link>
            <span>•</span>
            <Link to="/profile" className="hover:text-[#252525] transition-colors">
              Privacy & Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
