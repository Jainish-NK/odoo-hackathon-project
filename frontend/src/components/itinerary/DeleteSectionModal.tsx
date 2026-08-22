import React from 'react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AlertTriangle, Trash2 } from 'lucide-react';
import { ItinerarySection } from '../../types/trip';

interface DeleteSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  section: ItinerarySection | null;
}

export const DeleteSectionModal: React.FC<DeleteSectionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  section,
}) => {
  if (!section) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Delete Itinerary Section" maxWidth="sm">
      <div className="space-y-4 pt-1">
        <div className="flex items-start gap-3 p-3.5 bg-[#FAECE7] border border-[#F3C4B3] rounded-2xl text-[#8F3316]">
          <AlertTriangle className="w-5 h-5 shrink-0 text-[#D96B43] mt-0.5" />
          <div className="text-xs space-y-1">
            <p className="font-bold">Are you sure you want to remove this section?</p>
            <p className="text-[#8F3316]/90">
              "{section.title}" and its allocated budget of ₹
              {(Number(section.budget) || 0).toLocaleString('en-IN')} will be removed from your trip total.
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <Button type="button" variant="outline" size="md" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="md"
            onClick={onConfirm}
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Delete Section
          </Button>
        </div>
      </div>
    </Modal>
  );
};
