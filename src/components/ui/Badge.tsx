import React from 'react';
import { cn } from '../../lib/utils';

type BadgeVariant = 'default' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'outline';

interface BadgeProps {
  variant?: BadgeVariant;
  size?: 'sm' | 'md';
  className?: string;
  children: React.ReactNode;
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-primary-100 text-primary-700',
  success: 'bg-success-100 text-success-700',
  warning: 'bg-warning-100 text-warning-700',
  danger: 'bg-red-100 text-red-700',
  info: 'bg-blue-100 text-blue-700',
  accent: 'bg-accent-100 text-accent-700',
  outline: 'border border-primary-200 text-primary-600 bg-white',
};

const sizeClasses = {
  sm: 'px-2 py-0.5 text-xs',
  md: 'px-2.5 py-1 text-sm',
};

export const Badge: React.FC<BadgeProps> = ({
  variant = 'default', size = 'sm', className, children }) => {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium rounded-full',
        variantClasses[variant],
        sizeClasses[size],
        className
      )}
    >
      {children}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const statusConfig: Record<string, { variant: BadgeVariant; label: string }> = {
    todo: { variant: 'default', label: '待处理' },
    in_progress: { variant: 'warning', label: '进行中' },
    review: { variant: 'info', label: '审核中' },
    done: { variant: 'success', label: '已完成' },
  };
  
  const config = statusConfig[status] || statusConfig.todo;
  
  return <Badge variant={config.variant}>{config.label}</Badge>;
};

export const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => {
  const priorityConfig: Record<string, { variant: BadgeVariant; label: string }> = {
    low: { variant: 'default', label: '低' },
    medium: { variant: 'info', label: '中' },
    high: { variant: 'warning', label: '高' },
    urgent: { variant: 'danger', label: '紧急' },
  };
  
  const config = priorityConfig[priority] || priorityConfig.medium;
  
  return <Badge variant={config.variant}>{config.label}</Badge>;
};
