import { useState, forwardRef } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { Input, InputProps } from './Input';

export interface PasswordInputProps extends Omit<InputProps, 'type' | 'leftIcon' | 'rightIcon'> {
  showStrengthMeter?: boolean;
}

export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ showStrengthMeter = false, value, onChange, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleVisibility = () => {
      setShowPassword((prev) => !prev);
    };

    const getStrength = (pwd: string): { score: number; label: string; color: string } => {
      if (!pwd) return { score: 0, label: '', color: 'bg-transparent' };
      let score = 0;
      if (pwd.length >= 8) score += 1;
      if (/[A-Z]/.test(pwd)) score += 1;
      if (/[0-9]/.test(pwd)) score += 1;
      if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

      switch (score) {
        case 1:
          return { score: 25, label: 'Weak', color: 'bg-[#D96B43]' };
        case 2:
          return { score: 50, label: 'Fair', color: 'bg-[#E3B443]' };
        case 3:
          return { score: 75, label: 'Good', color: 'bg-[#4E7360]' };
        case 4:
          return { score: 100, label: 'Strong', color: 'bg-[#334D40]' };
        default:
          return { score: 15, label: 'Short', color: 'bg-[#D96B43]' };
      }
    };

    const strength = showStrengthMeter ? getStrength(String(value || '')) : null;

    return (
      <div className="w-full flex flex-col">
        <Input
          ref={ref}
          type={showPassword ? 'text' : 'password'}
          leftIcon={<Lock className="w-4 h-4" />}
          rightIcon={
            <button
              type="button"
              onClick={toggleVisibility}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
              className="p-1.5 text-[#8C867B] hover:text-[#252525] focus:outline-none transition-colors rounded-lg hover:bg-black/5 cursor-pointer"
              tabIndex={0}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          }
          value={value}
          onChange={onChange}
          {...props}
        />

        {showStrengthMeter && value && String(value).length > 0 && strength && (
          <div className="mt-1.5 px-0.5 animate-in fade-in">
            <div className="flex items-center justify-between text-[11px] font-medium text-[#6F6A60] mb-1">
              <span>Password strength</span>
              <span className="font-semibold text-[#252525]">{strength.label}</span>
            </div>
            <div className="w-full bg-[#EFEBE3] h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${strength.color}`}
                style={{ width: `${strength.score}%` }}
              />
            </div>
          </div>
        )}
      </div>
    );
  }
);

PasswordInput.displayName = 'PasswordInput';
