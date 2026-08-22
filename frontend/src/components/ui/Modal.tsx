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
    sm: 'max-w-[400px]',
    md: 'max-w-[480px]',
    lg: 'max-w-[560px]',
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <div
        className={`relative w-full ${maxWidths[maxWidth]} bg-[#FFF9EE] border border-white/80 shadow-2xl rounded-[24px] p-6 sm:p-7 z-10 animate-in zoom-in-95 duration-200 mx-auto`}
        style={{
          boxShadow: '0 20px 50px -12px rgba(37, 32, 21, 0.22)',
        }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-[20px] font-serif font-bold text-[#252525] leading-tight">{title}</h3>
            {subtitle && <p className="text-[13px] text-[#6F6A60] mt-1">{subtitle}</p>}
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

        <div>{children}</div>
      </div>
    </div>
  );
};
