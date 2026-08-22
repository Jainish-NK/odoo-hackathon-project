import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, ArrowRight } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { AuthCard } from '../components/auth/AuthCard';
import { Input } from '../components/ui/Input';
import { PasswordInput } from '../components/ui/PasswordInput';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { useToast } from '../context/ToastContext';
import { authService } from '../services/authService';
import { FormErrors, LoginFormData } from '../types/auth';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();

  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
    rememberMe: false,
  });

  const [errors, setErrors] = useState<FormErrors<LoginFormData>>({});
  const [touched, setTouched] = useState<Partial<Record<keyof LoginFormData, boolean>>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Forgot password modal state
  const [isForgotModalOpen, setIsForgotModalOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotError, setForgotError] = useState('');
  const [isSendingReset, setIsSendingReset] = useState(false);

  const validateField = (field: keyof LoginFormData, value: unknown): string => {
    switch (field) {
      case 'email': {
        const val = String(value || '').trim();
        if (!val) return 'Email address is required';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(val)) return 'Please enter a valid email address';
        return '';
      }
      case 'password': {
        const val = String(value || '');
        if (!val) return 'Password is required';
        if (val.length < 6) return 'Password must be at least 6 characters';
        return '';
      }
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors<LoginFormData> = {
      email: validateField('email', formData.email),
      password: validateField('password', formData.password),
    };

    setErrors(newErrors);
    return !newErrors.email && !newErrors.password;
  };

  const handleChange = (field: keyof LoginFormData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (touched[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: validateField(field, value),
      }));
    }
  };

  const handleBlur = (field: keyof LoginFormData) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({
      ...prev,
      [field]: validateField(field, formData[field]),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!validateForm()) {
      showToast('error', 'Validation Error', 'Please check the highlighted fields.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await authService.login(formData);
      if (response.success) {
        showToast('success', 'Welcome Back!', response.message);
        setTimeout(() => {
          navigate('/dashboard');
        }, 300);
      } else {
        showToast('error', 'Login Failed', response.message);
      }
    } catch {
      showToast('error', 'Authentication Error', 'An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFillDemo = () => {
    const demoData: LoginFormData = {
      email: 'aria.traveler@globetrotter.com',
      password: 'password123',
      rememberMe: true,
    };
    setFormData(demoData);
    setErrors({});
    showToast('info', 'Demo Loaded', 'Filled credentials for Aria Vance.');
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const val = forgotEmail.trim();
    if (!val) {
      setForgotError('Please enter your registered email');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(val)) {
      setForgotError('Please enter a valid email address');
      return;
    }

    setForgotError('');
    setIsSendingReset(true);
    try {
      const res = await authService.forgotPassword(val);
      showToast('success', 'Reset Link Sent', res.message);
      setIsForgotModalOpen(false);
      setForgotEmail('');
    } catch {
      showToast('error', 'Request Failed', 'Unable to send reset instructions.');
    } finally {
      setIsSendingReset(false);
    }
  };

  return (
    <AuthLayout activeRoute="login">
      <AuthCard maxWidth="sm">
        {/* Top Avatar Area: 80px balanced avatar */}
        <div className="flex flex-col items-center mb-7">
          <div className="relative mb-5">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#FFF9EE] to-[#EFE7D5] border-2 border-white shadow-md shadow-[#F4C95D]/20 flex items-center justify-center text-[#252525]">
              <div className="w-16 h-16 rounded-full bg-white/95 flex items-center justify-center border border-[#DAD4C7]/60">
                <User className="w-8 h-8 text-[#6F6A60]" />
              </div>
            </div>
            <span className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 bg-[#4E7360] rounded-full border-2 border-white" />
          </div>

          <h1 className="text-[26px] sm:text-[30px] font-serif font-bold text-[#252525] tracking-tight text-center leading-tight">
            Welcome Back
          </h1>
          <p className="text-[14px] text-[#6F6A60] mt-1.5 text-center font-medium">
            Continue your personalized journey
          </p>
        </div>

        {/* Login Form with Exact Spacing */}
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <Input
            label="Email Address"
            type="email"
            placeholder="explorer@globetrotter.com"
            autoComplete="email"
            required
            leftIcon={<Mail className="w-4 h-4" />}
            value={formData.email}
            error={touched.email ? errors.email : undefined}
            onChange={(e) => handleChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
          />

          <div>
            <PasswordInput
              label="Password"
              placeholder="Enter your password"
              autoComplete="current-password"
              required
              value={formData.password}
              error={touched.password ? errors.password : undefined}
              onChange={(e) => handleChange('password', e.target.value)}
              onBlur={() => handleBlur('password')}
            />

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between mt-3">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={formData.rememberMe}
                  onChange={(e) => handleChange('rememberMe', e.target.checked)}
                  className="w-4 h-4 rounded border-[#DAD4C7] text-[#F4C95D] focus:ring-[#F4C95D] cursor-pointer accent-[#E3B443]"
                />
                <span className="text-[13px] text-[#6F6A60] hover:text-[#252525] transition-colors">
                  Remember me
                </span>
              </label>

              <button
                type="button"
                onClick={() => {
                  setForgotEmail(formData.email || '');
                  setIsForgotModalOpen(true);
                }}
                className="text-[13px] font-medium text-[#C29326] hover:text-[#252525] transition-colors cursor-pointer"
              >
                Forgot password?
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
              loadingText="Signing in..."
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Sign In
            </Button>
          </div>
        </form>

        {/* Link to Registration */}
        <div className="mt-6 text-center text-[13px] sm:text-[14px] text-[#6F6A60]">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-semibold text-[#252525] hover:text-[#C29326] hover:underline transition-colors"
          >
            Create account
          </Link>
        </div>

        {/* Discreet Test Helper */}
        <div className="mt-4 pt-3 border-t border-[#DAD4C7]/40 text-center">
          <button
            type="button"
            onClick={handleFillDemo}
            className="text-[11px] text-[#8C867B] hover:text-[#4E7360] transition-colors cursor-pointer"
          >
            Fill demo account (for testing)
          </button>
        </div>
      </AuthCard>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={isForgotModalOpen}
        onClose={() => setIsForgotModalOpen(false)}
        title="Reset Password"
        subtitle="Enter your email to receive recovery instructions."
        maxWidth="sm"
      >
        <form onSubmit={handleForgotSubmit} className="space-y-4 mt-2">
          <Input
            label="Email Address"
            type="email"
            placeholder="you@example.com"
            value={forgotEmail}
            error={forgotError}
            onChange={(e) => {
              setForgotEmail(e.target.value);
              setForgotError('');
            }}
            leftIcon={<Mail className="w-4 h-4" />}
            required
            autoFocus
          />

          <p className="text-[12px] text-[#6F6A60] leading-relaxed">
            We will send a password reset link to your email address.
          </p>

          <div className="flex gap-2.5 pt-2">
            <Button
              type="button"
              variant="outline"
              fullWidth
              onClick={() => setIsForgotModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              fullWidth
              isLoading={isSendingReset}
              loadingText="Sending..."
            >
              Send Link
            </Button>
          </div>
        </form>
      </Modal>
    </AuthLayout>
  );
};
