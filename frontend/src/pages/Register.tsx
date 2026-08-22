import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Phone, MapPin, Globe2, User as UserIcon, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthCard } from '../components/auth/AuthCard';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Textarea } from '../components/ui/Textarea';
import { AvatarUpload } from '../components/ui/AvatarUpload';
import { Button } from '../components/ui/Button';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { FormErrors, RegisterFormData } from '../types/auth';

export const Register: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<RegisterFormData>({
    avatar: null,
    avatarPreviewUrl: undefined,
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    city: '',
    country: '',
    password: '',
    confirmPassword: '',
    additionalInfo: '',
  });

  const [errors, setErrors] = useState<FormErrors<RegisterFormData>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof RegisterFormData, boolean>>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  const validateField = (field: keyof RegisterFormData, value: unknown): string => {
    switch (field) {
      case 'firstName': {
        const val = String(value || '').trim();
        if (!val) return 'First name is required';
        if (val.length < 2) return 'At least 2 characters';
        return '';
      }
      case 'lastName': {
        const val = String(value || '').trim();
        if (!val) return 'Last name is required';
        if (val.length < 2) return 'At least 2 characters';
        return '';
      }
      case 'email': {
        const val = String(value || '').trim();
        if (!val) return 'Email address is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) return 'Please enter a valid email';
        return '';
      }
      case 'phoneNumber': {
        const val = String(value || '').trim();
        if (!val) return 'Phone number is required';
        const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{6,15}$/;
        if (!phoneRegex.test(val)) return 'Please enter a valid phone number';
        return '';
      }
      case 'city': {
        const val = String(value || '').trim();
        if (!val) return 'City is required';
        return '';
      }
      case 'country': {
        const val = String(value || '').trim();
        if (!val) return 'Country is required';
        return '';
      }
      case 'password': {
        const val = String(value || '');
        if (!val) return 'Password is required';
        if (val.length < 6) return 'At least 6 characters';
        return '';
      }
      case 'confirmPassword': {
        const val = String(value || '');
        if (!val) return 'Please confirm your password';
        if (val !== formData.password) return 'Passwords do not match';
        return '';
      }
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors<RegisterFormData> = {
      firstName: validateField('firstName', formData.firstName),
      lastName: validateField('lastName', formData.lastName),
      email: validateField('email', formData.email),
      phoneNumber: validateField('phoneNumber', formData.phoneNumber),
      city: validateField('city', formData.city),
      country: validateField('country', formData.country),
      password: validateField('password', formData.password),
      confirmPassword: validateField('confirmPassword', formData.confirmPassword),
    };

    setErrors(newErrors);
    return !Object.values(newErrors).some((err) => Boolean(err));
  };

  const handleChange = (field: keyof RegisterFormData, value: unknown) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, value),
      }));
    }

    if (field === 'password' && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: formData.confirmPassword !== value ? 'Passwords do not match' : '',
      }));
    }
  };

  const handleBlur = (field: keyof RegisterFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, formData[field]),
    }));
  };

  const handleAvatarChange = (file: File | null, previewUrl?: string) => {
    setFormData((prev) => ({
      ...prev,
      avatar: file,
      avatarPreviewUrl: previewUrl,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      phoneNumber: true,
      city: true,
      country: true,
      password: true,
      confirmPassword: true,
    });

    if (!validateForm()) {
      showToast('error', 'Validation Error', 'Please complete all required fields correctly.');
      return;
    }

    if (!agreeTerms) {
      showToast('warning', 'Terms & Conditions', 'Please accept the Terms of Service to continue.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.register(formData);
      if (response.success) {
        showToast('success', 'Account Created!', response.message);

        const redirectTarget =
          (location.state as { from?: string })?.from ||
          new URLSearchParams(location.search).get('redirect') ||
          '/dashboard';

        setTimeout(() => {
          navigate(redirectTarget, { replace: true });
        }, 300);
      } else {
        showToast('error', 'Registration Failed', response.message);
      }
    } catch {
      showToast('error', 'Registration Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutofillTraveler = () => {
    const sampleData: RegisterFormData = {
      avatar: null,
      avatarPreviewUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80',
      firstName: 'Elena',
      lastName: 'Rostova',
      email: `elena.${Math.floor(Math.random() * 1000)}@wanderlust.travel`,
      phoneNumber: '+1 (555) 789-0123',
      city: 'Florence',
      country: 'Italy',
      password: 'wanderlust2026',
      confirmPassword: 'wanderlust2026',
      additionalInfo: 'Lover of Renaissance architecture, Tuscan vineyard tours, and local culinary gems.',
    };

    setFormData(sampleData);
    setErrors({});
    showToast('info', 'Demo Profile Loaded', 'Filled sample profile data for Elena Rostova.');
  };

  return (
    <AuthLayout activeRoute="register">
      <AuthCard maxWidth="lg">
        {/* Header with Title & Subtitle */}
        <div className="flex flex-col items-center mb-6 text-center">
          <h1 className="text-[26px] sm:text-[30px] font-serif font-bold text-[#252525] tracking-tight leading-tight">
            Create Your Account
          </h1>
          <p className="text-[14px] text-[#6F6A60] mt-1 font-medium">
            Join GlobeTrotter and start planning your next journey
          </p>
        </div>

        {/* Profile Avatar Upload Section */}
        <div className="mb-6 pb-5 border-b border-[#DAD4C7]/50 flex justify-center">
          <AvatarUpload
            previewUrl={formData.avatarPreviewUrl}
            onChange={handleAvatarChange}
          />
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {/* Section: Personal Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="First Name"
              placeholder="Elena"
              autoComplete="given-name"
              required
              leftIcon={<UserIcon className="w-4 h-4" />}
              value={formData.firstName}
              error={touched.firstName ? errors.firstName : undefined}
              onChange={(e) => handleChange('firstName', e.target.value)}
              onBlur={() => handleBlur('firstName')}
            />

            <Input
              label="Last Name"
              placeholder="Rostova"
              autoComplete="family-name"
              required
              leftIcon={<UserIcon className="w-4 h-4" />}
              value={formData.lastName}
              error={touched.lastName ? errors.lastName : undefined}
              onChange={(e) => handleChange('lastName', e.target.value)}
              onBlur={() => handleBlur('lastName')}
            />
          </div>

          {/* Section: Contact Information */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="elena@wanderlust.travel"
              autoComplete="email"
              required
              leftIcon={<Mail className="w-4 h-4" />}
              value={formData.email}
              error={touched.email ? errors.email : undefined}
              onChange={(e) => handleChange('email', e.target.value)}
              onBlur={() => handleBlur('email')}
            />

            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 789-0123"
              autoComplete="tel"
              required
              leftIcon={<Phone className="w-4 h-4" />}
              value={formData.phoneNumber}
              error={touched.phoneNumber ? errors.phoneNumber : undefined}
              onChange={(e) => handleChange('phoneNumber', e.target.value)}
              onBlur={() => handleBlur('phoneNumber')}
            />
          </div>

          {/* Section: Location */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="City"
              placeholder="Florence"
              autoComplete="address-level2"
              required
              leftIcon={<MapPin className="w-4 h-4" />}
              value={formData.city}
              error={touched.city ? errors.city : undefined}
              onChange={(e) => handleChange('city', e.target.value)}
              onBlur={() => handleBlur('city')}
            />

            <Input
              label="Country"
              placeholder="Italy"
              autoComplete="country-name"
              required
              leftIcon={<Globe2 className="w-4 h-4" />}
              value={formData.country}
              error={touched.country ? errors.country : undefined}
              onChange={(e) => handleChange('country', e.target.value)}
              onBlur={() => handleBlur('country')}
            />
          </div>

          {/* Section: Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <PasswordInput
              label="Password"
              placeholder="Create password (6+ characters)"
              autoComplete="new-password"
              required
              showStrengthMeter
              value={formData.password}
              error={touched.password ? errors.password : undefined}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
            />

            <PasswordInput
              label="Confirm Password"
              placeholder="Confirm password"
              autoComplete="new-password"
              required
              value={formData.confirmPassword}
              error={touched.confirmPassword ? errors.confirmPassword : undefined}
              onChange={(e) => handleChange('confirmPassword', e.target.value)}
              onBlur={() => handleBlur('confirmPassword')}
            />
          </div>

          {/* Section: Additional Information */}
          <Textarea
            label="Additional Information"
            placeholder="Tell us about yourself, your travel preferences, dream destinations, or places you love..."
            showCharCount
            maxLength={500}
            value={formData.additionalInfo}
            onChange={(e) => handleChange('additionalInfo', e.target.value)}
            helperText="Helps GlobeTrotter personalize your custom itinerary suggestions."
          />

          {/* Terms Agreement */}
          <div className="flex items-start gap-2.5 pt-1">
            <input
              type="checkbox"
              id="terms-check"
              checked={agreeTerms}
              onChange={(e) => setAgreeTerms(e.target.checked)}
              className="mt-0.5 w-4 h-4 rounded border-[#DAD4C7] text-[#F4C95D] focus:ring-[#F4C95D] cursor-pointer accent-[#E3B443]"
            />
            <label htmlFor="terms-check" className="text-[13px] text-[#6F6A60] cursor-pointer leading-relaxed select-none">
              I agree to the{' '}
              <span className="font-semibold text-[#252525] underline cursor-pointer">Terms of Service</span>{' '}
              and{' '}
              <span className="font-semibold text-[#252525] underline cursor-pointer">Privacy Policy</span>.
            </label>
          </div>

          {/* Submit CTA Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              loadingText="Creating Account..."
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Create Account
            </Button>
          </div>
        </form>

        {/* Link to Login */}
        <div className="mt-6 text-center text-[13px] sm:text-[14px] text-[#6F6A60]">
          Already have an account?{' '}
          <Link
            to="/login"
            className="font-semibold text-[#252525] hover:text-[#C29326] hover:underline transition-colors"
          >
            Sign in
          </Link>
        </div>

        {/* Discreet Test Helper */}
        <div className="mt-4 pt-3 border-t border-[#DAD4C7]/40 text-center">
          <button
            type="button"
            onClick={handleAutofillTraveler}
            className="text-[11px] text-[#8C867B] hover:text-[#4E7360] transition-colors cursor-pointer"
          >
            Fill sample profile (for testing)
          </button>
        </div>
      </AuthCard>
    </AuthLayout>
  );
};
