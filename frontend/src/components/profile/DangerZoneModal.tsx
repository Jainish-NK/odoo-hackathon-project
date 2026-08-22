import React, { useState } from 'react';
import { AlertTriangle, Trash2, LogOut, ShieldAlert } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';

export interface DangerZoneModalProps {
  onDeleteAccount: () => Promise<void>;
  onSignOut: () => void;
}

export const DangerZoneModal: React.FC<DangerZoneModalProps> = ({
  onDeleteAccount,
  onSignOut,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    await onDeleteAccount();
    setIsDeleting(false);
    setIsModalOpen(false);
  };

  return (
    <div className="bg-[#FFF9EE] rounded-3xl border border-[#F5D5CB] p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header */}
      <div className="pb-4 border-b border-[#F5D5CB]/80">
        <h2 className="text-lg sm:text-xl font-serif font-bold text-[#D96B43] flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-[#D96B43]" /> Danger Zone & Account Actions
        </h2>
        <p className="text-xs text-[#6F6A60] mt-0.5">
          Sign out of your active session or permanently delete your GlobeTrotter profile.
        </p>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-[#FAECE7]/60 rounded-2xl border border-[#F5D5CB]">
        <div className="space-y-1 text-xs">
          <p className="font-bold text-[#252525]">Sign Out</p>
          <p className="text-[#6F6A60]">
            End your current browser session on this device.
          </p>
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onSignOut}
          leftIcon={<LogOut className="w-3.5 h-3.5" />}
          className="shrink-0 font-semibold"
        >
          Sign Out
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 bg-[#FAECE7] rounded-2xl border border-[#F5D5CB]">
        <div className="space-y-1 text-xs">
          <p className="font-bold text-[#D96B43]">Delete Explorer Account</p>
          <p className="text-[#6F6A60]">
            Permanently delete your user profile, saved destinations, and personal trip itineraries.
          </p>
        </div>

        <Button
          type="button"
          variant="danger"
          size="sm"
          onClick={() => setIsModalOpen(true)}
          leftIcon={<Trash2 className="w-3.5 h-3.5" />}
          className="shrink-0 font-bold"
        >
          Delete Account
        </Button>
      </div>

      {/* Confirmation Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Delete Explorer Account"
        subtitle="This action is permanent and cannot be reversed."
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <div className="flex items-start gap-3.5 p-3.5 bg-[#FAECE7] border border-[#F5D5CB] rounded-2xl">
            <div className="p-2 rounded-xl bg-[#D96B43]/15 text-[#D96B43] shrink-0 mt-0.5">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="text-xs text-[#6F6A60] space-y-1">
              <p className="font-bold text-[#252525]">
                Are you absolutely sure?
              </p>
              <p>
                This will permanently remove your account and all associated local travel data, including saved trips, custom activities, and preferences.
              </p>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DAD4C7]/50">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="danger"
              size="sm"
              onClick={handleConfirmDelete}
              isLoading={isDeleting}
              loadingText="Deleting Account..."
              leftIcon={<Trash2 className="w-4 h-4" />}
            >
              Permanently Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};
