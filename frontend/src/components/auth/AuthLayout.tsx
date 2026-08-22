import React from 'react';
import { AuthBranding } from './AuthBranding';
import { ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

interface AuthLayoutProps {
  children: React.ReactNode;
  activeRoute: 'login' | 'register';
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, activeRoute }) => {
  return (
    <div className="relative min-h-screen w-full flex flex-col justify-between overflow-x-hidden bg-[#F7F1E5]">
      {/* Background Scenic Travel Image with Warm Translucent Overlay */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat transition-all duration-700 pointer-events-none"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=2070&auto=format&fit=crop')`,
        }}
      >
        {/* Layered Warm Cream Overlay for High Contrast Legibility */}
        <div className="absolute inset-0 bg-[#F7F1E5]/90 backdrop-blur-[5px]" />
        <div className="absolute inset-0 bg-gradient-to-b from-[#F7F1E5]/95 via-[#FFF9EE]/75 to-[#F7F1E5]/95" />
        <div className="absolute inset-0 bg-warm-glow opacity-60" />
      </div>

      {/* Header */}
      <header className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 pt-5 sm:pt-7 flex items-center justify-between">
        <AuthBranding showTagline={false} align="left" />

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-[#EFEBE3]/90 p-1 rounded-full border border-[#DAD4C7]/80 text-xs font-semibold shadow-2xs">
            <Link
              to="/login"
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                activeRoute === 'login'
                  ? 'bg-[#FFF9EE] text-[#252525] shadow-xs font-bold border border-[#DAD4C7]/60'
                  : 'text-[#6F6A60] hover:text-[#252525]'
              }`}
            >
              Sign In
            </Link>
            <Link
              to="/register"
              className={`px-3.5 py-1.5 rounded-full transition-all duration-200 ${
                activeRoute === 'register'
                  ? 'bg-[#FFF9EE] text-[#252525] shadow-xs font-bold border border-[#DAD4C7]/60'
                  : 'text-[#6F6A60] hover:text-[#252525]'
              }`}
            >
              Register
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-10">
        {children}
      </main>

      {/* Footer */}
      <footer className="relative z-20 w-full max-w-6xl mx-auto px-4 sm:px-8 pb-5 sm:pb-7 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-[#8C867B]">
        <div className="flex items-center gap-2">
          <span>© {new Date().getFullYear()} GlobeTrotter</span>
          <span>•</span>
          <span className="flex items-center gap-1 text-[#4E7360] font-medium">
            <ShieldCheck className="w-3.5 h-3.5" /> End-to-end encrypted
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs font-medium text-[#6F6A60]">
          <span className="hover:text-[#252525] transition-colors cursor-pointer">Privacy</span>
          <span>•</span>
          <span className="hover:text-[#252525] transition-colors cursor-pointer">Terms</span>
          <span>•</span>
          <span className="hover:text-[#252525] transition-colors cursor-pointer">Support</span>
        </div>
      </footer>
    </div>
  );
};
