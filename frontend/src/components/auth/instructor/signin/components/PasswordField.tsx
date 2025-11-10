import React from 'react';
import { Lock, Eye, EyeOff } from 'lucide-react';

interface PasswordFieldProps {
  label: string;
  name: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  showPassword: boolean;
  onTogglePassword: () => void;
  error?: string;
  placeholder?: string;
  showToggle?: boolean;
}

export const PasswordField: React.FC<PasswordFieldProps> = ({
  label,
  name,
  value,
  onChange,
  showPassword,
  onTogglePassword,
  error,
  placeholder = "••••••••",
  showToggle = true,
}) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type={showPassword ? "text" : "password"}
          name={name}
          value={value}
          onChange={onChange}
          className={`w-full pl-10 pr-10 py-2.5 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
            error ? "border-red-300" : "border-gray-300"
          }`}
          placeholder={placeholder}
        />
        {showToggle && (
          <button
            type="button"
            onClick={onTogglePassword}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
      </div>
      {error && (
        <p className="text-red-500 text-xs mt-1">{error}</p>
      )}
    </div>
  );
};

