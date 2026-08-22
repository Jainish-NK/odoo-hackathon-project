import React, { useState } from 'react';
import {
  Heart,
  Share2,
  MapPin,
  Sparkles,
  Copy,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { CommunityPost } from '../../types/community';

export interface CommunityPostDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  post: CommunityPost | null;
  currentUserId?: string;
  isLiked?: boolean;
  onLike?: (post: CommunityPost) => void;
  onCopyTrip?: (post: CommunityPost) => void;
  onSharePost?: (post: CommunityPost) => void;
}

export const CommunityPostDetailsModal: React.FC<CommunityPostDetailsModalProps> = ({
  isOpen,
  onClose,
  post,
  isLiked = false,
  onLike,
  onCopyTrip,
  onSharePost,
}) => {
  const [imageError, setImageError] = useState(false);

  if (!post) return null;

  const fallbackImage = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?q=80&w=800&auto=format&fit=crop';
  const displayImage = imageError || !post.imageUrl ? fallbackImage : post.imageUrl;

  const formattedDate = post.createdAt
    ? new Date(post.createdAt).toLocaleDateString('en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : 'Recent';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={post.title}
      subtitle={`Shared by ${post.authorName} • ${formattedDate}`}
      maxWidth="lg"
    >
      <div className="space-y-6 pt-1">
        {/* Hero Photo Banner */}
        <div className="relative h-64 sm:h-80 w-full rounded-2xl overflow-hidden bg-[#EAE5D9]">
          <img
            src={displayImage}
            alt={post.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

          <div className="absolute bottom-4 left-4 right-4 flex flex-wrap items-center justify-between gap-2 text-white">
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-xl text-xs font-semibold">
                <MapPin className="w-4 h-4 text-[#F4C95D]" />
                {post.destinationCity}, {post.destinationCountry}
              </span>
              <span className="bg-[#4E7360] text-white px-2.5 py-1 rounded-xl text-xs font-bold">
                {post.experienceType}
              </span>
            </div>

            {post.travelStyle && (
              <span className="bg-[#F4C95D] text-[#252525] px-3 py-1 rounded-xl text-xs font-bold">
                {post.travelStyle}
              </span>
            )}
          </div>
        </div>

        {/* Author Bio Row */}
        <div className="flex items-center justify-between p-3.5 bg-[#FCFAF5] rounded-2xl border border-[#DAD4C7]/80">
          <div className="flex items-center gap-3">
            <img
              src={post.authorAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80'}
              alt={post.authorName}
              className="w-11 h-11 rounded-full object-cover border border-[#DAD4C7]"
            />
            <div>
              <h4 className="text-xs font-bold text-[#252525]">
                {post.authorName}
              </h4>
              <p className="text-[11px] text-[#8C867B]">GlobeTrotter Explorer</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {onLike && (
              <button
                type="button"
                onClick={() => onLike(post)}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  isLiked
                    ? 'bg-[#FAECE7] border-[#F5D5CB] text-[#D96B43]'
                    : 'bg-white border-[#DAD4C7] text-[#6F6A60] hover:text-[#D96B43]'
                }`}
              >
                <Heart className={`w-3.5 h-3.5 ${isLiked ? 'fill-[#D96B43]' : ''}`} />
                <span>{post.likes} Likes</span>
              </button>
            )}

            {onSharePost && (
              <button
                type="button"
                onClick={() => onSharePost(post)}
                className="p-2 rounded-xl bg-white border border-[#DAD4C7] text-[#6F6A60] hover:text-[#252525] transition-colors"
                title="Share link"
              >
                <Share2 className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Travel Story Content */}
        <div className="space-y-3">
          <h4 className="text-sm font-serif font-bold text-[#252525]">
            About This Experience
          </h4>
          <p className="text-xs sm:text-sm text-[#48443E] leading-relaxed whitespace-pre-line">
            {post.content}
          </p>
        </div>

        {/* Linked Trip Callout */}
        {post.tripId && (
          <div className="p-4 bg-[#FFF9EE] rounded-2xl border border-[#DAD4C7] space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#C29326]" />
                <div>
                  <h5 className="text-xs font-bold text-[#252525]">
                    {post.tripName || 'Attached Itinerary Plan'}
                  </h5>
                  <p className="text-[11px] text-[#6F6A60]">
                    {post.tripDays ? `${post.tripDays} Days • ` : ''}
                    {post.estimatedBudget ? `Estimated ₹${post.estimatedBudget.toLocaleString('en-IN')}` : ''}
                  </p>
                </div>
              </div>

              {onCopyTrip && (
                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  onClick={() => onCopyTrip(post)}
                  leftIcon={<Copy className="w-3.5 h-3.5" />}
                  className="font-bold text-xs shadow-xs"
                >
                  Copy This Trip
                </Button>
              )}
            </div>
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="space-y-1.5">
            <span className="text-[11px] uppercase font-bold tracking-wider text-[#8C867B] block">
              Keywords & Tags
            </span>
            <div className="flex flex-wrap gap-1.5">
              {post.tags.map((t, idx) => (
                <span
                  key={idx}
                  className="text-xs font-semibold text-[#4E7360] bg-[#E7EFEA] px-3 py-1 rounded-xl border border-[#C2D7CC]"
                >
                  #{t.replace(/^#/, '')}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Modal Action Bar */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DAD4C7]/60">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
