import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

interface FilterSidebarProps {
  categories: string[];
  selectedCategories: string[];
  onCategoryChange: (categories: string[]) => void;
  selectedPrice: string;
  onPriceChange: (price: string) => void;
}

export const FilterSidebar: React.FC<FilterSidebarProps> = ({
  categories,
  selectedCategories,
  onCategoryChange,
  selectedPrice,
  onPriceChange
}) => {
  const [expandedSections, setExpandedSections] = useState({
    price: true,
    category: true
  });

  const toggleSection = (section: string) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCategoryToggle = (category: string) => {
    if (selectedCategories.includes(category)) {
      onCategoryChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoryChange([...selectedCategories, category]);
    }
  };

  const priceOptions = [
    { value: 'all', label: 'All', count: 9 },
    { value: 'free', label: 'Free', count: 9 },
    { value: 'paid', label: 'Paid', count: 0 }
  ];

  return (
    <div className="w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 h-full overflow-y-auto">
      {/* Price Filter */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <button
          onClick={() => toggleSection('price')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="font-medium text-gray-900 dark:text-white">Price</span>
          {expandedSections.price ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        {expandedSections.price && (
          <div className="px-4 pb-4 space-y-2">
            {priceOptions.map((option) => (
              <label key={option.value} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="price"
                  value={option.value}
                  checked={selectedPrice === option.value}
                  onChange={(e) => onPriceChange(e.target.value)}
                  className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {option.label}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  ({option.count})
                </span>
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Category Filter */}
      <div>
        <button
          onClick={() => toggleSection('category')}
          className="w-full flex items-center justify-between p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <span className="font-medium text-gray-900 dark:text-white">Industry</span>
          {expandedSections.category ? (
            <ChevronUp className="w-4 h-4 text-gray-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-gray-500" />
          )}
        </button>
        
        {expandedSections.category && (
          <div className="px-4 pb-4 space-y-2">
            {categories.map((category) => (
              <label key={category} className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCategories.includes(category)}
                  onChange={() => handleCategoryToggle(category)}
                  className="w-4 h-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  {category}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
