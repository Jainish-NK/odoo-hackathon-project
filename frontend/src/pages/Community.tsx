import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users,
  Plus,
  ArrowUpDown,
  RotateCcw,
  Globe,
  MapPin,
  Tag,
  Search,
} from 'lucide-react';
import { LandingNavbar } from '../components/landing/LandingNavbar';
import { CommunityPostCard } from '../components/community/CommunityPostCard';
import { CreatePostModal } from '../components/community/CreatePostModal';
import { CommunityPostDetailsModal } from '../components/community/CommunityPostDetailsModal';
import { Footer } from '../components/ui/Footer';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { communityService } from '../services/communityService';
import { tripService } from '../services/tripService';
import { authService } from '../services/authService';
import { CommunityPost, CommunityFilterState, CommunityGroupByOption, CommunitySortOption } from '../types/community';
import { Trip } from '../types/trip';
import { useToast } from '../context/ToastContext';

const sortOptions: { value: CommunitySortOption; label: string }[] = [
  { value: 'newest', label: 'Newest First' },
  { value: 'most-liked', label: 'Most Liked' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'title-asc', label: 'Title (A-Z)' },
];

const groupByOptions: { value: CommunityGroupByOption; label: string }[] = [
  { value: 'none', label: 'No Grouping' },
  { value: 'destination', label: 'Destination' },
  { value: 'experienceType', label: 'Experience Type' },
  { value: 'travelStyle', label: 'Travel Style' },
];

export const Community: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [currentUser, setCurrentUser] = useState(authService.getCurrentUser());
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [userTrips, setUserTrips] = useState<Trip[]>([]);

  // Filters State
  const [filters, setFilters] = useState<CommunityFilterState>({
    searchQuery: '',
    selectedDestination: 'all',
    selectedExperienceType: 'all',
    selectedTravelStyle: 'all',
    groupBy: 'none',
    sortBy: 'newest',
  });

  // Modal States
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<CommunityPost | null>(null);
  const [selectedPostDetails, setSelectedPostDetails] = useState<CommunityPost | null>(null);
  const [deletingPost, setDeletingPost] = useState<CommunityPost | null>(null);

  // Load posts & trips on mount
  useEffect(() => {
    const user = authService.getCurrentUser();
    setCurrentUser(user);
    const loadedPosts = communityService.getPublicPosts();
    setPosts(loadedPosts);

    if (user) {
      const trips = tripService.getUserTrips(user.id);
      setUserTrips(trips);
    }
  }, []);

  // Dynamically calculated stats
  const stats = useMemo(() => {
    const uniqueAuthors = new Set(posts.map((p) => p.authorName)).size;
    const uniqueDestinations = new Set(posts.map((p) => p.destinationCity)).size;
    const totalLikes = posts.reduce((sum, p) => sum + (p.likes || 0), 0);

    return {
      authors: uniqueAuthors || 1,
      postsCount: posts.length,
      destinations: uniqueDestinations || 1,
      likes: totalLikes,
    };
  }, [posts]);

  // Unique lists for filter dropdowns
  const availableDestinations = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.destinationCity) set.add(p.destinationCity);
    });
    return ['all', ...Array.from(set).sort()];
  }, [posts]);

  const availableExperienceTypes = useMemo(() => {
    const set = new Set<string>();
    posts.forEach((p) => {
      if (p.experienceType) set.add(p.experienceType);
    });
    return ['all', ...Array.from(set).sort()];
  }, [posts]);

  // Filter & Sort Logic
  const filteredPosts = useMemo(() => {
    let result = [...posts];

    // 1. Search Query
    if (filters.searchQuery.trim()) {
      const q = filters.searchQuery.trim().toLowerCase();
      result = result.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.content.toLowerCase().includes(q) ||
          p.destinationCity.toLowerCase().includes(q) ||
          p.destinationCountry.toLowerCase().includes(q) ||
          p.authorName.toLowerCase().includes(q) ||
          p.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }

    // 2. Destination Filter
    if (filters.selectedDestination !== 'all') {
      result = result.filter((p) => p.destinationCity === filters.selectedDestination);
    }

    // 3. Experience Type Filter
    if (filters.selectedExperienceType !== 'all') {
      result = result.filter((p) => p.experienceType === filters.selectedExperienceType);
    }

    // 4. Travel Style Filter
    if (filters.selectedTravelStyle !== 'all') {
      result = result.filter((p) => p.travelStyle === filters.selectedTravelStyle);
    }

    // 5. Sort
    result.sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case 'oldest':
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case 'most-liked':
          return (b.likes || 0) - (a.likes || 0);
        case 'title-asc':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return result;
  }, [posts, filters]);

  // Grouping Logic
  const groupedPosts = useMemo(() => {
    if (filters.groupBy === 'none') return null;

    const groups: { [key: string]: CommunityPost[] } = {};

    filteredPosts.forEach((post) => {
      let key = 'Other';
      if (filters.groupBy === 'destination') {
        key = `${post.destinationCity}, ${post.destinationCountry}`;
      } else if (filters.groupBy === 'experienceType') {
        key = `${post.experienceType} Stories`;
      } else if (filters.groupBy === 'travelStyle') {
        key = `${post.travelStyle || 'General'} Travel`;
      }

      if (!groups[key]) groups[key] = [];
      groups[key].push(post);
    });

    return groups;
  }, [filteredPosts, filters.groupBy]);

  // Like Toggle Handler
  const handleLikePost = (post: CommunityPost) => {
    const user = authService.getCurrentUser();
    if (!user) {
      showToast('info', 'Sign In Required', 'Please sign in to like community experiences.');
      navigate('/login?redirect=/community', { state: { from: '/community' } });
      return;
    }

    const { post: updated, isLiked } = communityService.toggleLike(post.id, user.id);
    if (updated) {
      setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
      if (selectedPostDetails && selectedPostDetails.id === updated.id) {
        setSelectedPostDetails(updated);
      }
      showToast('success', isLiked ? 'Liked!' : 'Unliked', isLiked ? `You liked "${post.title}".` : `Unliked "${post.title}".`);
    }
  };

  // Copy Trip Handler
  const handleCopyTrip = (post: CommunityPost) => {
    const user = authService.getCurrentUser();
    if (!user) {
      showToast('info', 'Sign In Required', 'Please sign in to copy this itinerary to your personal trips.');
      navigate('/login?redirect=/community', { state: { from: '/community' } });
      return;
    }

    if (!post.tripId) {
      showToast('info', 'No Attached Trip', 'This story does not have a cloneable itinerary attached.');
      return;
    }

    // Lookup public trip source
    const sourceTrip = tripService.getTripById(post.tripId);
    if (sourceTrip) {
      // Clone trip for current user
      const cloned = tripService.cloneTripForUser(sourceTrip, user.id);
      showToast('success', 'Trip Copied!', `"${cloned.name}" has been copied to your personal trips.`);
      setUserTrips(tripService.getUserTrips(user.id));
      navigate(`/trips/${cloned.id}/itinerary`);
    } else {
      // Fallback clone based on post metadata
      const created = tripService.createTrip({
        userId: user.id,
        name: `${post.tripName || post.destinationCity} (Copy)`,
        startDate: '2026-09-10',
        endDate: '2026-09-17',
        destinations: [
          {
            id: `dest_${Date.now()}`,
            city: post.destinationCity,
            country: post.destinationCountry,
            region: 'Europe',
            flag: '🌍',
            image: post.imageUrl || 'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=800&auto=format&fit=crop',
          },
        ],
        notes: `Copied from community post by ${post.authorName}: ${post.title}`,
      });

      showToast('success', 'Trip Copied!', `"${created.name}" was added to your trips.`);
      setUserTrips(tripService.getUserTrips(user.id));
      navigate(`/trips/${created.id}/itinerary`);
    }
  };

  // Share Post Handler
  const handleSharePost = (post: CommunityPost) => {
    const url = `${window.location.origin}/community#${post.id}`;
    navigator.clipboard.writeText(url);
    showToast('success', 'Link Copied!', 'Experience link copied to clipboard.');
  };

  // Save / Update Post
  const handleSavePost = (postData: any) => {
    const user = authService.getCurrentUser();
    if (!user) {
      showToast('error', 'Sign In Required', 'Please sign in to publish a post.');
      return;
    }

    if (editingPost) {
      const updated = communityService.updatePost(editingPost.id, user.id, postData);
      if (updated) {
        setPosts((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
        showToast('success', 'Post Updated', `"${updated.title}" was updated successfully.`);
      }
    } else {
      const newPost = communityService.createPost({
        ...postData,
        authorId: user.id,
        authorName: user.fullName,
        authorAvatar: user.avatarUrl,
      });
      setPosts((prev) => [newPost, ...prev]);
      showToast('success', 'Published!', 'Your travel experience is now live on the community feed.');
    }

    setIsCreateModalOpen(false);
    setEditingPost(null);
  };

  // Delete Post
  const handleConfirmDelete = () => {
    const user = authService.getCurrentUser();
    if (!user || !deletingPost) return;

    const success = communityService.deletePost(deletingPost.id, user.id);
    if (success) {
      setPosts((prev) => prev.filter((p) => p.id !== deletingPost.id));
      showToast('info', 'Post Removed', `"${deletingPost.title}" was deleted.`);
    } else {
      showToast('error', 'Action Denied', 'You can only delete your own posts.');
    }

    setDeletingPost(null);
  };

  const handleOpenCreatePost = () => {
    const user = authService.getCurrentUser();
    if (!user) {
      showToast('info', 'Sign In Required', 'Please sign in to share your travel stories.');
      navigate('/login?redirect=/community', { state: { from: '/community' } });
      return;
    }
    setEditingPost(null);
    setIsCreateModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#F7F1E5] text-[#252525] flex flex-col justify-between selection:bg-[#F4C95D]/40">
      {/* 1. Global Navigation */}
      <LandingNavbar />

      {/* 2. Main Community Discovery Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-10 space-y-8">
        {/* Editorial Community Header */}
        <div className="bg-[#FFF9EE] border border-[#DAD4C7]/80 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7EFEA] border border-[#C2D7CC] text-xs font-bold text-[#4E7360]">
                <Users className="w-3.5 h-3.5" /> Explorer Community
              </div>
              <h1 className="text-2xl sm:text-4xl font-serif font-bold text-[#252525] tracking-tight">
                Community Experiences
              </h1>
              <p className="text-xs sm:text-sm text-[#6F6A60] max-w-2xl leading-relaxed">
                Discover real travel itineraries, destination guides, culinary gems, and adventure tips shared by fellow explorers worldwide.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="md"
              onClick={handleOpenCreatePost}
              leftIcon={<Plus className="w-4 h-4" />}
              className="text-xs font-bold shadow-sm self-start sm:self-auto shrink-0"
            >
              + Share Your Experience
            </Button>
          </div>

          {/* Real Dynamically Calculated Stats */}
          <div className="pt-4 border-t border-[#DAD4C7]/60 grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-[#FCFAF5] p-3 rounded-2xl border border-[#DAD4C7]/60">
              <span className="text-[10px] uppercase font-bold text-[#8C867B] block">Explorers</span>
              <span className="text-lg font-serif font-bold text-[#252525]">{stats.authors}</span>
            </div>
            <div className="bg-[#FCFAF5] p-3 rounded-2xl border border-[#DAD4C7]/60">
              <span className="text-[10px] uppercase font-bold text-[#8C867B] block">Stories Shared</span>
              <span className="text-lg font-serif font-bold text-[#252525]">{stats.postsCount}</span>
            </div>
            <div className="bg-[#FCFAF5] p-3 rounded-2xl border border-[#DAD4C7]/60">
              <span className="text-[10px] uppercase font-bold text-[#8C867B] block">Destinations</span>
              <span className="text-lg font-serif font-bold text-[#252525]">{stats.destinations}</span>
            </div>
            <div className="bg-[#FCFAF5] p-3 rounded-2xl border border-[#DAD4C7]/60">
              <span className="text-[10px] uppercase font-bold text-[#8C867B] block">Applauds & Likes</span>
              <span className="text-lg font-serif font-bold text-[#D96B43]">{stats.likes}</span>
            </div>
          </div>
        </div>

        {/* 3. Search & Filter Bar */}
        <div className="bg-[#FFF9EE] p-4 sm:p-5 rounded-3xl border border-[#DAD4C7]/80 space-y-4 shadow-2xs">
          <div className="flex flex-col lg:flex-row lg:items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C867B]" />
              <input
                type="text"
                value={filters.searchQuery}
                onChange={(e) => setFilters((f) => ({ ...f, searchQuery: e.target.value }))}
                placeholder="Search stories, destinations, activities, authors, tags (#Paris, #Foodie)..."
                className="w-full h-11 pl-10 pr-8 bg-white border border-[#DAD4C7] rounded-xl text-xs text-[#252525] focus:outline-none focus:border-[#E3B443] focus:ring-2 focus:ring-[#F4C95D]/20 font-medium"
              />
              {filters.searchQuery && (
                <button
                  type="button"
                  onClick={() => setFilters((f) => ({ ...f, searchQuery: '' }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8C867B] hover:text-[#252525]"
                >
                  <RotateCcw className="w-3 h-3" />
                </button>
              )}
            </div>

            {/* Filter Dropdowns */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {/* Destination Filter */}
              <div className="flex items-center gap-1 bg-white border border-[#DAD4C7] rounded-xl px-2.5 h-11">
                <MapPin className="w-3.5 h-3.5 text-[#C29326]" />
                <select
                  value={filters.selectedDestination}
                  onChange={(e) => setFilters((f) => ({ ...f, selectedDestination: e.target.value }))}
                  className="bg-transparent font-semibold text-[#252525] focus:outline-none cursor-pointer pr-1"
                >
                  <option value="all">All Destinations</option>
                  {availableDestinations
                    .filter((d) => d !== 'all')
                    .map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                </select>
              </div>

              {/* Experience Type Filter */}
              <div className="flex items-center gap-1 bg-white border border-[#DAD4C7] rounded-xl px-2.5 h-11">
                <Tag className="w-3.5 h-3.5 text-[#4E7360]" />
                <select
                  value={filters.selectedExperienceType}
                  onChange={(e) => setFilters((f) => ({ ...f, selectedExperienceType: e.target.value }))}
                  className="bg-transparent font-semibold text-[#252525] focus:outline-none cursor-pointer pr-1"
                >
                  <option value="all">All Experiences</option>
                  {availableExperienceTypes
                    .filter((t) => t !== 'all')
                    .map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                </select>
              </div>

              {/* Group By Dropdown */}
              <div className="flex items-center gap-1 bg-white border border-[#DAD4C7] rounded-xl px-2.5 h-11">
                <span className="text-[#8C867B] font-normal">Group:</span>
                <select
                  value={filters.groupBy}
                  onChange={(e) => setFilters((f) => ({ ...f, groupBy: e.target.value as CommunityGroupByOption }))}
                  className="bg-transparent font-semibold text-[#252525] focus:outline-none cursor-pointer pr-1"
                >
                  {groupByOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Sort Order Dropdown */}
              <div className="flex items-center gap-1 bg-white border border-[#DAD4C7] rounded-xl px-2.5 h-11">
                <ArrowUpDown className="w-3.5 h-3.5 text-[#C29326]" />
                <select
                  value={filters.sortBy}
                  onChange={(e) => setFilters((f) => ({ ...f, sortBy: e.target.value as CommunitySortOption }))}
                  className="bg-transparent font-semibold text-[#252525] focus:outline-none cursor-pointer pr-1"
                >
                  {sortOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* 4. Community Feed & Grouped Sections */}
        {filteredPosts.length === 0 ? (
          /* Empty State */
          <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 p-10 sm:p-14 text-center space-y-4 shadow-sm">
            <div className="w-14 h-14 rounded-2xl bg-[#FCFAF5] border border-[#DAD4C7] flex items-center justify-center mx-auto text-[#4E7360]">
              <Globe className="w-7 h-7" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-serif font-bold text-[#252525]">
                No community experiences found
              </h3>
              <p className="text-xs text-[#6F6A60] max-w-sm mx-auto">
                No travel stories match your search filters. Be the first to share an experience for this destination!
              </p>
            </div>
            <div className="flex items-center justify-center gap-3 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setFilters({
                    searchQuery: '',
                    selectedDestination: 'all',
                    selectedExperienceType: 'all',
                    selectedTravelStyle: 'all',
                    groupBy: 'none',
                    sortBy: 'newest',
                  })
                }
              >
                Clear Search & Filters
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleOpenCreatePost}
                leftIcon={<Plus className="w-3.5 h-3.5" />}
              >
                Share First Story
              </Button>
            </div>
          </div>
        ) : groupedPosts ? (
          /* Grouped Results */
          <div className="space-y-8">
            {Object.entries(groupedPosts).map(([groupTitle, list]) => (
              <section key={groupTitle} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-[#DAD4C7]">
                  <h2 className="text-lg font-serif font-bold text-[#252525] flex items-center gap-2">
                    <span>{groupTitle}</span>
                    <span className="text-xs font-sans font-semibold text-[#8C867B] bg-[#FCFAF5] px-2 py-0.5 rounded-full border border-[#DAD4C7]">
                      {list.length} {list.length === 1 ? 'story' : 'stories'}
                    </span>
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {list.map((post) => (
                    <CommunityPostCard
                      key={post.id}
                      post={post}
                      currentUserId={currentUser?.id}
                      isLiked={currentUser ? post.likedBy?.includes(currentUser.id) : false}
                      onLike={handleLikePost}
                      onViewDetails={(p) => setSelectedPostDetails(p)}
                      onCopyTrip={handleCopyTrip}
                      onSharePost={handleSharePost}
                      onEditPost={(p) => {
                        setEditingPost(p);
                        setIsCreateModalOpen(true);
                      }}
                      onDeletePost={(p) => setDeletingPost(p)}
                    />
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          /* Flat Feed Grid */
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map((post) => (
              <CommunityPostCard
                key={post.id}
                post={post}
                currentUserId={currentUser?.id}
                isLiked={currentUser ? post.likedBy?.includes(currentUser.id) : false}
                onLike={handleLikePost}
                onViewDetails={(p) => setSelectedPostDetails(p)}
                onCopyTrip={handleCopyTrip}
                onSharePost={handleSharePost}
                onEditPost={(p) => {
                  setEditingPost(p);
                  setIsCreateModalOpen(true);
                }}
                onDeletePost={(p) => setDeletingPost(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Post Creation / Edit Modal */}
      <CreatePostModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingPost(null);
        }}
        onSave={handleSavePost}
        userTrips={userTrips}
        editingPost={editingPost}
      />

      {/* Post Details Modal */}
      <CommunityPostDetailsModal
        isOpen={Boolean(selectedPostDetails)}
        onClose={() => setSelectedPostDetails(null)}
        post={selectedPostDetails}
        currentUserId={currentUser?.id}
        isLiked={
          currentUser && selectedPostDetails
            ? selectedPostDetails.likedBy?.includes(currentUser.id)
            : false
        }
        onLike={handleLikePost}
        onCopyTrip={handleCopyTrip}
        onSharePost={handleSharePost}
      />

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={Boolean(deletingPost)}
        onClose={() => setDeletingPost(null)}
        title="Delete Community Experience?"
        subtitle="This action will permanently remove this experience post from the community feed."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-1">
          <p className="text-xs text-[#6F6A60] leading-relaxed">
            Are you sure you want to remove <span className="font-bold text-[#252525]">"{deletingPost?.title}"</span>?
          </p>
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#DAD4C7]/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setDeletingPost(null)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={handleConfirmDelete}
              className="bg-[#D96B43] hover:bg-[#C25832] text-white border-transparent"
            >
              Delete Experience
            </Button>
          </div>
        </div>
      </Modal>

      {/* Universal Footer */}
      <Footer />
    </div>
  );
};
