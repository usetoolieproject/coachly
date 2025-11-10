import React from 'react';
import { Search } from 'lucide-react';

interface FooterProps {
  brandName?: string;
  description?: string;
  price?: string;
  studioName?: string;
  features?: Array<{
    title: string;
    description: string;
    icon: React.ReactNode;
  }>;
  onWhatsIncludedClick?: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  brandName = "Drive",
  description = "Part of Krank • Drive sales with a sleek, high-performance store.",
  price = "$320 USD",
  studioName = "by Webvieta Studio",
  features = [
    {
      title: "Built for Automotive",
      description: "Perfect for auto parts, accessories, and performance shops with bold designs and conversion-driven features.",
      icon: <div className="w-8 h-8 bg-gray-800 rounded"></div>
    },
    {
      title: "Fast & Mobile-Optimized", 
      description: "Mobile-first design with lightning-fast load times and smooth navigation across all screen sizes.",
      icon: <div className="w-8 h-8 bg-gray-800 rounded"></div>
    },
    {
      title: "Boost Sales with Smart Tools",
      description: "Includes bundles, cross-sells, gifts, and more to increase average order value and drive conversions.",
      icon: <div className="w-8 h-8 bg-gray-800 rounded"></div>
    }
  ],
  onWhatsIncludedClick
}) => {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Brand Section */}
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">{brandName}</h2>
          <p className="text-gray-600 text-lg mb-2">{description}</p>
          <div className="text-2xl font-bold text-gray-900 mb-1">{price}</div>
          <div className="text-sm text-gray-500">{studioName}</div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 relative">
              {/* Feature Icon */}
              <div className="mb-4">
                {feature.icon}
              </div>
              
              {/* Feature Content */}
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed mb-4">{feature.description}</p>
              
              {/* Search Icon */}
              <div className="absolute bottom-4 right-4">
                <Search className="w-5 h-5 text-gray-400" />
              </div>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="text-center">
          <button 
            onClick={onWhatsIncludedClick}
            className="bg-gray-200 text-gray-700 px-8 py-3 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
          >
            WHAT'S INCLUDED
          </button>
        </div>
      </div>
    </div>
  );
};
