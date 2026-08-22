import React from 'react';
import {
  Mail,
  MapPin,
  Compass,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { AdminUser } from '../../types/admin';

interface UserDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onEdit: (user: AdminUser) => void;
  onToggleStatus: (user: AdminUser) => void;
}

export const UserDetailsModal: React.FC<UserDetailsModalProps> = ({
  isOpen,
  onClose,
  user,
  onEdit,
  onToggleStatus,
}) => {
  if (!user) return null;

  const getStatusBadge = () => {
    switch (user.status) {
      case 'Active':
        return 'bg-[#E7EFEA] text-[#4E7360] border-[#C2D7CC]';
      case 'Inactive':
        return 'bg-[#FAECE7] text-[#D96B43] border-[#F5D5CB]';
      case 'Pending':
        return 'bg-[#FCFAF5] text-[#C29326] border-[#F4C95D]';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Traveler Account Profile"
      subtitle={`User ID: ${user.id}`}
      maxWidth="md"
    >
      <div className="space-y-6">
        {/* User Card Header */}
        <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#FCFAF5] border border-[#DAD4C7]/80">
          <img
            src={
              user.avatarUrl ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user.fullName
              )}&background=252525&color=F4C95D`
            }
            alt={user.fullName}
            className="w-16 h-16 rounded-2xl object-cover border border-[#DAD4C7] shadow-xs shrink-0"
          />

          <div className="space-y-1 flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#252525] truncate">
                {user.fullName}
              </h3>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${getStatusBadge()}`}
              >
                {user.status}
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-[#252525] text-[#F4C95D]">
                {user.role}
              </span>
            </div>

            <p className="text-xs text-[#6F6A60] flex items-center gap-1.5 truncate">
              <Mail className="w-3.5 h-3.5 text-[#8C867B] shrink-0" />
              <span>{user.email}</span>
            </p>

            <p className="text-xs text-[#6F6A60] flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#C29326] shrink-0" />
              <span>
                {user.city ? `${user.city}, ` : ''}
                {user.country}
              </span>
            </p>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 bg-[#FFF9EE] rounded-2xl border border-[#DAD4C7]/80 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6A60] block">
              Trips
            </span>
            <span className="text-lg font-serif font-bold text-[#252525] mt-0.5 block">
              {user.tripsCount}
            </span>
          </div>

          <div className="p-3 bg-[#FFF9EE] rounded-2xl border border-[#DAD4C7]/80 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6A60] block">
              Estimated Spend
            </span>
            <span className="text-lg font-serif font-bold text-[#4E7360] mt-0.5 block">
              ₹{user.totalSpend.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="p-3 bg-[#FFF9EE] rounded-2xl border border-[#DAD4C7]/80 text-center">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#6F6A60] block">
              Joined Date
            </span>
            <span className="text-xs font-semibold text-[#252525] mt-1.5 block">
              {user.joinedDate}
            </span>
          </div>
        </div>

        {/* Activity & Trips History */}
        <div className="space-y-2.5">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6F6A60] flex items-center gap-1.5">
            <Compass className="w-3.5 h-3.5 text-[#C29326]" />
            Recent Saved Itineraries
          </h4>

          {user.recentTrips && user.recentTrips.length > 0 ? (
            <div className="space-y-2">
              {user.recentTrips.map((t) => (
                <div
                  key={t.id}
                  className="p-3 rounded-xl bg-white border border-[#DAD4C7]/70 flex items-center justify-between text-xs"
                >
                  <div>
                    <span className="font-bold text-[#252525] block">{t.name}</span>
                    <span className="text-[11px] text-[#6F6A60] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-[#8C867B]" /> {t.destinations}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[11px] font-semibold text-[#4E7360] bg-[#E7EFEA] px-2 py-0.5 rounded-md">
                      {t.status}
                    </span>
                    <span className="text-[10px] text-[#8C867B] block mt-1">
                      {t.startDate}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#8C867B] italic p-3 bg-white rounded-xl border border-[#DAD4C7]/60">
              No recent trips logged for this account.
            </p>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#DAD4C7]/60">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onToggleStatus(user)}
            className="text-xs font-bold"
          >
            {user.status === 'Active' ? 'Deactivate Account' : 'Activate Account'}
          </Button>

          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => {
              onClose();
              onEdit(user);
            }}
            className="text-xs font-bold shadow-xs"
          >
            Edit User Profile
          </Button>
        </div>
      </div>
    </Modal>
  );
};
