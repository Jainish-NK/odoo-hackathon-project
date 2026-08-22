import React, { useState } from 'react';
import {
  Copy,
  Check,
  Globe,
  Sparkles,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Trip } from '../../types/trip';
import { communityService } from '../../services/communityService';
import { authService } from '../../services/authService';
import { useToast } from '../../context/ToastContext';

export interface ShareTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  trip: Trip;
}

export const ShareTripModal: React.FC<ShareTripModalProps> = ({
  isOpen,
  onClose,
  trip,
}) => {
  const { showToast } = useToast();
  const currentUser = authService.getCurrentUser();

  const [copied, setCopied] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishTitle, setPublishTitle] = useState(trip.name);
  const [publishStory, setPublishStory] = useState(
    trip.notes ||
      `Excited to share our custom itinerary across ${
        trip.destinations?.map((d) => d.city).join(', ') || 'multiple cities'
      }! Check out our day-by-day plan and budget breakdown.`
  );

  const shareUrl = `${window.location.origin}/trips/${trip.id}/itinerary`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    showToast('success', 'Link Copied!', 'Itinerary link copied to clipboard.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePublishToCommunity = () => {
    if (!currentUser) {
      showToast('error', 'Sign In Required', 'Please sign in to publish your trip to the community.');
      return;
    }

    if (!publishTitle.trim() || !publishStory.trim()) {
      showToast('error', 'Validation Error', 'Please provide a title and short story for your post.');
      return;
    }

    setIsPublishing(true);

    const firstDest = trip.destinations && trip.destinations.length > 0 ? trip.destinations[0] : null;

    communityService.createPost({
      authorId: currentUser.id,
      authorName: currentUser.fullName,
      authorAvatar: currentUser.avatarUrl,
      title: publishTitle.trim(),
      content: publishStory.trim(),
      destinationCity: firstDest ? firstDest.city : 'Multiple Destinations',
      destinationCountry: firstDest ? firstDest.country : 'Global',
      experienceType: 'Trip Itinerary',
      imageUrl: firstDest ? firstDest.image : undefined,
      tripId: trip.id,
      tripName: trip.name,
      tripDays: trip.destinations?.length || 5,
      estimatedBudget: trip.totalBudget,
      tags: [
        ...(firstDest ? [firstDest.city, firstDest.country] : []),
        'Itinerary',
        'TravelPlan',
      ],
      isPublic: true,
    });

    setIsPublishing(false);
    showToast('success', 'Published to Community!', 'Your trip experience is now live on the community feed.');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Share Your Trip"
      subtitle={`Share "${trip.name}" with friends or publish it to the GlobeTrotter Community.`}
      maxWidth="md"
    >
      <div className="space-y-5 pt-1">
        {/* Share Link Copy Box */}
        <div className="space-y-1.5">
          <label className="text-[13px] font-medium text-[#48443E] block">
            Direct Itinerary Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="w-full h-11 text-xs font-mono text-[#252525] bg-[#FCFAF5] border border-[#DAD4C7] rounded-xl px-3 focus:outline-none"
            />
            <Button
              type="button"
              variant="outline"
              size="md"
              onClick={handleCopyLink}
              leftIcon={copied ? <Check className="w-4 h-4 text-[#4E7360]" /> : <Copy className="w-4 h-4" />}
              className="shrink-0 font-bold"
            >
              {copied ? 'Copied' : 'Copy Link'}
            </Button>
          </div>
        </div>

        {/* Publish to Community Section */}
        <div className="pt-3 border-t border-[#DAD4C7]/60 space-y-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#E7EFEA] text-[#4E7360]">
              <Globe className="w-4 h-4" />
            </div>
            <div>
              <h4 className="text-xs font-bold text-[#252525]">
                Publish to Community Feed
              </h4>
              <p className="text-[11px] text-[#6F6A60]">
                Let other travelers discover your itinerary and copy your trip route.
              </p>
            </div>
          </div>

          <div className="space-y-3 bg-[#FCFAF5] p-3.5 rounded-2xl border border-[#DAD4C7]/70 text-xs">
            <div>
              <label className="block text-[#6F6A60] mb-1 font-medium">Post Title</label>
              <input
                type="text"
                value={publishTitle}
                onChange={(e) => setPublishTitle(e.target.value)}
                placeholder="Give your story a catchy title..."
                className="w-full h-10 px-3 bg-white border border-[#DAD4C7] rounded-xl font-semibold text-[#252525] focus:outline-none focus:border-[#E3B443]"
              />
            </div>

            <div>
              <label className="block text-[#6F6A60] mb-1 font-medium">Story & Trip Highlights</label>
              <textarea
                rows={3}
                value={publishStory}
                onChange={(e) => setPublishStory(e.target.value)}
                placeholder="Share personal tips, hotel recommendations, or highlights..."
                className="w-full p-2.5 bg-white border border-[#DAD4C7] rounded-xl text-[#252525] focus:outline-none focus:border-[#E3B443]"
              />
            </div>

            <Button
              type="button"
              variant="primary"
              size="sm"
              fullWidth
              isLoading={isPublishing}
              onClick={handlePublishToCommunity}
              leftIcon={<Sparkles className="w-4 h-4 text-[#252525]" />}
              className="font-bold"
            >
              Publish to Community Feed
            </Button>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex justify-end pt-2 border-t border-[#DAD4C7]/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        </div>
      </div>
    </Modal>
  );
};
