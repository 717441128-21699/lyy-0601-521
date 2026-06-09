import React from 'react';
import { X } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from './Button';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
  xl: 'max-w-4xl',
};

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  className,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      />
      <div
        className={cn(
          'relative bg-white rounded-xl shadow-float w-full mx-4 scale-in animate-fade-in',
          sizeClasses[size],
          className
        )}
      >
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-primary-100">
            <h3 className="text-lg font-semibold text-primary-800 font-display">
              {title}
            </h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-primary-400 hover:text-primary-600"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}
        <div className="px-6 py-4 max-h-[70vh] overflow-y-auto scrollbar-thin">
          {children}
        </div>
        {footer && (
          <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-primary-100 bg-primary-50/50 rounded-b-xl">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};
