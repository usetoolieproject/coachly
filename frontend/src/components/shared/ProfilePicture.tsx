import React from 'react';

interface ProfilePictureProps {
  src?: string;
  firstName: string;
  lastName: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const ProfilePicture: React.FC<ProfilePictureProps> = ({
  src,
  firstName,
  lastName,
  size = 'md',
  className = ''
}) => {
  const getUserInitials = (firstName: string, lastName: string) => {
    return `${firstName[0]}${lastName[0]}`.toUpperCase();
  };

  const getUserColor = (name: string) => {
    const colors = [
      'bg-purple-500', 'bg-blue-500', 'bg-green-500', 'bg-yellow-500',
      'bg-red-500', 'bg-indigo-500', 'bg-pink-500', 'bg-gray-500'
    ];
    const index = name.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[index % colors.length];
  };

  const sizeClasses = {
    sm: 'w-8 h-8 text-sm',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg'
  };

  if (src) {
    return (
      <img
        src={src}
        alt={`${firstName} ${lastName}`}
        className={`${sizeClasses[size]} rounded-full object-cover ${className}`}
        onError={(e) => {
          // Fallback to initials if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const parent = target.parentNode as HTMLElement;
          if (parent) {
            parent.innerHTML = `
              <div class="${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold ${getUserColor(firstName + lastName)} ${className}">
                ${getUserInitials(firstName, lastName)}
              </div>
            `;
          }
        }}
      />
    );
  }

  return (
    <div className={`${sizeClasses[size]} rounded-full flex items-center justify-center text-white font-semibold ${getUserColor(firstName + lastName)} ${className}`}>
      {getUserInitials(firstName, lastName)}
    </div>
  );
};

export default ProfilePicture;