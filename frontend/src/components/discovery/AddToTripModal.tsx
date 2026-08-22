import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Calendar,
  MapPin,
  Plus,
  Check,
  Plane,
  Sparkles,
  Info,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { authService } from '../../services/authService';
import { tripService, formatDisplayDate } from '../../services/tripService';
import { Trip, TripDestinationOption, ActivityItem } from '../../types/trip';
import { Destination } from '../../types/landing';
import { useToast } from '../../context/ToastContext';

export interface AddToTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  target:
    | { type: 'city'; destination: Destination | TripDestinationOption }
    | { type: 'activity'; activity: ActivityItem }
    | null;
  onSuccess?: (tripId: string) => void;
}

export const AddToTripModal: React.FC<AddToTripModalProps> = ({
  isOpen,
  onClose,
  target,
  onSuccess,
}) => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [userTrips, setUserTrips] = useState<Trip[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [addingTripId, setAddingTripId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const user = authService.getCurrentUser();
    if (!user) {
      setIsLoggedIn(false);
      return;
    }
    setIsLoggedIn(true);
    void tripService.getUserTrips(user.id).then(setUserTrips);
  }, [isOpen]);

  if (!target) return null;

  const isCity = target.type === 'city';
  const itemName = isCity ? target.destination.city : target.activity.name;
  const itemLocation = isCity
    ? `${target.destination.city}, ${target.destination.country}`
    : `${target.activity.city}, ${target.activity.country}`;

  const handleAddCity = async (trip: Trip) => {
    if (!isCity) return;
    setAddingTripId(trip.id);

    const destOption: TripDestinationOption = {
      id: target.destination.id,
      city: target.destination.city,
      country: target.destination.country,
      region: target.destination.region,
      flag: '📍',
      image: target.destination.image,
    };

    const updated = await tripService.addDestinationToTrip(trip.id, destOption);
    setAddingTripId(null);

    if (updated) {
      showToast(
        'success',
        'Destination Added!',
        `${target.destination.city} has been added to "${trip.name}".`
      );
      if (onSuccess) onSuccess(trip.id);
      onClose();
    }
  };

  const handleAddActivity = async (trip: Trip) => {
    if (isCity) return;
    setAddingTripId(trip.id);

    const updated = await tripService.addActivityToTrip(trip.id, target.activity, true);
    setAddingTripId(null);

    if (updated) {
      showToast(
        'success',
        'Activity Added!',
        `"${target.activity.name}" added to "${trip.name}" itinerary.`
      );
      if (onSuccess) onSuccess(trip.id);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isCity ? `Add ${itemName} to Trip` : 'Add Activity to Itinerary'}
      subtitle={`Choose which trip you would like to add this ${isCity ? 'destination' : 'experience'} to.`}
      maxWidth="md"
    >
      <div className="space-y-4 pt-1">
        {/* Selected Item Summary Pill */}
        <div className="flex items-center gap-3 p-3 bg-[#FCFAF5] border border-[#DAD4C7] rounded-2xl">
          <img
            src={isCity ? target.destination.image : target.activity.image}
            alt={itemName}
            className="w-12 h-12 rounded-xl object-cover border border-[#DAD4C7]"
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-[#252525] truncate">{itemName}</p>
            <p className="text-[11px] text-[#6F6A60] flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#C29326]" />
              {itemLocation}
            </p>
          </div>
          <span className="text-[10px] font-bold text-[#4E7360] bg-[#E7EFEA] px-2 py-0.5 rounded-full">
            {isCity ? 'Destination' : target.activity.category}
          </span>
        </div>

        {/* Not Logged In State */}
        {!isLoggedIn ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#F4C95D]/20 text-[#C29326] flex items-center justify-center mx-auto">
              <Plane className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#252525]">Sign in to add to your trips</p>
              <p className="text-xs text-[#6F6A60] max-w-xs mx-auto">
                Create custom multi-city itineraries and save your favorite travel experiences.
              </p>
            </div>
            <div className="flex items-center justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  navigate('/login');
                }}
              >
                Sign In / Register
              </Button>
            </div>
          </div>
        ) : userTrips.length === 0 ? (
          /* Zero Trips State */
          <div className="text-center py-6 space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-[#E7EFEA] text-[#4E7360] flex items-center justify-center mx-auto">
              <Sparkles className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-bold text-[#252525]">No active trips found</p>
              <p className="text-xs text-[#6F6A60] max-w-xs mx-auto">
                You don't have any trips planned yet. Start your first adventure now!
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              leftIcon={<Plus className="w-4 h-4" />}
              onClick={() => {
                onClose();
                navigate('/trips/create');
              }}
            >
              Plan Your First Trip
            </Button>
          </div>
        ) : (
          /* Trips Selection List */
          <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
            <span className="text-[11px] uppercase tracking-wider font-semibold text-[#8C867B] block">
              Select Trip ({userTrips.length} available):
            </span>

            {userTrips.map((trip) => {
              // Check city status
              const hasCity = trip.destinations?.some(
                (d) =>
                  d.id === (isCity ? target.destination.id : '') ||
                  d.city.toLowerCase() === (isCity ? target.destination.city.toLowerCase() : target.activity.city.toLowerCase())
              );

              // Check activity status
              const hasActivity = !isCity && trip.sections?.some(
                (s) => s.title.toLowerCase() === target.activity.name.toLowerCase()
              );

              const isAlreadyAdded = isCity ? hasCity : hasActivity;

              return (
                <div
                  key={trip.id}
                  className="flex items-center justify-between gap-3 p-3.5 bg-white rounded-2xl border border-[#DAD4C7]/80 hover:border-[#E5B740] transition-all shadow-2xs group"
                >
                  <div className="min-w-0 space-y-0.5">
                    <p className="text-xs font-bold text-[#252525] group-hover:text-[#C29326] transition-colors truncate">
                      {trip.name}
                    </p>
                    <p className="text-[11px] text-[#6F6A60] flex items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-[#8C867B]" />
                        {formatDisplayDate(trip.startDate)} - {formatDisplayDate(trip.endDate)}
                      </span>
                      <span>•</span>
                      <span>{trip.destinations?.length || 0} cities</span>
                    </p>

                    {!isCity && !hasCity && (
                      <p className="text-[10px] text-[#C29326] flex items-center gap-1 font-medium pt-0.5">
                        <Info className="w-2.5 h-2.5" /> Will also add {target.activity.city} to trip route
                      </p>
                    )}
                  </div>

                  {isAlreadyAdded ? (
                    <span className="shrink-0 inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#E7EFEA] text-[#4E7360] font-bold text-[11px]">
                      <Check className="w-3.5 h-3.5" /> Added
                    </span>
                  ) : (
                    <Button
                      type="button"
                      variant="primary"
                      size="sm"
                      isLoading={addingTripId === trip.id}
                      onClick={() => (isCity ? handleAddCity(trip) : handleAddActivity(trip))}
                      className="shrink-0 text-xs font-bold"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-[#DAD4C7]/60">
          <Link
            to="/trips/create"
            onClick={onClose}
            className="text-xs font-bold text-[#4E7360] hover:text-[#334D40] flex items-center gap-1 hover:underline"
          >
            <Plus className="w-3.5 h-3.5" /> Or create a new trip
          </Link>

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
