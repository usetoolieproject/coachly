import React from 'react';
import { Users, Headphones, BookOpen } from 'lucide-react';

interface CommunityCardProps {
  communityName: string;
  members: number;
  support: string;
  courses: number;
  price: number;
  onJoinClick?: () => void;
}

export const CommunityCard: React.FC<CommunityCardProps> = ({
  communityName,
  members,
  support,
  courses,
  price,
  onJoinClick
}) => {
  return (
    <div className="bg-white rounded-xl p-3 sm:p-4 lg:p-6 shadow-sm border border-gray-100">
      {/* Community Header */}
      <div className="flex items-center space-x-2 sm:space-x-2 lg:space-x-3 mb-3 sm:mb-4 lg:mb-6">
        <div className="w-6 h-6 sm:w-8 sm:h-8 lg:w-10 lg:h-10 bg-purple-600 rounded-full flex items-center justify-center">
          <span className="text-white font-bold text-xs sm:text-xs lg:text-sm">
            {communityName.charAt(0)}
          </span>
        </div>
        <div className="text-xs sm:text-xs lg:text-sm text-gray-600 truncate">
          {communityName}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-1 sm:gap-2 lg:gap-4 mb-3 sm:mb-4 lg:mb-6">
        <div className="text-center">
          <Users className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-400 mx-auto mb-1" />
          <div className="text-xs sm:text-sm lg:text-lg font-semibold text-gray-900">{members}k</div>
          <div className="text-xs text-gray-500">Members</div>
        </div>
        <div className="text-center">
          <Headphones className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-400 mx-auto mb-1" />
          <div className="text-xs sm:text-sm lg:text-lg font-semibold text-gray-900">{support}</div>
          <div className="text-xs text-gray-500">Support</div>
        </div>
        <div className="text-center">
          <BookOpen className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 text-gray-400 mx-auto mb-1" />
          <div className="text-xs sm:text-sm lg:text-lg font-semibold text-gray-900">{courses}</div>
          <div className="text-xs text-gray-500">Courses</div>
        </div>
      </div>

      {/* Price */}
      <div className="bg-blue-50 text-blue-600 text-center py-1 sm:py-2 rounded-lg mb-2 sm:mb-3 lg:mb-4 font-semibold text-xs sm:text-sm lg:text-base">
        ${price}/month
      </div>

      {/* Join Button */}
      <button 
        onClick={onJoinClick}
        className="w-full bg-purple-600 text-white py-1.5 sm:py-2 lg:py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors mb-1 sm:mb-2 lg:mb-3 text-xs sm:text-sm lg:text-base"
      >
        JOIN COMMUNITY
      </button>

      {/* Trial Info */}
      <div className="text-xs text-gray-500 text-center">
        7-day free trial - Cancel anytime - No commitment
      </div>
    </div>
  );
};
