import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AdminUser } from '../../types/admin';

interface UserDeactivateModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onConfirm: (user: AdminUser) => void;
}

export const UserDeactivateModal: React.FC<UserDeactivateModalProps> = ({
  isOpen,
  onClose,
  user,
  onConfirm,
}) => {
  if (!user) return null;

  const isDeactivating = user.status === 'Active';

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isDeactivating ? 'Deactivate Traveler Account' : 'Reactivate Traveler Account'}
      maxWidth="sm"
    >
      <div className="space-y-4">
        <div className="flex items-start gap-3.5 p-4 rounded-2xl bg-[#FAECE7] border border-[#F5D5CB]">
          <div className="p-2 rounded-xl bg-[#D96B43] text-white shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="text-xs text-[#252525] space-y-1">
            <p className="font-bold">
              {isDeactivating
                ? `Are you sure you want to deactivate ${user.fullName}?`
                : `Are you sure you want to restore active access for ${user.fullName}?`}
            </p>
            <p className="text-[#6F6A60] leading-relaxed">
              {isDeactivating
                ? 'The user will be restricted from creating new trips and community interactions until reactivated.'
                : 'The user will immediately regain full access to itinerary building and community publishing.'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DAD4C7]/60">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs font-bold">
            Cancel
          </Button>
          <Button
            type="button"
            variant="danger"
            size="sm"
            onClick={() => {
              onConfirm(user);
              onClose();
            }}
            className="text-xs font-bold"
          >
            {isDeactivating ? 'Confirm Deactivate' : 'Confirm Activate'}
          </Button>
        </div>
      </div>
    </Modal>
  );
};
