import React from 'react';

export type Category = { id: string; label: string; className?: string };

type CategoriesBarProps = {
  categories: Category[];
  active: string;
  onChange: (id: string) => void;
};

const CategoriesBar: React.FC<CategoriesBarProps> = ({ categories, active, onChange }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-3 sm:p-4 mb-4 sm:mb-6">
      <div className="flex flex-wrap gap-1.5 sm:gap-2">
        {categories.map((category) => (
          <button
            key={category.id}
            onClick={() => onChange(category.id)}
            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-lg transition-colors whitespace-nowrap ${
              active === category.id ? 'bg-purple-600 text-white' : (category.className || 'bg-gray-100 text-gray-700 hover:bg-gray-200')
            }`}
          >
            {category.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default CategoriesBar;


