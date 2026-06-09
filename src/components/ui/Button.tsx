import React from 'react';
import { cn } from '../../lib/utils';
import { Loader2 } from 'lucide-react';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-accent-500 text-white hover:bg-accent-600 focus:ring-accent-500/30 shadow-sm',
  secondary: 'bg-white text-primary-700 border border-primary-200 hover:bg-primary-50 hover:border-primary-300 focus:ring-primary-500/20',
  ghost: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-500/20',
  danger: 'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/30 shadow-sm',
  outline: 'border-2 border-primary-500 text-primary-600 hover:bg-primary-50 focus:ring-primary-500/20',
  accent: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500/30 shadow-sm',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-3 py-1.5 text-sm gap-1.5',
  md: 'px-4 py-2 text-sm gap-2',
  lg: 'px-6 py-3 text-base gap-2',
  icon: 'p-2',
};

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  className,
  children,
  disabled,
  ...props
}) => {
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200',
        'focus:outline-none focus:ring-2',
        'hover:-translate-y-0.5 active:translate-y-0',
        'disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
      disabled={disabled || loading}
      {...props}
    >
      {loading && <Loader2 className="w-4 h-4 animate-spin" />}
      {!loading && leftIcon}
      {children && <span>{children}</span>}
      {!loading && rightIcon}
    </button>
  );
};
