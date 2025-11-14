import React from 'react';
import { Crown } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ProBadgeProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  inline?: boolean;
}

/**
 * ProBadge Component
 * Displays a "Pro" badge to indicate premium features
 */
export const ProBadge: React.FC<ProBadgeProps> = ({ 
  size = 'sm', 
  showText = true,
  inline = false 
}) => {
  const sizeClasses = {
    sm: 'text-xs px-1.5 py-0.5',
    md: 'text-sm px-2 py-1',
    lg: 'text-base px-3 py-1.5'
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5'
  };

  if (inline) {
    return (
      <span className={`inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold rounded ${sizeClasses[size]}`}>
        <Crown className={iconSizes[size]} />
        {showText && 'Pro'}
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white font-semibold rounded ${sizeClasses[size]}`}>
      <Crown className={iconSizes[size]} />
      {showText && 'Pro'}
    </span>
  );
};

interface ProFeatureBlockerProps {
  featureName: string;
  description?: string;
}

/**
 * ProFeatureBlocker Component
 * Displays an overlay message for features restricted to Pro users
 */
export const ProFeatureBlocker: React.FC<ProFeatureBlockerProps> = ({ 
  featureName,
  description 
}) => {
  return (
    <div className="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="mb-4">
          <div className="w-16 h-16 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center mx-auto">
            <Crown className="w-8 h-8 text-white" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {featureName} is a Pro Feature
        </h2>
        
        {description && (
          <p className="text-gray-600 mb-6">
            {description}
          </p>
        )}
        
        <p className="text-gray-700 mb-6">
          Upgrade to <span className="font-semibold text-amber-600">Pro</span> to unlock this feature and more!
        </p>
        
        <div className="flex gap-3">
          <Link
            to="/coach/settings"
            className="flex-1 bg-gradient-to-r from-yellow-400 to-amber-500 text-white px-6 py-3 rounded-lg font-semibold hover:from-yellow-500 hover:to-amber-600 transition-all"
          >
            Upgrade to Pro
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    </div>
  );
};
