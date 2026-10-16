import React from 'react';

interface AvatarGroupProps {
  avatars: { name?: string; url: string }[];
  max?: number;
  size?: 'sm' | 'md';
}

export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  avatars,
  max = 3,
  size = 'md',
}) => {
  const displayed = avatars.slice(0, max);
  const remaining = avatars.length - max;
  const sizeClasses = size === 'sm' ? 'w-6 h-6 text-[10px]' : 'w-7 h-7 text-xs';

  return (
    <div className="flex items-center -space-x-1.5 overflow-hidden">
      {displayed.map((av, idx) => (
        <img
          key={idx}
          src={av.url}
          alt={av.name || `User ${idx + 1}`}
          title={av.name}
          className={`${sizeClasses} rounded-full object-cover ring-2 ring-white shrink-0 shadow-xs`}
        />
      ))}
      {remaining > 0 && (
        <div
          className={`${sizeClasses} rounded-full bg-[#F1F5F9] text-[#64748B] font-semibold flex items-center justify-center ring-2 ring-white shrink-0`}
        >
          +{remaining}
        </div>
      )}
    </div>
  );
};
