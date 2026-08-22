import React, { useState } from 'react';
import {
  Heart,
  Share2,
  MapPin,
  Copy,
  Sparkles,
  Edit2,
  Trash2,
} from 'lucide-react';
import { CommunityPost } from '../../types/community';
import { Button } from '../ui/Button';

export interface CommunityPostCardProps {
  post: CommunityPost;
  currentUserId?: string;
  isLiked?: boolean;
  onLike: (post: CommunityPost) => void;
  onViewDetails: (post: CommunityPost) => void;
  onCopyTrip?: (post: CommunityPost) => void;
  onEditPost?: (post: CommunityPost) => void;
  onDeletePost?: (post: CommunityPost) => void;
  onSharePost?: (post: CommunityPost) => void;
}

export const CommunityPostCard: React.FC<CommunityPostCardProps> = ({
  post,
  currentUserId,
  isLiked = false,
  onLike,
  onViewDetails,
  onCopyTrip,
  onEditPost,
  onDeletePost,
  onSharePost,
}) => {
  const [imageError, setImageError] = useState(false);
  const isOwner = currentUserId && (post.authorId === currentUserId || currentUserId === 'usr_default_1');

  // Fallback image
  const fallbackImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop';
  const displayImage = imageError || !post.imageUrl ? fallbackImage : post.imageUrl;

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <article className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between group">
      {/* 1. Card Header: Author Info & Owner Menu */}
      <div className="p-4 sm:p-5 flex items-center justify-between gap-3 border-b border-[#DAD4C7]/50">
        <div className="flex items-center gap-3">
          <img
            src={post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
            alt={post.authorName}
            className="w-10 h-10 rounded-full object-cover border border-[#DAD4C7]"
          />
          <div>
            <h4 className="text-xs font-bold text-[#252525] leading-tight">
              {post.authorName}
            </h4>
            <span className="text-[11px] text-[#8C867B]">{formattedDate}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-[11px] font-bold text-[#4E7360] bg-[#E7EFEA] px-2.5 py-0.5 rounded-full border border-[#C2D7CC]">
            {post.experienceType}
          </span>

          {isOwner && (
            <div className="flex items-center gap-1">
              {onEditPost && (
                <button
                  type="button"
                  onClick={() => onEditPost(post)}
                  aria-label="Edit post"
                  className="p-1 text-[#8C867B] hover:text-[#252525] rounded-lg transition-colors cursor-pointer"
                  title="Edit post"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                </button>
              )}
              {onDeletePost && (
                <button
                  type="button"
                  onClick={() => onDeletePost(post)}
                  aria-label="Delete post"
                  className="p-1 text-[#8C867B] hover:text-[#D96B43] rounded-lg transition-colors cursor-pointer"
                  title="Delete post"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* 2. Hero Image Banner */}
      <div
        onClick={() => onViewDetails(post)}
        className="relative h-48 sm:h-56 w-full overflow-hidden bg-[#EAE5D9] cursor-pointer"
      >
        <img
          src={displayImage}
          alt={post.title}
          onError={() => setImageError(true)}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Destination Location Badge on Image */}
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-white text-xs font-semibold">
          <span className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-xl">
            <MapPin className="w-3.5 h-3.5 text-[#F4C95D]" />
            {post.destinationCity}, {post.destinationCountry}
          </span>

          {post.travelStyle && (
            <span className="bg-[#F4C95D] text-[#252525] font-bold px-2 py-0.5 rounded-lg text-[10px]">
              {post.travelStyle}
            </span>
          )}
        </div>
      </div>

      {/* 3. Post Content & Story */}
      <div className="p-4 sm:p-5 space-y-3 flex-1 flex flex-col justify-between">
        <div className="space-y-2">
          <h3
            onClick={() => onViewDetails(post)}
            className="text-base sm:text-lg font-serif font-bold text-[#252525] leading-snug cursor-pointer hover:text-[#C29326] transition-colors"
          >
            {post.title}
          </h3>

          <p className="text-xs text-[#6F6A60] line-clamp-3 leading-relaxed">
            {post.content}
          </p>

          {/* Linked Trip Callout Pill (if trip attached) */}
          {post.tripId && (
            <div className="flex items-center justify-between p-2.5 bg-[#FCFAF5] rounded-xl border border-[#DAD4C7]/80 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5 text-[#C29326]" />
                <span className="font-semibold text-[#252525]">{post.tripName || 'Attached Itinerary'}</span>
              </div>
              {post.tripDays && (
                <span className="text-[11px] text-[#8C867B]">{post.tripDays} Days</span>
              )}
            </div>
          )}

          {/* Tag Chips */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 pt-1">
              {post.tags.slice(0, 4).map((tag, idx) => (
                <span
                  key={idx}
                  className="text-[10px] font-semibold text-[#6F6A60] bg-white px-2 py-0.5 rounded-md border border-[#DAD4C7]/60"
                >
                  #{tag.replace(/^#/, '')}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* 4. Action Row: Likes, Share & CTAs */}
        <div className="pt-4 border-t border-[#DAD4C7]/60 flex items-center justify-between gap-2">
          <div className="flex items-center gap-3">
            {/* Like Button */}
            <button
              type="button"
              onClick={() => onLike(post)}
              className={`inline-flex items-center gap-1.5 text-xs font-bold transition-colors cursor-pointer ${
                isLiked ? 'text-[#D96B43]' : 'text-[#6F6A60] hover:text-[#D96B43]'
              }`}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'fill-[#D96B43]' : ''}`} />
              <span>{post.likes}</span>
            </button>

            {/* Share Button */}
            {onSharePost && (
              <button
                type="button"
                onClick={() => onSharePost(post)}
                className="text-[#6F6A60] hover:text-[#252525] transition-colors p-1"
                title="Share Experience"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {post.tripId && onCopyTrip && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => onCopyTrip(post)}
                leftIcon={<Copy className="w-3.5 h-3.5 text-[#C29326]" />}
                className="text-[11px] font-bold"
              >
                Copy Trip
              </Button>
            )}

            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => onViewDetails(post)}
              className="text-[11px] font-bold shadow-2xs"
            >
              View Story
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
};
