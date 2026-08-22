export type ExperienceType =
  | 'Trip Itinerary'
  | 'Destination Guide'
  | 'Activity & Tour'
  | 'Food & Dining'
  | 'Hotel & Stay'
  | 'Travel Tip';

export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  title: string;
  content: string;
  destinationCity: string;
  destinationCountry: string;
  experienceType: ExperienceType;
  travelStyle?: string;
  imageUrl?: string;
  tripId?: string; // If linked to a public trip that can be copied
  tripName?: string;
  tripDays?: number;
  estimatedBudget?: number;
  tags: string[];
  likes: number;
  likedBy: string[]; // User IDs who liked this post
  createdAt: string; // ISO date string
  isPublic: boolean;
}

export type CommunitySortOption =
  | 'newest'
  | 'oldest'
  | 'most-liked'
  | 'title-asc';

export type CommunityGroupByOption =
  | 'none'
  | 'destination'
  | 'experienceType'
  | 'travelStyle';

export interface CommunityFilterState {
  searchQuery: string;
  selectedDestination: string;
  selectedExperienceType: string;
  selectedTravelStyle: string;
  groupBy: CommunityGroupByOption;
  sortBy: CommunitySortOption;
}
