import React from 'react';

interface AuthCardProps {
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export const AuthCard: React.FC<AuthCardProps> = ({
  children,
  maxWidth = 'md',
  className = '',
}) => {
  const maxWidthClasses = {
    sm: 'max-w-[440px]',
    md: 'max-w-[540px]',
    lg: 'max-w-[800px]',
    xl: 'max-w-[860px]',
  };

  return (
    <div
      className={`w-full ${maxWidthClasses[maxWidth]} glass-card rounded-[26px] p-6 sm:p-9 transition-all duration-300 relative z-10 mx-auto ${className}`}
      style={{
        boxShadow:
          '0 20px 45px -10px rgba(45, 37, 24, 0.10), 0 0 0 1px rgba(255, 255, 255, 0.85) inset, 0 1px 3px 0 rgba(0, 0, 0, 0.04)',
      }}
    >
      {/* Subtle warm golden accent highlight line at top */}
      <div className="absolute top-0 inset-x-8 h-[2px] bg-gradient-to-r from-transparent via-[#F4C95D]/50 to-transparent rounded-full pointer-events-none" />
      {children}
    </div>
  );
};
