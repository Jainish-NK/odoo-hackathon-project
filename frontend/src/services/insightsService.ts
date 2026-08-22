import { Trip, TripDestinationOption } from '../types/trip';
import { User } from '../types/auth';
import { getTripStatus, calculateTripDurationDays } from './tripService';
import { availableDestinationOptions } from '../data/tripSuggestions';

export interface TravelSnapshotData {
  totalTrips: number;
  upcomingTrips: number;
  ongoingTrips: number;
  completedTrips: number;
  citiesVisited: number;
  activitiesPlanned: number;
  totalEstimatedSpend: number;
  avgTripDurationDays: number;
  avgSpendPerDay: number;
  avgSpendPerTrip: number;
}

export interface TravelStyleScore {
  style: string;
  percentage: number;
  color: string;
}

export interface CategorySpendBreakdown {
  key: string;
  label: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface TripHealthItem {
  trip: Trip;
  durationDays: number;
  citiesCount: number;
  activitiesCount: number;
  totalBudget: number;
  avgDailyCost: number;
  completenessPercentage: number;
  balanceNotes: string[];
}

export interface SmartRecommendationItem {
  destination: TripDestinationOption;
  reason: string;
  matchedStyles: string[];
}

export interface TravelMilestone {
  id: string;
  title: string;
  description: string;
  isAchieved: boolean;
  progressText: string;
  iconName: string;
}

export const insightsService = {
  /**
   * Filter trips based on time range
   */
  filterTripsByTimeRange(trips: Trip[], timeRange: 'all' | '90d' | 'year'): Trip[] {
    if (timeRange === 'all') return trips;
    const now = new Date().getTime();
    const daysLimit = timeRange === '90d' ? 90 : 365;
    const limitTimestamp = now - daysLimit * 24 * 60 * 60 * 1000;

    return trips.filter((t) => {
      const tripTime = new Date(t.startDate).getTime();
      return isNaN(tripTime) || tripTime >= limitTimestamp;
    });
  },

  /**
   * Calculate personal travel snapshot
   */
  getTravelSnapshot(trips: Trip[]): TravelSnapshotData {
    let upcoming = 0;
    let ongoing = 0;
    let completed = 0;
    let totalSections = 0;
    let totalSpend = 0;
    let totalDurationDays = 0;

    const uniqueCities = new Set<string>();

    trips.forEach((t) => {
      const status = getTripStatus(t.startDate, t.endDate);
      if (status === 'UPCOMING') upcoming++;
      else if (status === 'ONGOING') ongoing++;
      else completed++;

      const dur = calculateTripDurationDays(t.startDate, t.endDate);
      totalDurationDays += dur;

      t.destinations?.forEach((d) => {
        if (d.city) uniqueCities.add(d.city.trim().toLowerCase());
      });

      t.sections?.forEach((sec) => {
        totalSections++;
        totalSpend += Number(sec.budget) || 0;
      });
    });

    const avgDuration = trips.length > 0 ? Math.round(totalDurationDays / trips.length) : 0;
    const avgSpendTrip = trips.length > 0 ? Math.round(totalSpend / trips.length) : 0;
    const avgSpendDay = totalDurationDays > 0 ? Math.round(totalSpend / totalDurationDays) : 0;

    return {
      totalTrips: trips.length,
      upcomingTrips: upcoming,
      ongoingTrips: ongoing,
      completedTrips: completed,
      citiesVisited: uniqueCities.size,
      activitiesPlanned: totalSections,
      totalEstimatedSpend: totalSpend,
      avgTripDurationDays: avgDuration,
      avgSpendPerDay: avgSpendDay,
      avgSpendPerTrip: avgSpendTrip,
    };
  },

  /**
   * Calculate travel styles & preferences from user profile + actual activities
   */
  getTravelStyleInsights(user: User, trips: Trip[]): { styles: TravelStyleScore[]; insightNote: string } {
    const counts: { [style: string]: number } = {
      Cultural: 0,
      Culinary: 0,
      Nature: 0,
      Adventure: 0,
      Relaxation: 0,
    };

    // 1. Incorporate explicit user travel styles
    user.travelStyles?.forEach((s) => {
      if (counts[s] !== undefined) counts[s] += 3;
      else counts[s] = 3;
    });

    // 2. Incorporate actual activity categories
    trips.forEach((t) => {
      t.sections?.forEach((sec) => {
        if (sec.type === 'sightseeing') counts['Cultural'] += 2;
        else if (sec.type === 'food') counts['Culinary'] += 2;
        else if (sec.type === 'activity') counts['Adventure'] += 2;
        else if (sec.type === 'hotel') counts['Relaxation'] += 1;
        else if (sec.type === 'travel') counts['Nature'] += 1;
      });
    });

    const totalWeight = Object.values(counts).reduce((a, b) => a + b, 0) || 1;

    const colorPalette = {
      Cultural: 'bg-[#F4C95D]',
      Culinary: 'bg-[#D96B43]',
      Nature: 'bg-[#4E7360]',
      Adventure: 'bg-[#E3B443]',
      Relaxation: 'bg-[#8C867B]',
    };

    const styles: TravelStyleScore[] = Object.entries(counts)
      .map(([style, count]) => ({
        style,
        percentage: Math.round((count / totalWeight) * 100),
        color: colorPalette[style as keyof typeof colorPalette] || 'bg-[#F4C95D]',
      }))
      .filter((item) => item.percentage > 0)
      .sort((a, b) => b.percentage - a.percentage);

    // Dynamic insight note
    let insightNote = 'Plan more activities to refine your personalized travel profile.';
    if (styles.length >= 2) {
      insightNote = `You frequently combine ${styles[0].style} exploration with ${styles[1].style.toLowerCase()} experiences across your journeys.`;
    } else if (styles.length === 1) {
      insightNote = `Your travels predominantly focus on ${styles[0].style} destinations and itineraries.`;
    }

    return { styles, insightNote };
  },

  /**
   * Calculate spending breakdown across categories (same logic as Screen 9)
   */
  getSpendingBreakdown(trips: Trip[]): { breakdown: CategorySpendBreakdown[]; budgetInsight: string } {
    let transport = 0;
    let stay = 0;
    let activities = 0;
    let food = 0;
    let other = 0;

    trips.forEach((t) => {
      t.sections?.forEach((sec) => {
        const b = Number(sec.budget) || 0;
        switch (sec.type) {
          case 'travel':
            transport += b;
            break;
          case 'hotel':
            stay += b;
            break;
          case 'sightseeing':
          case 'activity':
            activities += b;
            break;
          case 'food':
            food += b;
            break;
          default:
            other += b;
            break;
        }
      });
    });

    const total = transport + stay + activities + food + other || 1;

    const breakdown: CategorySpendBreakdown[] = [
      {
        key: 'hotel',
        label: 'Hotel & Stays',
        amount: stay,
        percentage: Math.round((stay / total) * 100),
        color: 'bg-[#4E7360]',
      },
      {
        key: 'activity',
        label: 'Activities & Sights',
        amount: activities,
        percentage: Math.round((activities / total) * 100),
        color: 'bg-[#F4C95D]',
      },
      {
        key: 'travel',
        label: 'Transport & Travel',
        amount: transport,
        percentage: Math.round((transport / total) * 100),
        color: 'bg-[#E3B443]',
      },
      {
        key: 'food',
        label: 'Food & Dining',
        amount: food,
        percentage: Math.round((food / total) * 100),
        color: 'bg-[#D96B43]',
      },
      {
        key: 'other',
        label: 'Other Incidentals',
        amount: other,
        percentage: Math.round((other / total) * 100),
        color: 'bg-[#8C867B]',
      },
    ].sort((a, b) => b.amount - a.amount);

    let budgetInsight = 'Add budget estimates to your itinerary sections to unlock spending insights.';
    if (total > 1) {
      const topCategory = breakdown[0];
      budgetInsight = `${topCategory.label} is your largest planned expenditure, accounting for ${topCategory.percentage}% of your estimated travel budget.`;
    }

    return { breakdown, budgetInsight };
  },

  /**
   * Calculate health and completeness metrics for upcoming trips
   */
  getUpcomingTripsHealth(trips: Trip[]): TripHealthItem[] {
    const upcoming = trips.filter((t) => {
      const s = getTripStatus(t.startDate, t.endDate);
      return s === 'UPCOMING' || s === 'ONGOING';
    });

    return upcoming.map((trip) => {
      const durationDays = calculateTripDurationDays(trip.startDate, trip.endDate);
      const citiesCount = trip.destinations?.length || 0;
      const activitiesCount = trip.sections?.length || 0;
      const totalBudget = trip.sections?.reduce((sum, s) => sum + (Number(s.budget) || 0), 0) || trip.totalBudget || 0;
      const avgDailyCost = durationDays > 0 ? Math.round(totalBudget / durationDays) : 0;

      // Completeness score
      let score = 0;
      if (trip.name) score += 15;
      if (trip.startDate && trip.endDate) score += 25;
      if (citiesCount > 0) score += 20;
      if (activitiesCount >= 1) score += 20;
      if (activitiesCount >= 4) score += 10;
      if (totalBudget > 0) score += 10;
      const completenessPercentage = Math.min(100, score);

      // Overload / Balance detection
      const balanceNotes: string[] = [];
      if (activitiesCount === 0) {
        balanceNotes.push('No activities scheduled yet. Browse suggestions to populate your itinerary.');
      } else {
        // Check date density
        const dateMap: { [d: string]: number } = {};
        trip.sections?.forEach((sec) => {
          if (sec.startDate) {
            dateMap[sec.startDate] = (dateMap[sec.startDate] || 0) + 1;
          }
        });

        const busyDates = Object.entries(dateMap).filter(([_, count]) => count >= 4);
        if (busyDates.length > 0) {
          balanceNotes.push(`High density: ${busyDates.length} day(s) have 4+ scheduled activities.`);
        } else {
          balanceNotes.push('Pacing is balanced with comfortable exploration windows.');
        }
      }

      return {
        trip,
        durationDays,
        citiesCount,
        activitiesCount,
        totalBudget,
        avgDailyCost,
        completenessPercentage,
        balanceNotes,
      };
    });
  },

  /**
   * Generate personalized smart recommendations using actual destination data
   */
  getSmartRecommendations(user: User, trips: Trip[]): SmartRecommendationItem[] {
    const visitedCityNames = new Set<string>();
    trips.forEach((t) => {
      t.destinations?.forEach((d) => {
        if (d.city) visitedCityNames.add(d.city.toLowerCase());
      });
    });

    const userStyles = user.travelStyles || ['Cultural', 'Culinary', 'Nature'];
    const savedIds = user.savedDestinationIds || [];

    const candidates = availableDestinationOptions.filter(
      (d) => !visitedCityNames.has(d.city.toLowerCase())
    );

    return candidates.slice(0, 4).map((dest) => {
      const isSaved = savedIds.includes(dest.id);
      let reason = `Matches your travel style in ${dest.region}.`;
      if (isSaved) {
        reason = `From your saved wishlist in ${dest.country}.`;
      } else if (dest.region === 'Europe') {
        reason = `Popular for cultural architecture and culinary walks in Europe.`;
      } else if (dest.region === 'Asia') {
        reason = `Ideal for scenic discovery and authentic regional dining.`;
      }

      return {
        destination: dest,
        reason,
        matchedStyles: userStyles.slice(0, 2),
      };
    });
  },

  /**
   * Calculate milestone achievements based on real data
   */
  getTravelMilestones(trips: Trip[]): TravelMilestone[] {
    const uniqueCities = new Set<string>();
    let totalSections = 0;
    let hasMultiCity = false;
    let hasLongTrip = false;

    trips.forEach((t) => {
      if (t.destinations && t.destinations.length > 1) hasMultiCity = true;
      const dur = calculateTripDurationDays(t.startDate, t.endDate);
      if (dur >= 7) hasLongTrip = true;

      t.destinations?.forEach((d) => {
        if (d.city) uniqueCities.add(d.city.toLowerCase());
      });

      totalSections += t.sections ? t.sections.length : 0;
    });

    return [
      {
        id: 'm1',
        title: 'First Expedition',
        description: 'Create your first personalized travel itinerary.',
        isAchieved: trips.length >= 1,
        progressText: trips.length >= 1 ? 'Achieved' : '0 / 1 Trips',
        iconName: 'Compass',
      },
      {
        id: 'm2',
        title: 'City Explorer',
        description: 'Explore 3 or more distinct destination cities.',
        isAchieved: uniqueCities.size >= 3,
        progressText: `${uniqueCities.size} / 3 Cities`,
        iconName: 'MapPin',
      },
      {
        id: 'm3',
        title: 'Multi-City Pathfinder',
        description: 'Plan a multi-destination journey across regions.',
        isAchieved: hasMultiCity,
        progressText: hasMultiCity ? 'Achieved' : 'Pending',
        iconName: 'Plane',
      },
      {
        id: 'm4',
        title: 'Detailed Planner',
        description: 'Schedule 10 or more activities in your itineraries.',
        isAchieved: totalSections >= 10,
        progressText: `${totalSections} / 10 Activities`,
        iconName: 'Sparkles',
      },
      {
        id: 'm5',
        title: 'Grand Voyager',
        description: 'Plan a journey lasting 7 or more days.',
        isAchieved: hasLongTrip,
        progressText: hasLongTrip ? 'Achieved' : 'Pending',
        iconName: 'Calendar',
      },
    ];
  },

  /**
   * Determine travel patterns
   */
  getTravelPatterns(trips: Trip[]): {
    mostVisitedRegion: string;
    mostActiveTrip: Trip | null;
    highestBudgetTrip: Trip | null;
  } {
    if (trips.length === 0) {
      return {
        mostVisitedRegion: 'Global',
        mostActiveTrip: null,
        highestBudgetTrip: null,
      };
    }

    // Most visited region
    const regionMap: { [r: string]: number } = {};
    trips.forEach((t) => {
      t.destinations?.forEach((d) => {
        if (d.region) regionMap[d.region] = (regionMap[d.region] || 0) + 1;
      });
    });

    let topRegion = 'Europe';
    let maxCount = 0;
    Object.entries(regionMap).forEach(([r, count]) => {
      if (count > maxCount) {
        maxCount = count;
        topRegion = r;
      }
    });

    // Most active trip
    let topActiveTrip: Trip | null = null;
    let maxSections = 0;
    trips.forEach((t) => {
      const count = t.sections?.length || 0;
      if (count > maxSections) {
        maxSections = count;
        topActiveTrip = t;
      }
    });

    // Highest budget trip
    let topBudgetTrip: Trip | null = null;
    let maxBudget = 0;
    trips.forEach((t) => {
      const spend = t.sections?.reduce((sum, s) => sum + (Number(s.budget) || 0), 0) || t.totalBudget || 0;
      if (spend > maxBudget) {
        maxBudget = spend;
        topBudgetTrip = t;
      }
    });

    return {
      mostVisitedRegion: topRegion,
      mostActiveTrip: topActiveTrip || trips[0],
      highestBudgetTrip: topBudgetTrip || trips[0],
    };
  },
};
