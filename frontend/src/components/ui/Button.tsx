import React from 'react';
import { Loader2 } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'sage' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  loadingText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  loadingText,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  className,
  ...props
}) => {
  const baseStyles =
    'relative inline-flex items-center justify-center font-medium transition-all duration-200 cursor-pointer rounded-xl focus:outline-none focus:ring-2 focus:ring-offset-2 active:scale-[0.99] disabled:opacity-55 disabled:cursor-not-allowed disabled:active:scale-100 select-none';

  const variants = {
    primary:
      'bg-[#F4C95D] hover:bg-[#E3B443] text-[#252525] font-semibold shadow-sm hover:shadow-md shadow-[#F4C95D]/20 focus:ring-[#F4C95D] border border-[#E5B740]/60',
    secondary:
      'bg-[#FFF9EE] hover:bg-[#F7F1E5] text-[#252525] border border-[#DAD4C7] shadow-sm hover:shadow-md focus:ring-[#DAD4C7]',
    outline:
      'bg-transparent hover:bg-white/60 text-[#252525] border border-[#DAD4C7] hover:border-[#8C867B] focus:ring-[#DAD4C7]',
    ghost:
      'bg-transparent hover:bg-black/5 text-[#6F6A60] hover:text-[#252525] focus:ring-black/10',
    sage:
      'bg-[#4E7360] hover:bg-[#3F5E4E] text-white font-medium shadow-sm hover:shadow-md shadow-[#4E7360]/20 focus:ring-[#4E7360]',
    danger:
      'bg-[#D96B43] hover:bg-[#BF552F] text-white font-semibold shadow-sm hover:shadow-md shadow-[#D96B43]/20 focus:ring-[#D96B43] border border-[#BF552F]',
  };

  const sizes = {
    sm: 'text-xs px-3.5 h-9 gap-1.5',
    md: 'text-sm px-4 h-11 gap-2',
    lg: 'text-[15px] px-5 h-12 sm:h-[50px] gap-2 rounded-xl',
  };

  return (
    <button
      disabled={disabled || isLoading}
      className={twMerge(
        clsx(
          baseStyles,
          variants[variant],
          sizes[size],
          fullWidth ? 'w-full' : 'w-auto',
          className
        )
      )}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        <>
          {leftIcon && <span className="shrink-0">{leftIcon}</span>}
          <span>{children}</span>
          {rightIcon && <span className="shrink-0">{rightIcon}</span>}
        </>
      )}
    </button>
  );
};
