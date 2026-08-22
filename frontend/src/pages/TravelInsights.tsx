import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Compass,
  Plus,
} from 'lucide-react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { TripInsightSelector } from '../components/insights/TripInsightSelector';
import { TravelSnapshot } from '../components/insights/TravelSnapshot';
import { TravelStyleCard } from '../components/insights/TravelStyleCard';
import { SpendingBreakdown } from '../components/insights/SpendingBreakdown';
import { UpcomingTripHealth } from '../components/insights/UpcomingTripHealth';
import { SmartRecommendations } from '../components/insights/SmartRecommendations';
import { TravelMilestones } from '../components/insights/TravelMilestones';
import { TravelPatternCard } from '../components/insights/TravelPatternCard';
import { Footer } from '../components/ui/Footer';
import { Button } from '../components/ui/Button';
import { insightsService } from '../services/insightsService';
import { tripService } from '../services/tripService';
import { authService } from '../services/authService';
import { Trip } from '../types/trip';
import { User } from '../types/auth';

export const TravelInsights: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [allUserTrips, setAllUserTrips] = useState<Trip[]>([]);
  const [selectedTripId, setSelectedTripId] = useState<string>('all');
  const [timeRange, setTimeRange] = useState<'all' | '90d' | 'year'>('all');

  useEffect(() => {
    const user = authService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      const loadedTrips = tripService.getUserTrips(user.id);
      setAllUserTrips(loadedTrips);
    }
  }, []);

  // Filtered trips by time range and selection
  const scopedTrips = useMemo(() => {
    let trips = insightsService.filterTripsByTimeRange(allUserTrips, timeRange);
    if (selectedTripId !== 'all') {
      trips = trips.filter((t) => t.id === selectedTripId);
    }
    return trips;
  }, [allUserTrips, selectedTripId, timeRange]);

  // Insights computations
  const snapshotData = useMemo(() => {
    return insightsService.getTravelSnapshot(scopedTrips);
  }, [scopedTrips]);

  const { styles: travelStyles, insightNote: styleInsightNote } = useMemo(() => {
    if (!currentUser) return { styles: [], insightNote: '' };
    return insightsService.getTravelStyleInsights(currentUser, scopedTrips);
  }, [currentUser, scopedTrips]);

  const { breakdown: spendingBreakdown, budgetInsight } = useMemo(() => {
    return insightsService.getSpendingBreakdown(scopedTrips);
  }, [scopedTrips]);

  const upcomingHealth = useMemo(() => {
    return insightsService.getUpcomingTripsHealth(scopedTrips);
  }, [scopedTrips]);

  const smartRecommendations = useMemo(() => {
    if (!currentUser) return [];
    return insightsService.getSmartRecommendations(currentUser, allUserTrips);
  }, [currentUser, allUserTrips]);

  const travelMilestones = useMemo(() => {
    return insightsService.getTravelMilestones(allUserTrips);
  }, [allUserTrips]);

  const { mostVisitedRegion, mostActiveTrip, highestBudgetTrip } = useMemo(() => {
    return insightsService.getTravelPatterns(allUserTrips);
  }, [allUserTrips]);

  return (
    <div className="min-h-screen bg-[#F7F1E5] text-[#252525] flex flex-col justify-between selection:bg-[#F4C95D]/40">
      {/* 1. Global Navigation */}
      <LandingNavbar />

      {/* 2. Main Content Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
        {/* Header */}
        <div className="bg-[#FFF9EE] border border-[#DAD4C7]/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EFEA] border border-[#C2D7CC] text-xs font-bold text-[#4E7360]">
                <Sparkles className="w-3.5 h-3.5" /> Personalized Travel Intelligence
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#252525] tracking-tight">
                Travel Insights & Recommendations
              </h1>
              <p className="text-xs sm:text-sm text-[#6F6A60] max-w-2xl leading-relaxed">
                Understand your travel habits, spending allocations, and itinerary health based on your real GlobeTrotter journey activity.
              </p>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto shrink-0">
              <Link to="/cities">
                <Button variant="outline" size="md" className="text-xs font-bold">
                  Explore Destinations
                </Button>
              </Link>
              <Link to="/trips/create">
                <Button
                  variant="primary"
                  size="md"
                  leftIcon={<Plus className="w-4 h-4" />}
                  className="text-xs font-bold shadow-xs"
                >
                  Plan New Trip
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {allUserTrips.length === 0 ? (
          /* Empty State */
          <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-10 sm:p-14 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#FCFAF5] border border-[#DAD4C7] flex items-center justify-center mx-auto text-[#4E7360]">
              <Compass className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-[#252525]">
                Your travel story starts here
              </h3>
              <p className="text-xs text-[#6F6A60] max-w-sm mx-auto">
                Plan your first trip and GlobeTrotter will turn your travel activity into meaningful insights and personalized recommendations.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Link to="/trips/create">
                <Button variant="primary" size="md" className="text-xs font-bold">
                  Plan Your First Trip
                </Button>
              </Link>
              <Link to="/cities">
                <Button variant="outline" size="md" className="text-xs font-bold">
                  Explore Destinations
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <>
            {/* Context Controls */}
            <TripInsightSelector
              trips={allUserTrips}
              selectedTripId={selectedTripId}
              onSelectTrip={setSelectedTripId}
              timeRange={timeRange}
              onSelectTimeRange={setTimeRange}
            />

            {/* Travel Snapshot */}
            <TravelSnapshot snapshot={snapshotData} />

            {/* Two-Column Analytics: Travel Style & Budget Allocation */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <TravelStyleCard
                styles={travelStyles}
                insightNote={styleInsightNote}
              />
              <SpendingBreakdown
                breakdown={spendingBreakdown}
                budgetInsight={budgetInsight}
                totalSpend={snapshotData.totalEstimatedSpend}
              />
            </div>

            {/* Upcoming Trip Health & Completeness */}
            <UpcomingTripHealth healthItems={upcomingHealth} />

            {/* Smart Recommendations */}
            <SmartRecommendations recommendations={smartRecommendations} />

            {/* Travel Patterns */}
            <TravelPatternCard
              mostVisitedRegion={mostVisitedRegion}
              mostActiveTrip={mostActiveTrip}
              highestBudgetTrip={highestBudgetTrip}
            />

            {/* Travel Milestones & Achievements */}
            <TravelMilestones milestones={travelMilestones} />
          </>
        )}
      </main>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
};
