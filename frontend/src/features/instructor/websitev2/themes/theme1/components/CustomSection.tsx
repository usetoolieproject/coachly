import React from 'react';
import { useDesignColors } from '../../../hooks/useDesignColors';

interface CustomSectionProps {
  title?: string;
  content?: string;
  alignment?: 'left' | 'center' | 'right';
  backgroundColor?: string;
  textColor?: string;
  padding?: number;
}

export const CustomSection: React.FC<CustomSectionProps> = ({
  title = "Custom Section",
  content = "Your custom content section.",
  alignment = 'left',
  backgroundColor = '#F3F4F6',
  textColor = '#000000',
  padding = 4
}) => {
  const { darkMode } = useDesignColors();
  const alignmentClass = {
    left: 'text-left',
    center: 'text-center',
    right: 'text-right'
  }[alignment];

  return (
    <div 
      className={`rounded-xl shadow-sm border ${alignmentClass} ${
        darkMode ? 'border-gray-700' : 'border-gray-100'
      }`}
      style={{ 
        backgroundColor: darkMode ? '#374151' : backgroundColor,
        color: darkMode ? '#FFFFFF' : textColor,
        padding: `${padding * 0.25}rem`
      }}
    >
      <h2 className={`text-xl font-semibold mb-4 ${
        darkMode ? 'text-white' : 'text-gray-900'
      }`}>{title}</h2>
      <p className={`${
        darkMode ? 'text-gray-300' : 'text-gray-600'
      }`}>{content}</p>
    </div>
  );
};
