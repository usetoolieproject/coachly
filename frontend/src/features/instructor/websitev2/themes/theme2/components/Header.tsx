import React from 'react';
import { Menu, Search, ShoppingCart, Phone } from 'lucide-react';

interface HeaderProps {
  brandName?: string;
  serviceText?: string;
  phoneNumber?: string;
  onTryTheme?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  brandName = "DRIVE",
  serviceText = "24/7 Service",
  phoneNumber = "(000) 123 456 7890",
  onTryTheme
}) => {
  return (
    <header className="bg-gray-900 text-white px-6 py-4">
      <div className="flex items-center justify-between">
        {/* Left Side */}
        <div className="flex items-center space-x-6">
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Menu className="w-6 h-6" />
          </button>
          
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold">{brandName}</h1>
            <div className="flex items-center space-x-2 text-sm text-gray-300">
              <Phone className="w-4 h-4" />
              <span>{serviceText}</span>
              <span>{phoneNumber}</span>
            </div>
          </div>
        </div>

        {/* Right Side */}
        <div className="flex items-center space-x-4">
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors">
            <Search className="w-6 h-6" />
          </button>
          
          <button className="p-2 hover:bg-gray-800 rounded-lg transition-colors relative">
            <ShoppingCart className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
              0
            </span>
          </button>
          
          <button 
            onClick={onTryTheme}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg font-medium hover:bg-gray-700 transition-colors"
          >
            Try theme
          </button>
        </div>
      </div>
    </header>
  );
};
