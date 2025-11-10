import React from 'react';
import { Plus } from 'lucide-react';

export const StartFromScratchThumbnail: React.FC = () => {
  return (
    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 bg-white rounded-lg mx-auto mb-3 flex items-center justify-center shadow-sm">
          <Plus className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm text-gray-600 font-medium">Blank Canvas</p>
      </div>
    </div>
  );
};
