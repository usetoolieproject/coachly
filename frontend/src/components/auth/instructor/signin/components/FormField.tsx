import React from 'react';
import { LucideIcon } from 'lucide-react';

interface FormFieldProps {
  label: string;
  name: string;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  icon?: LucideIcon;
  error?: string;
  showIcon?: boolean;
  rightIcon?: React.ReactNode;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  name,
  type = "text",
  value,
  onChange,
  placeholder,
  icon: Icon,
  error,
  showIcon = true,
  rightIcon,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        {Icon && showIcon && (
          <Icon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        )}
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full ${Icon && showIcon ? 'pl-10' : 'pl-4'} ${rightIcon ? 'pr-10' : 'pr-4'} py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            error ? "border-red-300" : "border-gray-300"
          }`}
          placeholder={placeholder}
        />
        {rightIcon}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

