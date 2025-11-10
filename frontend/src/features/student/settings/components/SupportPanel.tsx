import React from 'react';
import { HelpCircle } from 'lucide-react';

export const SupportPanel: React.FC<{ onContact: () => void }> = ({ onContact }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 h-max">
      <div className="p-4 sm:p-6">
        <h3 className="flex items-center gap-2 text-base sm:text-lg font-semibold text-gray-900 mb-3 sm:mb-4">
          <HelpCircle className="h-4 w-4 sm:h-5 sm:w-5" /> Need Help?
        </h3>
        <p className="text-xs sm:text-sm text-gray-600 mb-3 sm:mb-4">Our support team is here to help you with any questions or issues.</p>
        <div className="space-y-2">
          <button onClick={onContact} className="w-full bg-blue-600 text-white py-2.5 sm:py-3 rounded-2xl font-medium hover:bg-blue-700 transition-colors text-sm sm:text-base">Contact Support</button>
          <button className="w-full bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-2xl font-medium hover:bg-gray-200 transition-colors text-sm sm:text-base">Help Center</button>
        </div>
        <div className="flex items-start gap-2 text-xs text-gray-500 mt-3 sm:mt-4">
          <span className="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-gray-400" />
          <p>For security, some settings may require email verification.</p>
        </div>
      </div>
    </div>
  );
};


