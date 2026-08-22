import React, { useState, useEffect } from 'react';
import {
  User as UserIcon,
  Mail,
  Phone,
  MapPin,
  Edit2,
  Check,
  X,
} from 'lucide-react';
import { User, FormErrors } from '../../types/auth';
import { Input } from '../ui/Input';
import { Textarea } from '../ui/Textarea';
import { Button } from '../ui/Button';

export interface PersonalInfoFormProps {
  user: User;
  onSave: (updates: Partial<User>) => Promise<boolean>;
}

export const PersonalInfoForm: React.FC<PersonalInfoFormProps> = ({ user, onSave }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phoneNumber: user.phoneNumber || '',
    city: user.city || '',
    country: user.country || '',
    additionalInfo: user.additionalInfo || '',
  });

  const [errors, setErrors] = useState<FormErrors<typeof formData>>({});

  useEffect(() => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      city: user.city || '',
      country: user.country || '',
      additionalInfo: user.additionalInfo || '',
    });
  }, [user]);

  const validate = (): boolean => {
    const nextErrors: FormErrors<typeof formData> = {};

    if (!formData.firstName.trim()) {
      nextErrors.firstName = 'First name is required';
    }
    if (!formData.lastName.trim()) {
      nextErrors.lastName = 'Last name is required';
    }
    if (!formData.email.trim()) {
      nextErrors.email = 'Email address is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) {
      nextErrors.email = 'Please enter a valid email address';
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
      city: user.city || '',
      country: user.country || '',
      additionalInfo: user.additionalInfo || '',
    });
    setErrors({});
    setIsEditing(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSaving(true);
    const success = await onSave({
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      email: formData.email.trim().toLowerCase(),
      phoneNumber: formData.phoneNumber.trim(),
      city: formData.city.trim(),
      country: formData.country.trim(),
      additionalInfo: formData.additionalInfo.trim(),
    });

    setIsSaving(false);
    if (success) {
      setIsEditing(false);
    }
  };

  return (
    <div className="bg-[#FFF9EE] rounded-3xl border border-white/80 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Header with Edit Toggle */}
      <div className="flex items-center justify-between pb-4 border-b border-[#DAD4C7]/60">
        <div>
          <h2 className="text-lg sm:text-xl font-serif font-bold text-[#252525] flex items-center gap-2">
            <UserIcon className="w-5 h-5 text-[#C29326]" /> Personal Information
          </h2>
          <p className="text-xs text-[#6F6A60] mt-0.5">
            Manage your account credentials and personal travel profile.
          </p>
        </div>

        {!isEditing && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
            leftIcon={<Edit2 className="w-3.5 h-3.5" />}
            className="shadow-2xs font-semibold"
          >
            Edit Profile
          </Button>
        )}
      </div>

      {/* Form Content */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* First Name */}
          <Input
            label="First Name"
            name="firstName"
            value={formData.firstName}
            onChange={(e) => {
              setFormData({ ...formData, firstName: e.target.value });
              if (errors.firstName) setErrors({ ...errors, firstName: undefined });
            }}
            disabled={!isEditing || isSaving}
            error={errors.firstName}
            required
            placeholder="e.g. Aria"
          />

          {/* Last Name */}
          <Input
            label="Last Name"
            name="lastName"
            value={formData.lastName}
            onChange={(e) => {
              setFormData({ ...formData, lastName: e.target.value });
              if (errors.lastName) setErrors({ ...errors, lastName: undefined });
            }}
            disabled={!isEditing || isSaving}
            error={errors.lastName}
            required
            placeholder="e.g. Vance"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Email */}
          <Input
            label="Email Address"
            type="email"
            name="email"
            value={formData.email}
            onChange={(e) => {
              setFormData({ ...formData, email: e.target.value });
              if (errors.email) setErrors({ ...errors, email: undefined });
            }}
            disabled={!isEditing || isSaving}
            error={errors.email}
            required
            leftIcon={<Mail className="w-4 h-4" />}
            placeholder="aria@example.com"
          />

          {/* Phone Number */}
          <Input
            label="Phone Number"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
            disabled={!isEditing || isSaving}
            leftIcon={<Phone className="w-4 h-4" />}
            placeholder="+1 (555) 000-0000"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* City */}
          <Input
            label="City"
            name="city"
            value={formData.city}
            onChange={(e) => setFormData({ ...formData, city: e.target.value })}
            disabled={!isEditing || isSaving}
            leftIcon={<MapPin className="w-4 h-4" />}
            placeholder="e.g. Barcelona"
          />

          {/* Country */}
          <Input
            label="Country"
            name="country"
            value={formData.country}
            onChange={(e) => setFormData({ ...formData, country: e.target.value })}
            disabled={!isEditing || isSaving}
            leftIcon={<MapPin className="w-4 h-4" />}
            placeholder="e.g. Spain"
          />
        </div>

        {/* Travel Bio / Additional Info */}
        <Textarea
          label="Travel Bio / Explorer Notes"
          name="additionalInfo"
          value={formData.additionalInfo}
          onChange={(e) => setFormData({ ...formData, additionalInfo: e.target.value })}
          disabled={!isEditing || isSaving}
          rows={3}
          helperText="Share your travel philosophy, favorite experiences, or bucket list goals."
          placeholder="e.g. Passionate solo traveler & food photographer. Loving Mediterranean sunsets and alpine hikes."
        />

        {/* Edit Mode Actions */}
        {isEditing && (
          <div className="flex items-center justify-end gap-3 pt-4 border-t border-[#DAD4C7]/50 animate-in fade-in">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCancel}
              disabled={isSaving}
              leftIcon={<X className="w-3.5 h-3.5" />}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSaving}
              loadingText="Saving..."
              leftIcon={<Check className="w-3.5 h-3.5" />}
              className="font-bold shadow-xs"
            >
              Save Changes
            </Button>
          </div>
        )}
      </form>
    </div>
  );
};
