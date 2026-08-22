import React, { useState, useEffect } from 'react';
import {
  MapPin,
  Image,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { CommunityPost, ExperienceType } from '../../types/community';
import { Trip } from '../../types/trip';

export interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: {
    title: string;
    content: string;
    destinationCity: string;
    destinationCountry: string;
    experienceType: ExperienceType;
    travelStyle?: string;
    imageUrl?: string;
    tripId?: string;
    tripName?: string;
    tripDays?: number;
    estimatedBudget?: number;
    tags: string[];
    isPublic: boolean;
  }) => void;
  userTrips: Trip[];
  editingPost?: CommunityPost | null;
}

const experienceTypes: ExperienceType[] = [
  'Trip Itinerary',
  'Destination Guide',
  'Activity & Tour',
  'Food & Dining',
  'Hotel & Stay',
  'Travel Tip',
];

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
  onSave,
  userTrips,
  editingPost,
}) => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [destinationCity, setDestinationCity] = useState('');
  const [destinationCountry, setDestinationCountry] = useState('');
  const [experienceType, setExperienceType] = useState<ExperienceType>('Trip Itinerary');
  const [travelStyle, setTravelStyle] = useState('Cultural');
  const [imageUrl, setImageUrl] = useState('');
  const [selectedTripId, setSelectedTripId] = useState<string>('');
  const [tagInput, setTagInput] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setErrors({});
    setIsSubmitting(false);

    if (editingPost) {
      setTitle(editingPost.title || '');
      setContent(editingPost.content || '');
      setDestinationCity(editingPost.destinationCity || '');
      setDestinationCountry(editingPost.destinationCountry || '');
      setExperienceType(editingPost.experienceType || 'Trip Itinerary');
      setTravelStyle(editingPost.travelStyle || 'Cultural');
      setImageUrl(editingPost.imageUrl || '');
      setSelectedTripId(editingPost.tripId || '');
      setTags(editingPost.tags || []);
      setTagInput('');
    } else {
      setTitle('');
      setContent('');
      setDestinationCity('');
      setDestinationCountry('');
      setExperienceType('Trip Itinerary');
      setTravelStyle('Cultural');
      setImageUrl('');
      setSelectedTripId('');
      setTags([]);
      setTagInput('');
    }
  }, [isOpen, editingPost]);

  const handleAddTag = () => {
    if (!tagInput.trim()) return;
    const clean = tagInput.trim().replace(/^#/, '');
    if (!tags.includes(clean)) {
      setTags([...tags, clean]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (t: string) => {
    setTags(tags.filter((tag) => tag !== t));
  };

  const handleTripSelection = (tripId: string) => {
    setSelectedTripId(tripId);
    if (!tripId) return;

    const matched = userTrips.find((t) => t.id === tripId);
    if (matched) {
      if (!title) setTitle(`${matched.name} Experience`);
      if (matched.destinations && matched.destinations.length > 0) {
        setDestinationCity(matched.destinations[0].city);
        setDestinationCountry(matched.destinations[0].country);
        if (!imageUrl && matched.destinations[0].image) {
          setImageUrl(matched.destinations[0].image);
        }
      }
    }
  };

  const validate = () => {
    const errs: { [key: string]: string } = {};
    if (!title.trim()) errs.title = 'Title is required.';
    if (!content.trim()) errs.content = 'Story / Description is required.';
    if (!destinationCity.trim()) errs.destinationCity = 'Destination City is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);

    const matchedTrip = userTrips.find((t) => t.id === selectedTripId);

    onSave({
      title: title.trim(),
      content: content.trim(),
      destinationCity: destinationCity.trim(),
      destinationCountry: destinationCountry.trim() || 'Global',
      experienceType,
      travelStyle,
      imageUrl: imageUrl.trim() || undefined,
      tripId: matchedTrip ? matchedTrip.id : undefined,
      tripName: matchedTrip ? matchedTrip.name : undefined,
      tripDays: matchedTrip ? matchedTrip.destinations?.length || 5 : undefined,
      estimatedBudget: matchedTrip ? matchedTrip.totalBudget : undefined,
      tags: tags.length > 0 ? tags : [destinationCity.trim(), experienceType],
      isPublic: true,
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingPost ? 'Edit Community Experience' : 'Share Your Travel Experience'}
      subtitle="Inspire fellow GlobeTrotter explorers with your travel stories, recommendations, or itinerary."
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-1" noValidate>
        {/* Experience Type Selector */}
        <div>
          <label className="text-[13px] font-medium text-[#48443E] mb-1.5 block">
            Experience Type <span className="text-[#D96B43]">*</span>
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {experienceTypes.map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setExperienceType(type)}
                className={`p-2 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  experienceType === type
                    ? 'bg-[#F4C95D] border-[#C29326] text-[#252525] shadow-xs'
                    : 'bg-white border-[#DAD4C7] text-[#6F6A60] hover:bg-[#FCFAF5]'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>

        {/* Optional Attach Saved Trip */}
        {userTrips.length > 0 && (
          <div>
            <label className="text-[13px] font-medium text-[#48443E] mb-1 block">
              Attach One of Your Trips (Optional)
            </label>
            <select
              value={selectedTripId}
              onChange={(e) => handleTripSelection(e.target.value)}
              className="w-full h-10 px-3 bg-white border border-[#DAD4C7] rounded-xl text-xs font-semibold text-[#252525] focus:outline-none focus:border-[#E3B443] cursor-pointer"
            >
              <option value="">-- No trip attached (Standalone Story) --</option>
              {userTrips.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} ({t.destinations?.length || 0} cities • ₹{(t.totalBudget || 0).toLocaleString('en-IN')})
                </option>
              ))}
            </select>
            <span className="text-[11px] text-[#8C867B] mt-0.5 block">
              Attaching a trip allows readers to 1-click copy your route.
            </span>
          </div>
        )}

        {/* Title Input */}
        <Input
          label="Experience Title"
          placeholder="e.g. Magical 4 Days in Kyoto: Secret Temples & Tea Ceremonies..."
          value={title}
          error={errors.title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (errors.title) setErrors((prev) => ({ ...prev, title: '' }));
          }}
          required
        />

        {/* Destination City & Country Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Destination City"
            placeholder="e.g. Kyoto, Paris, Amalfi Coast..."
            leftIcon={<MapPin className="w-4 h-4" />}
            value={destinationCity}
            error={errors.destinationCity}
            onChange={(e) => {
              setDestinationCity(e.target.value);
              if (errors.destinationCity) setErrors((prev) => ({ ...prev, destinationCity: '' }));
            }}
            required
          />

          <Input
            label="Country"
            placeholder="e.g. Japan, France, Italy..."
            value={destinationCountry}
            onChange={(e) => setDestinationCountry(e.target.value)}
          />
        </div>

        {/* Story / Description Textarea */}
        <Textarea
          label="Your Story & Travel Highlights"
          placeholder="Describe your journey, unforgettable moments, recommended spots, dining tips, and budget advice..."
          rows={4}
          value={content}
          error={errors.content}
          onChange={(e) => {
            setContent(e.target.value);
            if (errors.content) setErrors((prev) => ({ ...prev, content: '' }));
          }}
          required
        />

        {/* Cover Image URL & Travel Style */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Cover Photo URL (Optional)"
            placeholder="https://images.unsplash.com/..."
            leftIcon={<Image className="w-4 h-4" />}
            value={imageUrl}
            onChange={(e) => setImageUrl(e.target.value)}
          />

          <div>
            <label className="text-[13px] font-medium text-[#48443E] mb-1.5 block">
              Travel Style
            </label>
            <select
              value={travelStyle}
              onChange={(e) => setTravelStyle(e.target.value)}
              className="w-full h-11 px-3 bg-white border border-[#DAD4C7] rounded-xl text-xs font-semibold text-[#252525] focus:outline-none focus:border-[#E3B443] cursor-pointer"
            >
              <option value="Cultural">Cultural</option>
              <option value="Adventure">Adventure</option>
              <option value="Luxury">Luxury</option>
              <option value="Relaxation">Relaxation</option>
              <option value="Culinary">Culinary</option>
              <option value="Nature">Nature</option>
            </select>
          </div>
        </div>

        {/* Tags */}
        <div>
          <label className="text-[13px] font-medium text-[#48443E] mb-1 block">
            Tags / Keywords
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              placeholder="e.g. Foodie, Kyoto, CherryBlossom..."
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleAddTag();
                }
              }}
              className="flex-1 h-10 px-3 bg-white border border-[#DAD4C7] rounded-xl text-xs text-[#252525] focus:outline-none focus:border-[#E3B443]"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTag}
              className="shrink-0 text-xs font-bold"
            >
              + Add Tag
            </Button>
          </div>

          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tags.map((t) => (
                <span
                  key={t}
                  className="inline-flex items-center gap-1 text-[11px] font-bold text-[#4E7360] bg-[#E7EFEA] px-2.5 py-0.5 rounded-lg border border-[#C2D7CC]"
                >
                  #{t}
                  <button
                    type="button"
                    onClick={() => handleRemoveTag(t)}
                    className="hover:text-[#D96B43] ml-0.5 cursor-pointer"
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Modal Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DAD4C7]/60">
          <Button
            type="button"
            variant="outline"
            size="md"
            onClick={onClose}
            disabled={isSubmitting}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            loadingText="Publishing..."
            className="shadow-sm hover:shadow-md min-w-[150px] font-bold"
          >
            {editingPost ? 'Update Post' : 'Publish Experience'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
