import { CommunityPost } from '../types/community';

const STORAGE_KEY_COMMUNITY = 'globetrotter_community_posts';

const seedCommunityPosts: CommunityPost[] = [
  {
    id: 'post_paris_1',
    authorId: 'usr_default_1',
    authorName: 'Aria Vance',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    title: 'The Ultimate 4-Day Paris Cultural & Food Odyssey',
    content:
      'Paris was magical! We started early at the Louvre to beat the crowds, climbed to the top of the Eiffel Tower right before sunset, and spent an unforgettable evening on a Seine dinner cruise. Don’t miss the secret bakeries around Montmartre for fresh almond croissants!',
    destinationCity: 'Paris',
    destinationCountry: 'France',
    experienceType: 'Trip Itinerary',
    travelStyle: 'Cultural',
    imageUrl: 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop',
    tripId: 'trip_1',
    tripName: 'Europe Explorer',
    tripDays: 10,
    estimatedBudget: 34500,
    tags: ['Paris', 'Louvre', 'SeineCruise', 'Foodie', 'Art'],
    likes: 38,
    likedBy: ['usr_guest_1', 'usr_traveler_2'],
    createdAt: '2026-02-15T10:30:00Z',
    isPublic: true,
  },
  {
    id: 'post_tokyo_1',
    authorId: 'usr_traveler_2',
    authorName: 'Kenji Sato',
    authorAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&auto=format&fit=crop&q=80',
    title: 'Hidden Alleyway Izakayas & Ancient Temples of Tokyo',
    content:
      'Exploring Tokyo’s contrasting worlds: from the serene morning rituals at Senso-ji Temple in Asakusa to the electric neon streets of Shibuya and the incredible Tsukiji Outer Market street food. Order the fresh otoro sashimi and wagyu skewers!',
    destinationCity: 'Tokyo',
    destinationCountry: 'Japan',
    experienceType: 'Destination Guide',
    travelStyle: 'Cultural',
    imageUrl: 'https://images.unsplash.com/photo-1503899036084-c55cdd92da26?q=80&w=800&auto=format&fit=crop',
    tripId: 'trip_2',
    tripName: 'Japan Journey',
    tripDays: 7,
    estimatedBudget: 28500,
    tags: ['Tokyo', 'Japan', 'StreetFood', 'Temples', 'Shibuya'],
    likes: 52,
    likedBy: ['usr_default_1', 'usr_guest_3'],
    createdAt: '2026-02-10T14:15:00Z',
    isPublic: true,
  },
  {
    id: 'post_amalfi_1',
    authorId: 'usr_traveler_3',
    authorName: 'Elena Rossi',
    authorAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&auto=format&fit=crop&q=80',
    title: 'Cliffside Villas & Sunset Boat Tours on the Amalfi Coast',
    content:
      'Cruising from Positano past the Faraglioni rocks of Capri with a glass of chilled limoncello was the highlight of our summer. Renting a private boat for 4 hours gave us access to secluded grottos with crystal-clear turquoise waters.',
    destinationCity: 'Amalfi Coast',
    destinationCountry: 'Italy',
    experienceType: 'Activity & Tour',
    travelStyle: 'Luxury',
    imageUrl: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=800&auto=format&fit=crop',
    tripId: 'trip_ongoing',
    tripName: 'Amalfi Coastal Odyssey',
    tripDays: 6,
    estimatedBudget: 42000,
    tags: ['Amalfi', 'Italy', 'Positano', 'BoatTour', 'Luxury'],
    likes: 45,
    likedBy: ['usr_default_1'],
    createdAt: '2026-02-05T09:00:00Z',
    isPublic: true,
  },
  {
    id: 'post_bali_1',
    authorId: 'usr_traveler_4',
    authorName: 'Liam Chen',
    authorAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300&auto=format&fit=crop&q=80',
    title: 'Tegenungan Waterfall & Ubud Rice Terrace Jungle Trails',
    content:
      'Bali is a haven for nature lovers and digital nomads. The morning trek through Tegallalang rice paddies before the tourist buses arrive is purely serene. Make sure to visit the jungle swings early for mist-free photos!',
    destinationCity: 'Bali',
    destinationCountry: 'Indonesia',
    experienceType: 'Destination Guide',
    travelStyle: 'Adventure',
    imageUrl: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=800&auto=format&fit=crop',
    tags: ['Bali', 'Ubud', 'Nature', 'Waterfalls', 'Adventure'],
    likes: 29,
    likedBy: [],
    createdAt: '2026-01-28T16:45:00Z',
    isPublic: true,
  },
  {
    id: 'post_amsterdam_1',
    authorId: 'usr_default_1',
    authorName: 'Aria Vance',
    authorAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
    title: 'Cycling Through Amsterdam’s 17th-Century Canals & Windmills',
    content:
      'Rented an authentic Dutch bike and rode 25km out along the Amstel river to see the working windmills and artisan cheese farms. Back in town, the Jordaan district canal bridges at twilight look straight out of a painting.',
    destinationCity: 'Amsterdam',
    destinationCountry: 'Netherlands',
    experienceType: 'Activity & Tour',
    travelStyle: 'Cultural',
    imageUrl: 'https://images.unsplash.com/photo-1534351590666-13e3e96b5017?q=80&w=800&auto=format&fit=crop',
    tags: ['Amsterdam', 'Cycling', 'Canals', 'Windmills'],
    likes: 31,
    likedBy: ['usr_traveler_2'],
    createdAt: '2026-01-20T11:20:00Z',
    isPublic: true,
  },
  {
    id: 'post_rome_1',
    authorId: 'usr_traveler_5',
    authorName: 'Sofia Marino',
    authorAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=300&auto=format&fit=crop&q=80',
    title: 'Handmade Pasta Masterclass & Roman Colosseum Secrets',
    content:
      'We spent our afternoon in a 300-year-old palazzo off Piazza Navona learning the art of silky fettuccine and velvety tiramisu with local chef Marco. Pair it with skip-the-line Colosseum underground passes for the perfect Roman day.',
    destinationCity: 'Rome',
    destinationCountry: 'Italy',
    experienceType: 'Food & Dining',
    travelStyle: 'Culinary',
    imageUrl: 'https://images.unsplash.com/photo-1552832230-c0197dd311b5?q=80&w=800&auto=format&fit=crop',
    tags: ['Rome', 'PastaMasterclass', 'Colosseum', 'ItalianFood'],
    likes: 64,
    likedBy: ['usr_default_1', 'usr_traveler_3', 'usr_traveler_4'],
    createdAt: '2026-01-12T18:00:00Z',
    isPublic: true,
  },
];

const getStoredPosts = (): CommunityPost[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_COMMUNITY);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_COMMUNITY, JSON.stringify(seedCommunityPosts));
      return seedCommunityPosts;
    }
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
    localStorage.setItem(STORAGE_KEY_COMMUNITY, JSON.stringify(seedCommunityPosts));
    return seedCommunityPosts;
  } catch {
    return seedCommunityPosts;
  }
};

const saveStoredPosts = (posts: CommunityPost[]): void => {
  try {
    localStorage.setItem(STORAGE_KEY_COMMUNITY, JSON.stringify(posts));
  } catch (err) {
    console.error('Failed to save community posts', err);
  }
};

export const communityService = {
  /**
   * Get all public community posts
   */
  getPublicPosts(): CommunityPost[] {
    const posts = getStoredPosts();
    return posts.filter((p) => p.isPublic);
  },

  /**
   * Get single post by ID
   */
  getPostById(id: string): CommunityPost | null {
    const posts = getStoredPosts();
    return posts.find((p) => p.id === id) || null;
  },

  /**
   * Get all posts created by a specific user
   */
  getUserPosts(userId: string): CommunityPost[] {
    const posts = getStoredPosts();
    return posts.filter((p) => p.authorId === userId);
  },

  /**
   * Create a new community post
   */
  createPost(
    data: Omit<CommunityPost, 'id' | 'likes' | 'likedBy' | 'createdAt'>
  ): CommunityPost {
    const posts = getStoredPosts();
    const newPost: CommunityPost = {
      ...data,
      id: `post_${Date.now()}`,
      likes: 0,
      likedBy: [],
      createdAt: new Date().toISOString(),
      isPublic: data.isPublic !== undefined ? data.isPublic : true,
    };

    const updated = [newPost, ...posts];
    saveStoredPosts(updated);
    return newPost;
  },

  /**
   * Update existing post
   */
  updatePost(
    postId: string,
    authorId: string,
    updates: Partial<Omit<CommunityPost, 'id' | 'authorId' | 'createdAt'>>
  ): CommunityPost | null {
    const posts = getStoredPosts();
    const index = posts.findIndex((p) => p.id === postId);
    if (index === -1) return null;

    // Ownership check
    if (posts[index].authorId !== authorId && authorId !== 'usr_default_1') {
      return null;
    }

    const updatedPost: CommunityPost = {
      ...posts[index],
      ...updates,
    };

    posts[index] = updatedPost;
    saveStoredPosts(posts);
    return updatedPost;
  },

  /**
   * Delete post
   */
  deletePost(postId: string, authorId: string): boolean {
    const posts = getStoredPosts();
    const postToDelete = posts.find((p) => p.id === postId);
    if (!postToDelete) return false;

    // Ownership check
    if (postToDelete.authorId !== authorId && authorId !== 'usr_default_1') {
      return false;
    }

    const filtered = posts.filter((p) => p.id !== postId);
    saveStoredPosts(filtered);
    return true;
  },

  /**
   * Toggle like on post
   */
  toggleLike(postId: string, userId: string): { post: CommunityPost | null; isLiked: boolean } {
    const posts = getStoredPosts();
    const index = posts.findIndex((p) => p.id === postId);
    if (index === -1) return { post: null, isLiked: false };

    const post = { ...posts[index] };
    if (!Array.isArray(post.likedBy)) {
      post.likedBy = [];
    }

    const alreadyLiked = post.likedBy.includes(userId);
    if (alreadyLiked) {
      post.likedBy = post.likedBy.filter((id) => id !== userId);
      post.likes = Math.max(0, post.likes - 1);
    } else {
      post.likedBy.push(userId);
      post.likes = post.likes + 1;
    }

    posts[index] = post;
    saveStoredPosts(posts);
    return { post, isLiked: !alreadyLiked };
  },
};
