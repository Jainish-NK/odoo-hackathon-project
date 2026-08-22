import React from 'react';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { Trip } from '../../types/trip';

export interface DeleteTripModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  trip: Trip | null;
  isDeleting?: boolean;
}

export const DeleteTripModal: React.FC<DeleteTripModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  trip,
  isDeleting = false,
}) => {
  if (!trip) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Delete Trip"
      subtitle="This action cannot be undone."
      maxWidth="sm"
    >
      <div className="space-y-4 pt-2">
        <div className="flex items-start gap-3.5 p-3.5 bg-[#FAECE7] border border-[#F5D5CB] rounded-2xl">
          <div className="p-2 rounded-xl bg-[#D96B43]/15 text-[#D96B43] shrink-0 mt-0.5">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs text-[#6F6A60] space-y-1">
            <p className="font-semibold text-[#252525]">
              Permanently remove "{trip.name}"?
            </p>
            <p>
              This will erase all itinerary stops, scheduled activities, and budget calculations for this trip.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DAD4C7]/50">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            disabled={isDeleting}
          >
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={onConfirm}
            isLoading={isDeleting}
            loadingText="Deleting..."
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Delete Trip
          </Button>
        </div>
      </div>
    </Modal>
  );
};
