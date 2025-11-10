import React from 'react';
import { Check } from 'lucide-react';

const features = [
  {
    title: "Course Platform",
    description: "Create unlimited courses with video lessons, quizzes, and certificates."
  },
  {
    title: "Community Hub",
    description: "Build engaged communities where students connect and support each other."
  },
  {
    title: "Live Calls",
    description: "Schedule and host live sessions with calendar integration and recordings."
  },
  {
    title: "Content Calendar",
    description: "Plan and schedule all your content visually."
  },
  {
    title: "Branded Website",
    description: "Custom domain, SEO optimized, and mobile responsive."
  },
  {
    title: "Advanced Analytics",
    description: "Track engagement, revenue, and growth in one dashboard."
  }
];

export const FeaturesSection: React.FC = () => {
  return (
    <div className="bg-gradient-to-br from-blue-50 via-blue-50/50 to-white rounded-xl shadow-2xl border border-gray-200 p-8 flex flex-col my-20 hover:shadow-3xl hover:-translate-y-1 transition-all duration-300">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-3 mt-12">Why Coaches & Creators Love Coachly</h2>
        <p className="text-gray-700 mb-8">Everything you need to build, teach, and grow — all in one platform.</p>
      </div>
      
      <div className="space-y-4">
        {features.map((feature, index) => (
          <div key={index} className="flex items-start">
            <Check className="w-6 h-6 text-green-600 flex-shrink-0 mt-0.5" />
            <div className="ml-3">
              <p className="text-gray-700">
                <strong>{feature.title}</strong> — {feature.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

