import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({
  title,
  subtitle,
  action,
  className = '',
}) => {
  return (
    <div className={`flex flex-col sm:flex-row sm:items-end justify-between gap-3 mb-6 ${className}`}>
      <div>
        <h2 className="text-2xl sm:text-[28px] font-serif font-bold text-[#252525] tracking-tight leading-tight">
          {title}
        </h2>
        {subtitle && (
          <p className="text-[13px] sm:text-[14px] text-[#6F6A60] mt-1 font-medium">
            {subtitle}
          </p>
        )}
      </div>

      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
};
