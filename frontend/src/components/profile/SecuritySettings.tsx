import React, { useState } from 'react';
import { ShieldCheck, Key } from 'lucide-react';
import { PasswordInput } from '../ui/PasswordInput';
import { Button } from '../ui/Button';

export interface SecuritySettingsProps {
  onPasswordChange: (currentPass: string, newPass: string) => Promise<boolean>;
}

export const SecuritySettings: React.FC<SecuritySettingsProps> = ({ onPasswordChange }) => {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isChanging, setIsChanging] = useState(false);
  const [errors, setErrors] = useState<{
    currentPassword?: string;
    newPassword?: string;
    confirmPassword?: string;
  }>({});

  const validate = () => {
    const errs: typeof errors = {};
    if (!currentPassword) {
      errs.currentPassword = 'Enter your current password';
    }
    if (!newPassword || newPassword.length < 6) {
      errs.newPassword = 'New password must be at least 6 characters long';
    }
    if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsChanging(true);
    const success = await onPasswordChange(currentPassword, newPassword);
    setIsChanging(false);

    if (success) {
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setErrors({});
    }
  };

  return (
    <div className="bg-[#FFF9EE] rounded-3xl border border-white/80 p-6 sm:p-8 shadow-sm space-y-6">
      {/* Section Header */}
      <div className="pb-4 border-b border-[#DAD4C7]/60">
        <h2 className="text-lg sm:text-xl font-serif font-bold text-[#252525] flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-[#4E7360]" /> Security & Credentials
        </h2>
        <p className="text-xs text-[#6F6A60] mt-0.5">
          Keep your explorer account protected with a strong password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4 max-w-xl">
        {/* Current Password */}
        <PasswordInput
          label="Current Password"
          name="currentPassword"
          value={currentPassword}
          onChange={(e) => {
            setCurrentPassword(e.target.value);
            if (errors.currentPassword) setErrors({ ...errors, currentPassword: undefined });
          }}
          disabled={isChanging}
          error={errors.currentPassword}
          required
          placeholder="••••••••"
        />

        {/* New Password */}
        <PasswordInput
          label="New Password"
          name="newPassword"
          value={newPassword}
          onChange={(e) => {
            setNewPassword(e.target.value);
            if (errors.newPassword) setErrors({ ...errors, newPassword: undefined });
          }}
          disabled={isChanging}
          error={errors.newPassword}
          required
          placeholder="At least 6 characters"
        />

        {/* Confirm New Password */}
        <PasswordInput
          label="Confirm New Password"
          name="confirmPassword"
          value={confirmPassword}
          onChange={(e) => {
            setConfirmPassword(e.target.value);
            if (errors.confirmPassword) setErrors({ ...errors, confirmPassword: undefined });
          }}
          disabled={isChanging}
          error={errors.confirmPassword}
          required
          placeholder="Re-enter new password"
        />

        <div className="pt-2">
          <Button
            type="submit"
            variant="outline"
            size="sm"
            isLoading={isChanging}
            loadingText="Updating..."
            leftIcon={<Key className="w-3.5 h-3.5" />}
            className="font-semibold shadow-2xs"
          >
            Update Password
          </Button>
        </div>
      </form>
    </div>
  );
};
