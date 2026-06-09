import React from 'react';
import { User } from 'lucide-react';
import { cn } from '../../lib/utils';

interface AvatarProps {
  src?: string;
  name?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  online?: boolean;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-lg',
  xl: 'w-16 h-16 text-2xl',
};

export const Avatar: React.FC<AvatarProps> = ({
  src,
  name = '',
  size = 'md',
  className,
  online = false,
}) => {
  const initials = name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const getColor = (name: string) => {
    const colors = [
      'bg-accent-500',
      'bg-primary-500',
      'bg-success-500',
      'bg-warning-500',
      'bg-purple-500',
      'bg-pink-500',
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  return (
    <div className={cn('relative inline-flex', className)}>
      {src ? (
        <img
          src={src}
          alt={name}
          className={cn(
            'rounded-full object-cover ring-2 ring-white',
            sizeClasses[size]
          )}
        />
      ) : (
        <div
          className={cn(
            'rounded-full flex items-center justify-center text-white font-medium ring-2 ring-white',
            sizeClasses[size],
            getColor(name)
          )}
        >
          {initials || <User className={size === 'xs' ? 'w-3 h-3' : 'w-5 h-5'} />}
        </div>
      )}
      {online && (
        <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full ring-2 ring-white" />
      )}
    </div>
  );
};

interface AvatarGroupProps {
  users: Array<{ avatar?: string; name: string }>;
  max?: number;
  size?: AvatarProps['size'];
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  users,
  max = 3,
  size = 'sm',
}) => {
  const visibleUsers = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex -space-x-2">
      {visibleUsers.map((user, index) => (
        <Avatar
          key={index}
          src={user.avatar}
          name={user.name}
          size={size}
          className="z-10"
        />
      ))}
      {remaining > 0 && (
        <div
          className={cn(
            'rounded-full bg-primary-100 text-primary-600 flex items-center justify-center font-medium text-xs ring-2 ring-white',
            sizeClasses[size]
          )}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};
