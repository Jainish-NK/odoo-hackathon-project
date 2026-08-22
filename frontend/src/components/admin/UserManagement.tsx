import React, { useState } from 'react';
import {
  Eye,
  Edit2,
  UserX,
  UserCheck,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Compass,
} from 'lucide-react';
import { AdminUser, UserStatus } from '../../types/admin';
import { UserDetailsModal } from './UserDetailsModal';
import { UserEditModal } from './UserEditModal';
import { UserDeactivateModal } from './UserDeactivateModal';

interface UserManagementProps {
  users: AdminUser[];
  onUpdateUser: (
    userId: string,
    updates: Partial<Pick<AdminUser, 'fullName' | 'email' | 'country' | 'city' | 'status' | 'role'>>
  ) => void;
  onToggleStatus: (user: AdminUser) => void;
}

const ITEMS_PER_PAGE = 5;

export const UserManagement: React.FC<UserManagementProps> = ({
  users,
  onUpdateUser,
  onToggleStatus,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<AdminUser | null>(null);
  const [selectedUserForEdit, setSelectedUserForEdit] = useState<AdminUser | null>(null);
  const [selectedUserForDeactivate, setSelectedUserForDeactivate] = useState<AdminUser | null>(null);

  // Pagination calculations
  const totalPages = Math.max(1, Math.ceil(users.length / ITEMS_PER_PAGE));
  const validCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (validCurrentPage - 1) * ITEMS_PER_PAGE;
  const paginatedUsers = users.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const getStatusBadge = (status: UserStatus) => {
    switch (status) {
      case 'Active':
        return 'bg-[#E7EFEA] text-[#4E7360] border-[#C2D7CC]';
      case 'Inactive':
        return 'bg-[#FAECE7] text-[#D96B43] border-[#F5D5CB]';
      case 'Pending':
        return 'bg-[#FCFAF5] text-[#C29326] border-[#F4C95D]';
    }
  };

  return (
    <div className="bg-[#FFF9EE] rounded-3xl border border-[#DAD4C7]/80 overflow-hidden shadow-2xs space-y-4">
      {/* Table Header / Stats Bar */}
      <div className="p-4 sm:p-5 border-b border-[#DAD4C7]/60 flex flex-wrap items-center justify-between gap-3 bg-[#FCFAF5]/50">
        <div>
          <h2 className="text-base sm:text-lg font-serif font-bold text-[#252525]">
            Registered Travelers & Administrators
          </h2>
          <p className="text-xs text-[#6F6A60]">
            Displaying {users.length} registered accounts across all regions.
          </p>
        </div>

        <div className="text-xs font-bold text-[#4E7360] bg-[#E7EFEA] px-3 py-1 rounded-xl border border-[#C2D7CC]">
          {users.filter((u) => u.status === 'Active').length} Active Accounts
        </div>
      </div>

      {/* Users Table / Responsive Card Container */}
      {paginatedUsers.length === 0 ? (
        <div className="p-10 text-center space-y-2">
          <p className="text-sm font-semibold text-[#252525]">No travelers match your search filter.</p>
          <p className="text-xs text-[#6F6A60]">Try clearing the query or selecting another status category.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-[#DAD4C7] bg-[#FCFAF5] text-[#6F6A60] font-bold uppercase tracking-wider text-[11px]">
                <th className="py-3.5 px-4 sm:px-6">Traveler</th>
                <th className="py-3.5 px-4 hidden md:table-cell">Country & City</th>
                <th className="py-3.5 px-4 text-center">Trips</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 hidden lg:table-cell">Joined</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DAD4C7]/60">
              {paginatedUsers.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-[#FCFAF5] transition-colors group text-[#252525]"
                >
                  {/* User Column */}
                  <td className="py-3.5 px-4 sm:px-6">
                    <div className="flex items-center gap-3">
                      <img
                        src={
                          user.avatarUrl ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.fullName
                          )}&background=252525&color=F4C95D`
                        }
                        alt={user.fullName}
                        className="w-9 h-9 rounded-xl object-cover border border-[#DAD4C7] shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="font-bold text-xs sm:text-sm text-[#252525] truncate">
                            {user.fullName}
                          </span>
                          {user.role === 'Admin' && (
                            <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#252525] text-[#F4C95D]">
                              ADMIN
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-[#6F6A60] block truncate">
                          {user.email}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Country & City */}
                  <td className="py-3.5 px-4 hidden md:table-cell text-[#6F6A60] font-medium">
                    <div className="flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#C29326] shrink-0" />
                      <span>
                        {user.city ? `${user.city}, ` : ''}
                        {user.country}
                      </span>
                    </div>
                  </td>

                  {/* Trips Count */}
                  <td className="py-3.5 px-4 text-center font-bold">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#FCFAF5] border border-[#DAD4C7]">
                      <Compass className="w-3 h-3 text-[#4E7360]" />
                      {user.tripsCount}
                    </span>
                  </td>

                  {/* Status */}
                  <td className="py-3.5 px-4 text-center">
                    <span
                      className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${getStatusBadge(
                        user.status
                      )}`}
                    >
                      {user.status}
                    </span>
                  </td>

                  {/* Joined Date */}
                  <td className="py-3.5 px-4 hidden lg:table-cell text-[#6F6A60]">
                    {user.joinedDate}
                  </td>

                  {/* Actions Menu */}
                  <td className="py-3.5 px-4 text-right relative">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        type="button"
                        onClick={() => setSelectedUserForDetails(user)}
                        title="View Profile Details"
                        className="p-1.5 text-[#6F6A60] hover:text-[#252525] hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Eye className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedUserForEdit(user)}
                        title="Edit Account"
                        className="p-1.5 text-[#6F6A60] hover:text-[#252525] hover:bg-black/5 rounded-lg transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedUserForDeactivate(user)}
                        title={user.status === 'Active' ? 'Deactivate User' : 'Activate User'}
                        className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                          user.status === 'Active'
                            ? 'text-[#D96B43] hover:bg-[#FAECE7]'
                            : 'text-[#4E7360] hover:bg-[#E7EFEA]'
                        }`}
                      >
                        {user.status === 'Active' ? (
                          <UserX className="w-4 h-4" />
                        ) : (
                          <UserCheck className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination Bar */}
      {totalPages > 1 && (
        <div className="p-4 border-t border-[#DAD4C7]/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <span className="text-[#6F6A60] font-medium">
            Showing <strong className="text-[#252525]">{startIndex + 1}</strong> to{' '}
            <strong className="text-[#252525]">
              {Math.min(startIndex + ITEMS_PER_PAGE, users.length)}
            </strong>{' '}
            of <strong className="text-[#252525]">{users.length}</strong> travelers
          </span>

          <div className="flex items-center gap-1.5 self-center sm:self-auto">
            <button
              type="button"
              disabled={validCurrentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="p-1.5 rounded-xl border border-[#DAD4C7] text-[#6F6A60] hover:text-[#252525] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
              <button
                key={pageNum}
                type="button"
                onClick={() => setCurrentPage(pageNum)}
                className={`w-8 h-8 rounded-xl font-bold transition-all cursor-pointer ${
                  validCurrentPage === pageNum
                    ? 'bg-[#F4C95D] text-[#252525] shadow-xs'
                    : 'text-[#6F6A60] hover:text-[#252525] hover:bg-black/5'
                }`}
              >
                {pageNum}
              </button>
            ))}

            <button
              type="button"
              disabled={validCurrentPage === totalPages}
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              className="p-1.5 rounded-xl border border-[#DAD4C7] text-[#6F6A60] hover:text-[#252525] disabled:opacity-40 disabled:cursor-not-allowed hover:bg-black/5 transition-colors cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Orchestrated Modals */}
      <UserDetailsModal
        isOpen={Boolean(selectedUserForDetails)}
        onClose={() => setSelectedUserForDetails(null)}
        user={selectedUserForDetails}
        onEdit={(u) => setSelectedUserForEdit(u)}
        onToggleStatus={(u) => setSelectedUserForDeactivate(u)}
      />

      <UserEditModal
        isOpen={Boolean(selectedUserForEdit)}
        onClose={() => setSelectedUserForEdit(null)}
        user={selectedUserForEdit}
        onSave={onUpdateUser}
      />

      <UserDeactivateModal
        isOpen={Boolean(selectedUserForDeactivate)}
        onClose={() => setSelectedUserForDeactivate(null)}
        user={selectedUserForDeactivate}
        onConfirm={onToggleStatus}
      />
    </div>
  );
};
