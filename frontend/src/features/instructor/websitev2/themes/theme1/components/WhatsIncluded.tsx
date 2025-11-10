import React from 'react';
import { useDesignColors } from '../../../hooks/useDesignColors';
import { BookOpen, Users, Video } from 'lucide-react';

interface WhatsIncludedItem {
  id: string;
  title: string;
  icon: 'courses' | 'community' | 'sessions';
}

interface WhatsIncludedProps {
  title?: string;
  items?: WhatsIncludedItem[];
  alignment?: string;
  showCourses?: boolean;
  showCommunity?: boolean;
  showSessions?: boolean;
  padding?: number;
  allSectionData?: any;
}

const getDefaultItems = (): WhatsIncludedItem[] => [
  {
    id: 'courses',
    title: 'Courses',
    icon: 'courses'
  },
  {
    id: 'community',
    title: 'Community',
    icon: 'community'
  },
  {
    id: 'sessions',
    title: 'Live Sessions',
    icon: 'sessions'
  }
];


export const WhatsIncluded: React.FC<WhatsIncludedProps> = ({
  title = "What's Included",
  alignment = 'left',
  showCourses = true,
  showCommunity = true,
  showSessions = true,
  padding = 4,
  allSectionData
}) => {
  const { darkMode } = useDesignColors({ allSectionData });
  const defaultItems = getDefaultItems();
  // Always use dynamic items, ignore static items from store
  const displayItems = defaultItems;
  // Filter items based on checkbox values
  const filteredItems = displayItems.filter(item => {
    switch (item.id) {
      case 'courses':
        return showCourses;
      case 'community':
        return showCommunity;
      case 'sessions':
        return showSessions;
      default:
        return true;
    }
  });
  return (
    <div className="my-4 sm:my-6 md:my-8">
      <div className={`rounded-2xl shadow-sm p-4 md:p-5 ${
        darkMode ? 'bg-gray-800' : 'bg-white'
      }`}>
        <h2 
          className={`text-lg sm:text-xl md:text-2xl font-semibold mb-4 sm:mb-5 md:mb-6 px-2 sm:px-3 md:px-0 ${
            darkMode ? 'text-white' : 'text-gray-900'
          }`}
          style={{ textAlign: alignment as any }}
        >
          {title}
        </h2>
        
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className={`rounded-xl p-4 text-center transition-shadow ${
                darkMode 
                  ? 'bg-gray-700' 
                  : 'bg-gray-50'
              }`}
            >
              {/* Icon Container */}
              <div className="text-2xl sm:text-2xl md:text-3xl mb-2 sm:mb-2.5 md:mb-3">
                {item.icon === 'courses' && '📚'}
                {item.icon === 'community' && '👥'}
                {item.icon === 'sessions' && '📹'}
              </div>
              
              {/* Title */}
              <h3 className={`text-base sm:text-lg md:text-xl font-semibold ${
                darkMode ? 'text-white' : 'text-gray-900'
              }`}>
                {item.title}
              </h3>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};