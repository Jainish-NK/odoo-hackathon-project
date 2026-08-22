import React from 'react';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';
import { ToastMessage, ToastType } from '../../types/auth';

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: string) => void;
}

const toastConfig: Record<
  ToastType,
  {
    icon: React.ComponentType<{ className?: string }>;
    bgColor: string;
    borderColor: string;
    iconColor: string;
    badgeBg: string;
  }
> = {
  success: {
    icon: CheckCircle2,
    bgColor: 'bg-[#FFF9EE]',
    borderColor: 'border-[#4E7360]/30',
    iconColor: 'text-[#4E7360]',
    badgeBg: 'bg-[#E7EFEA] text-[#334D40]',
  },
  error: {
    icon: AlertCircle,
    bgColor: 'bg-[#FFF9EE]',
    borderColor: 'border-[#D96B43]/30',
    iconColor: 'text-[#D96B43]',
    badgeBg: 'bg-[#FAECE7] text-[#BF552F]',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-[#FFF9EE]',
    borderColor: 'border-[#F4C95D]/60',
    iconColor: 'text-[#C29326]',
    badgeBg: 'bg-[#FCFAF5] text-[#916710]',
  },
  info: {
    icon: Info,
    bgColor: 'bg-[#FFF9EE]',
    borderColor: 'border-[#6F6A60]/30',
    iconColor: 'text-[#6F6A60]',
    badgeBg: 'bg-[#EFEBE3] text-[#48443E]',
  },
};

export const ToastItem: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  const config = toastConfig[toast.type];
  const IconComponent = config.icon;

  return (
    <div
      role="alert"
      className={`flex items-start gap-3.5 p-4 rounded-2xl border shadow-xl backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-top-4 w-full max-w-sm pointer-events-auto ${config.bgColor} ${config.borderColor}`}
      style={{
        boxShadow: '0 12px 30px -8px rgba(45, 37, 24, 0.18)',
      }}
    >
      <div className={`p-2 rounded-xl shrink-0 ${config.badgeBg}`}>
        <IconComponent className="w-5 h-5" />
      </div>

      <div className="flex-1 min-w-0 pt-0.5">
        <h4 className="text-sm font-semibold text-[#252525] tracking-tight">{toast.title}</h4>
        <p className="text-xs text-[#6F6A60] mt-0.5 leading-relaxed break-words">{toast.message}</p>
      </div>

      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="text-[#8C867B] hover:text-[#252525] transition-colors p-1 rounded-lg hover:bg-black/5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export const ToastContainer: React.FC<{
  toasts: ToastMessage[];
  onDismiss: (id: string) => void;
}> = ({ toasts, onDismiss }) => {
  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      aria-atomic="true"
      className="fixed top-5 right-5 z-50 flex flex-col gap-2.5 max-w-md w-full px-4 pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>
  );
};
