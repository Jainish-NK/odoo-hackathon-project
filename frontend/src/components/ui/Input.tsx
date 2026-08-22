import { forwardRef, useId } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AlertCircle } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  containerClassName?: string;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
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
    const inputId = id || generatedId;
    const errorId = `${inputId}-error`;
    const helperId = `${inputId}-helper`;

    return (
      <div className={twMerge('w-full flex flex-col', containerClassName)}>
        {label && (
          <label
            htmlFor={inputId}
            className="text-[13px] font-medium text-[#48443E] mb-1.5 select-none flex items-center justify-between"
          >
            <span>
              {label}
              {props.required && <span className="text-[#D96B43] ml-1">*</span>}
            </span>
          </label>
        )}

        <div className="relative flex items-center w-full">
          {leftIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[#8C867B] shrink-0">
              {leftIcon}
            </div>
          )}

          <input
            ref={ref}
            id={inputId}
            disabled={disabled}
            value={value !== undefined ? value : ''}
            aria-invalid={Boolean(error)}
            aria-describedby={error ? errorId : helperText ? helperId : undefined}
            className={twMerge(
              clsx(
                'w-full h-12 text-[14px] text-[#252525] placeholder:text-[#8C867B]/70 bg-white/85 border rounded-xl px-3.5 transition-all duration-200 focus:outline-none focus:bg-white',
                leftIcon ? 'pl-11' : 'pl-3.5',
                rightIcon ? 'pr-11' : 'pr-3.5',
                error
                  ? 'border-[#D96B43] focus:border-[#D96B43] focus:ring-4 focus:ring-[#D96B43]/15'
                  : 'border-[#DAD4C7] hover:border-[#B7B0A2] focus:border-[#E3B443] focus:ring-4 focus:ring-[#F4C95D]/20',
                disabled && 'bg-[#EFEBE3]/60 cursor-not-allowed text-[#8C867B]',
                className
              )
            )}
            {...props}
          />

          {rightIcon && (
            <div className="absolute right-3.5 flex items-center text-[#8C867B] pointer-events-none">
              {rightIcon}
            </div>
          )}
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

Input.displayName = 'Input';
