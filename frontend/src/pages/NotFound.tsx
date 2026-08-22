import React from 'react';
import { Link } from 'react-router-dom';
import { Compass, ArrowLeft, Plus } from 'lucide-react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { Button } from '../components/ui/Button';

export const NotFound: React.FC = () => {
  return (
    <div className="min-h-screen bg-[#F7F1E5] text-[#252525] flex flex-col justify-between">
      <LandingNavbar />

      <main className="flex-1 max-w-lg w-full mx-auto px-4 flex items-center justify-center py-16">
        <div className="bg-[#FFF9EE] border border-[#DAD4C7] rounded-3xl p-8 sm:p-10 text-center space-y-5 shadow-sm w-full">
          <div className="w-16 h-16 rounded-3xl bg-[#F4C95D]/20 border border-[#F4C95D]/60 text-[#C29326] mx-auto flex items-center justify-center shadow-xs">
            <Compass className="w-8 h-8 animate-spin-slow" />
          </div>

          <div className="space-y-2">
            <span className="text-xs uppercase tracking-widest font-bold text-[#C29326]">
              404 • Destination Not Found
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#252525]">
              You've Wandered Off the Map
            </h1>
            <p className="text-xs sm:text-sm text-[#6F6A60] leading-relaxed">
              The page or destination you are looking for does not exist or may have been relocated.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row gap-3">
            <Link to="/" className="flex-1">
              <Button
                variant="outline"
                size="md"
                fullWidth
                leftIcon={<ArrowLeft className="w-4 h-4" />}
              >
                Back to Home
              </Button>
            </Link>
            <Link to="/trips/create" className="flex-1">
              <Button
                variant="primary"
                size="md"
                fullWidth
                leftIcon={<Plus className="w-4 h-4" />}
              >
                Plan a Trip
              </Button>
            </Link>
          </div>
        </div>
      </main>

      <footer className="border-t border-[#DAD4C7]/80 bg-[#FFF9EE]/80 backdrop-blur-md py-6 px-4 sm:px-8 text-center text-xs text-[#8C867B]">
        GlobeTrotter Personalized Travel Planning Platform • 404 Explorer
      </footer>
    </div>
  );
};
