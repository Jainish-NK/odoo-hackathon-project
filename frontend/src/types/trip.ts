export type ItinerarySectionType =
  | 'travel'
  | 'hotel'
  | 'activity'
  | 'food'
  | 'sightseeing'
  | 'other';

export interface TripDestinationOption {
  id: string;
  city: string;
  country: string;
  region: string;
  flag: string;
  image: string;
}

export interface SuggestedPlace {
  id: string;
  name: string;
  city: string;
  country: string;
  category: 'Sightseeing' | 'Heritage' | 'Nature' | 'Architecture' | 'Art';
  rating: number;
  image: string;
  estimatedTime: string;
}

export interface SuggestedActivity {
  id: string;
  name: string;
  city: string;
  country: string;
  type: 'Tour' | 'Adventure' | 'Culinary' | 'Cruise' | 'Cultural';
  duration: string;
  estimatedCost: string;
  rating: number;
  image: string;
}

export interface ItinerarySection {
  id: string;
  order: number;
  title: string;
  type: ItinerarySectionType;
  description: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  startTime?: string; // HH:mm
  endTime?: string;   // HH:mm
  location?: string;
  budget: number;     // in INR (₹)
  notes?: string;
}

export interface Trip {
  id: string;
  userId: string;
  name: string;
  startDate: string; // YYYY-MM-DD
  endDate: string;   // YYYY-MM-DD
  destinations: TripDestinationOption[];
  selectedPlaces?: SuggestedPlace[];
  selectedActivities?: SuggestedActivity[];
  sections: ItinerarySection[];
  totalBudget?: number;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTripFormData {
  tripName: string;
  startDate: string;
  endDate: string;
  destinations: TripDestinationOption[];
  selectedPlaceIds: string[];
  selectedActivityIds: string[];
  notes?: string;
}

export type TripStatus = 'ONGOING' | 'UPCOMING' | 'COMPLETED';

export type TripSortOption =
  | 'newest'
  | 'oldest'
  | 'date-asc'
  | 'date-desc'
  | 'name-asc'
  | 'name-desc';

export interface TripFilterState {
  searchQuery: string;
  status: 'ALL' | TripStatus;
  destinationCity: string;
  sortBy: TripSortOption;
}

export interface ActivityItem {
  id: string;
  name: string;
  city: string;
  country: string;
  category: string;
  rating: number;
  duration: string;
  durationHours: number; // For filtering: < 1, 1-3, 3-6, 6+
  estimatedCost: string;
  costNumeric: number;   // In INR (₹) or base units for sorting
  priceLevel: 'Free' | 'Budget' | 'Moderate' | 'Premium';
  image: string;
  description: string;
  highlights?: string[];
  isPlace?: boolean;
}

export type ActivityGroupByOption = 'none' | 'category' | 'city' | 'priceLevel';

export type ActivitySortOption =
  | 'rating-desc'
  | 'price-asc'
  | 'price-desc'
  | 'duration-asc'
  | 'duration-desc'
  | 'name-asc'
  | 'name-desc';

export interface ActivityFilterState {
  searchQuery: string;
  selectedCity: string;
  selectedCategory: string;
  selectedPriceLevel: string;
  selectedDuration: string; // 'all' | 'under1' | '1to3' | '3to6' | 'over6'
  minRating: number;
  groupBy: ActivityGroupByOption;
  sortBy: ActivitySortOption;
}


