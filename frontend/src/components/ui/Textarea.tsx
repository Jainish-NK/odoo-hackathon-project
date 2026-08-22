import { forwardRef, useId } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertCircle } from 'lucide-react';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  helperText?: string;
  showCharCount?: boolean;
  maxLength?: number;
  containerClassName?: string;
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  (
    {
      label,
      error,
      helperText,
      showCharCount = false,
      maxLength,
      id,
      className,
      containerClassName,
      disabled,
      value,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const textareaId = id || generatedId;
    const errorId = `${textareaId}-error`;
    const helperId = `${textareaId}-helper`;

    const currentLength = typeof value === 'string' ? value.length : 0;

    return (
      <div className={twMerge('w-full flex flex-col', containerClassName)}>
        <div className="flex items-center justify-between mb-1.5">
          {label && (
            <label
              htmlFor={textareaId}
              className="text-[13px] font-medium text-[#48443E] select-none"
            >
              {label}
              {props.required && <span className="text-[#D96B43] ml-1">*</span>}
            </label>
          )}

          {showCharCount && maxLength && (
            <span className="text-[11px] text-[#8C867B]">
              {currentLength}/{maxLength}
            </span>
          )}
        </div>

        <div className="relative w-full">
          <textarea
            ref={ref}
            id={textareaId}
            disabled={disabled}
            maxLength={maxLength}
            value={value}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={twMerge(
              clsx(
                'w-full text-[14px] text-[#252525] placeholder:text-[#8C867B]/70 bg-white/85 border rounded-xl p-3.5 min-h-[110px] max-h-[160px] resize-y transition-all duration-200 focus:outline-none focus:bg-white',
                error
                  ? 'border-[#D96B43] focus:border-[#D96B43] focus:ring-4 focus:ring-[#D96B43]/15'
                  : 'border-[#DAD4C7] hover:border-[#B7B0A2] focus:border-[#E3B443] focus:ring-4 focus:ring-[#F4C95D]/20',
                disabled && 'bg-[#EFEBE3]/60 cursor-not-allowed text-[#8C867B]',
                className
              )
            )}
            {...props}
          />
        </div>

        {error ? (
          <p id={errorId} role="alert" className="text-[12px] text-[#D96B43] flex items-center gap-1.5 mt-1 animate-in fade-in">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p id={helperId} className="text-[12px] text-[#8C867B] mt-1">
            {helperText}
          </p>
        ) : null}
      </div>
    );
  }
);

Textarea.displayName = 'Textarea';
