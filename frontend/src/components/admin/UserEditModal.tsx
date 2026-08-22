import React, { useState, useEffect } from 'react';
import { Modal } from '../ui/Modal';
import { Input } from '../ui/Input';
import { Button } from '../ui/Button';
import { AdminUser, UserStatus } from '../../types/admin';

interface UserEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: AdminUser | null;
  onSave: (
    userId: string,
    updates: Partial<Pick<AdminUser, 'fullName' | 'email' | 'country' | 'city' | 'status' | 'role'>>
  ) => void;
}

export const UserEditModal: React.FC<UserEditModalProps> = ({
  isOpen,
  onClose,
  user,
  onSave,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [status, setStatus] = useState<UserStatus>('Active');
  const [role, setRole] = useState<'Admin' | 'Traveler' | 'Guide'>('Traveler');
  const [errors, setErrors] = useState<{ fullName?: string; email?: string; country?: string }>({});

  useEffect(() => {
    if (user) {
      setFullName(user.fullName);
      setEmail(user.email);
      setCountry(user.country);
      setCity(user.city || '');
      setStatus(user.status);
      setRole(user.role);
      setErrors({});
    }
  }, [user]);

  if (!user) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: typeof errors = {};

    if (!fullName.trim()) errs.fullName = 'Full name is required.';
    if (!email.trim() || !email.includes('@')) errs.email = 'Valid email is required.';
    if (!country.trim()) errs.country = 'Country is required.';

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    onSave(user.id, {
      fullName: fullName.trim(),
      email: email.trim(),
      country: country.trim(),
      city: city.trim(),
      status,
      role,
    });
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Edit Traveler Account"
      subtitle={`Modify account details for ${user.fullName}`}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Full Name"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          error={errors.fullName}
          placeholder="e.g. Aria Vance"
          required
        />

        <Input
          label="Email Address"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={errors.email}
          placeholder="e.g. aria@globetrotter.com"
          required
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Input
            label="Country"
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            error={errors.country}
            placeholder="e.g. Spain"
            required
          />

          <Input
            label="City"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            placeholder="e.g. Barcelona"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F6A60]">
              Account Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as UserStatus)}
              className="w-full h-11 px-3 bg-white border border-[#DAD4C7] rounded-xl text-xs font-semibold text-[#252525] focus:outline-none focus:border-[#E3B443] cursor-pointer"
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
              <option value="Pending">Pending Verification</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-[#6F6A60]">
              Platform Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as 'Admin' | 'Traveler' | 'Guide')}
              className="w-full h-11 px-3 bg-white border border-[#DAD4C7] rounded-xl text-xs font-semibold text-[#252525] focus:outline-none focus:border-[#E3B443] cursor-pointer"
            >
              <option value="Traveler">Traveler</option>
              <option value="Guide">Local Guide</option>
              <option value="Admin">Administrator</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-4 border-t border-[#DAD4C7]/60">
          <Button type="button" variant="outline" size="sm" onClick={onClose} className="text-xs font-bold">
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" className="text-xs font-bold shadow-xs">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
};
