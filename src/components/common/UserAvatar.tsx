import React, { useState, useEffect } from 'react';

export interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  title?: string;
}

const sizeClasses = {
  xs: 'w-6 h-6 text-[10px]',
  sm: 'w-8 h-8 text-xs',
  md: 'w-10 h-10 text-sm',
  lg: 'w-14 h-14 text-lg',
  xl: 'w-24 h-24 text-2xl font-bold',
};

export const UserAvatar: React.FC<UserAvatarProps> = ({
  name,
  avatarUrl,
  size = 'md',
  className = '',
  onClick,
  title,
}) => {
  const [imageError, setImageError] = useState(false);

  // A new photo deserves a fresh attempt
  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  // Derive 1-2 initials from name
  const initials = React.useMemo(() => {
    if (!name || !name.trim()) return 'IN';
    const parts = name.trim().split(/\s+/);
    if (parts.length === 1) {
      return parts[0].slice(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }, [name]);

  const hasValidPhoto = Boolean(avatarUrl && !imageError);

  const containerClasses = `
    relative rounded-full overflow-hidden select-none shrink-0 flex items-center justify-center
    bg-[#087E83] text-white font-bold
    ${sizeClasses[size]}
    ${onClick ? 'cursor-pointer hover:ring-2 hover:ring-[#087E83] hover:ring-offset-2 transition-all' : ''}
    ${className}
  `.trim();

  return (
    <div
      className={containerClasses}
      onClick={onClick}
      title={title || name}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={e => {
        if (onClick && (e.key === 'Enter' || e.key === ' ')) {
          e.preventDefault();
          onClick();
        }
      }}
    >
      {hasValidPhoto ? (
        <img
          src={avatarUrl!}
          alt={name}
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
          onError={() => setImageError(true)}
        />
      ) : (
        <span className="tracking-tight uppercase font-semibold">{initials}</span>
      )}
    </div>
  );
};