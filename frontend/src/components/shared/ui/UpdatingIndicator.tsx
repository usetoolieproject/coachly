import React from 'react';

type Props = {
  isUpdating?: boolean;
  className?: string;
  label?: string;
};

export const UpdatingIndicator: React.FC<Props> = ({ isUpdating, className = '', label = 'Updating…' }) => {
  if (!isUpdating) return null;
  return (
    <div className={`inline-flex items-center text-xs text-slate-500 whitespace-nowrap ${className}`}>
      <span className="mr-1 h-2 w-2 rounded-full bg-emerald-500 animate-pulse" /> {label}
    </div>
  );
};


