export type RegionType = 'Europe' | 'Asia' | 'Middle East' | 'Americas' | 'Africa' | 'Oceania';

export type TravelStyle = 'Cultural' | 'Adventure' | 'Luxury' | 'Relaxation' | 'Culinary' | 'Nature';

export type PriceLevel = 'Budget' | 'Moderate' | 'Luxury';

export interface Destination {
  id: string;
  city: string;
  country: string;
  region: RegionType;
  image: string;
  rating: number;
  reviewCount: number;
  tags: string[];
  travelStyle: TravelStyle;
  priceLevel: PriceLevel;
  highlight: string;
}

export interface PreviousTrip {
  id: string;
  title: string;
  destinationSummary: string;
  startDate: string;
  endDate: string;
  destinationsCount: number;
  image: string;
  status: 'Completed' | 'Upcoming' | 'Draft';
  durationDays: number;
  budget?: string;
}

export type GroupByOption = 'none' | 'region' | 'travelStyle' | 'priceLevel';

export type SortByOption = 'popular' | 'rating' | 'nameAsc' | 'nameDesc';

export type CityGroupByOption = 'none' | 'country' | 'region' | 'travelStyle' | 'priceLevel';

export type CitySortOption =
  | 'popular-desc'
  | 'popular-asc'
  | 'rating-desc'
  | 'cost-asc'
  | 'cost-desc'
  | 'name-asc'
  | 'name-desc';

export interface CityFilterState {
  searchQuery: string;
  selectedRegion: string;
  selectedCountry: string;
  selectedTravelStyle: string;
  selectedPriceLevel: string;
  minRating: number;
  groupBy: CityGroupByOption;
  sortBy: CitySortOption;
}

export interface FilterState {
  searchQuery: string;
  selectedRegion: string;
  selectedTravelStyle: string;
  selectedPriceLevel: string;
  groupBy: GroupByOption;
  sortBy: SortByOption;
}

