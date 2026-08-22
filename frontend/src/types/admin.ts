export type AdminTabType = 'users' | 'cities' | 'activities' | 'analytics';

export type UserStatus = 'Active' | 'Inactive' | 'Pending';

export interface AdminUser {
  id: string;
  fullName: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  country: string;
  city?: string;
  avatarUrl?: string;
  tripsCount: number;
  status: UserStatus;
  role: 'Admin' | 'Traveler' | 'Guide';
  joinedDate: string;
  lastActive: string;
  totalSpend: number;
  recentTrips?: {
    id: string;
    name: string;
    destinations: string;
    startDate: string;
    status: string;
  }[];
}

export interface AdminCityAnalytics {
  id: string;
  rank: number;
  city: string;
  country: string;
  region: string;
  image: string;
  flag: string;
  tripsCount: number;
  usersCount: number;
  popularityScore: number;
  averageBudget: number;
  growthRate: string;
  topSeason: string;
  primaryAttraction: string;
}

export interface AdminActivityAnalytics {
  id: string;
  rank: number;
  name: string;
  city: string;
  country: string;
  category: 'Food' | 'Adventure' | 'Culture' | 'Nature' | 'Sightseeing' | 'Shopping';
  image: string;
  usersCount: number;
  tripsCount: number;
  popularityScore: number;
  averageRating: number;
  estimatedCost: string;
  trendingDirection: 'up' | 'stable' | 'down';
  avgDuration: string;
}

export interface AdminStatsSummary {
  totalUsers: number;
  usersGrowth: string;
  totalTrips: number;
  tripsGrowth: string;
  activeTrips: number;
  activeTripsGrowth: string;
  topDestination: string;
  topDestinationPercentage: string;
}

export interface AdminFilterState {
  searchQuery: string;
  groupBy: string;
  filterValue: string;
  sortBy: string;
  dateRange: '7d' | '30d' | '90d' | 'year' | 'all';
}

export interface MonthlyTrendData {
  month: string;
  users: number;
  trips: number;
  revenueEstimate: number;
}

export interface CategoryDistribution {
  category: string;
  percentage: number;
  count: number;
  color: string;
}

export interface AdminInsightItem {
  id: string;
  tab: AdminTabType;
  title: string;
  description: string;
  metricLabel?: string;
  metricValue?: string;
  badgeText?: string;
  badgeType?: 'sage' | 'gold' | 'terracotta' | 'neutral';
}
