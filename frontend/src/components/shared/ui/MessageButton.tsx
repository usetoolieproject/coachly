import React from 'react';
import { Mail } from 'lucide-react';

type Props = {
  onClick?: () => void;
  className?: string;
  children?: React.ReactNode;
};

export const MessageButton: React.FC<Props> = ({ onClick, className = '', children = 'Message' }) => {
  return (
    <button 
      onClick={onClick}
      className={`border border-gray-200 bg-white rounded-md px-3 py-2 text-sm gap-2 text-slate-600 hover:bg-gray-50 flex items-center ${className}`}
    >
      <Mail className="h-4 w-4 text-purple-500" /> {children}
    </button>
  );
};


