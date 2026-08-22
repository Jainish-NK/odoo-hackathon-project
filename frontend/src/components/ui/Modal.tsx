import React, { useEffect } from 'react';
import { X } from 'lucide-react';

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  maxWidth?: 'sm' | 'md' | 'lg';
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  subtitle,
  children,
  maxWidth = 'sm',
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const maxWidths = {
    sm: 'max-w-[420px]',
    md: 'max-w-[520px]',
    lg: 'max-w-[640px]',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      {/* 1. Backdrop Overlay */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* 2. Modal Dialog Card */}
      <div
        className={`relative z-10 w-full ${maxWidths[maxWidth]} my-auto max-h-[90vh] text-left flex flex-col bg-[#FFF9EE] border border-white/90 shadow-2xl rounded-[24px] p-5 sm:p-7 overflow-hidden animate-in zoom-in-95 duration-200 mx-auto`}
        style={{
          boxShadow: '0 25px 60px -15px rgba(37, 32, 21, 0.35)',
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-start justify-between pb-3 mb-2 border-b border-[#DAD4C7]/50 shrink-0">
          <div>
            <h3 className="text-[19px] sm:text-[21px] font-serif font-bold text-[#252525] leading-tight">
              {title}
            </h3>
            {subtitle && <p className="text-[12px] text-[#6F6A60] mt-0.5">{subtitle}</p>}
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-1.5 text-[#8C867B] hover:text-[#252525] hover:bg-black/5 rounded-lg transition-colors cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4.5 h-4.5" />
          </button>
        </div>

        {/* Scrollable Modal Content */}
        <div className="overflow-y-auto pr-1 -mr-1 flex-1 py-1">
          {children}
        </div>
      </div>
    </div>
  );
};
