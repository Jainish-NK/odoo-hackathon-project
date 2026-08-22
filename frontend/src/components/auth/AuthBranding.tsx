import React from 'react';
import { Compass, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthBrandingProps {
  showTagline?: boolean;
  align?: 'center' | 'left';
  className?: string;
}

export const AuthBranding: React.FC<AuthBrandingProps> = ({
  showTagline = true,
  align = 'center',
  className = '',
}) => {
  return (
    <Link
      to="/"
      className={`inline-flex flex-col ${
        align === 'center' ? 'items-center text-center' : 'items-start text-left'
      } group select-none transition-transform hover:scale-[1.01] ${className}`}
    >
      <div className="flex items-center gap-2.5">
        <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#F4C95D] to-[#E3B443] flex items-center justify-center text-[#252525] shadow-sm shadow-[#F4C95D]/30 border border-white/70 shrink-0">
          <Compass className="w-4.5 h-4.5 transition-transform duration-500 group-hover:rotate-45" />
          <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-[#4E7360] rounded-full border border-[#FFF9EE] flex items-center justify-center">
            <Sparkles className="w-1 h-1 text-white" />
          </span>
        </div>

        <div className="flex flex-col">
          <span className="text-[19px] sm:text-[21px] font-serif font-bold tracking-tight text-[#252525] leading-tight">
            Globe<span className="text-[#C29326]">Trotter</span>
          </span>
        </div>
      </div>

      {showTagline && (
        <p className="text-[12px] font-medium tracking-wide text-[#6F6A60] mt-1 flex items-center gap-1.5">
          <span>Plan the journey.</span>
          <span className="text-[#E3B443]">•</span>
          <span>Live the adventure.</span>
        </p>
      )}
    </Link>
  );
};
