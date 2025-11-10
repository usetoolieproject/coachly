import React from 'react';

interface StickyCTAProps {
  label?: string;
  href?: string;
}

export const StickyCTA: React.FC<StickyCTAProps> = ({ label = 'Join Free', href = '#offer-box' }) => {
  return (
    <div className="fixed inset-x-0 bottom-0 z-40 md:hidden pointer-events-none">
      <div className="mx-4 mb-4 rounded-xl bg-purple-600 text-white shadow-lg pointer-events-auto">
        <a
          href={href}
          className="block w-full px-4 py-3 text-center font-semibold focus:outline-none focus:ring-2 focus:ring-white/70 rounded-xl"
        >
          {label}
        </a>
      </div>
    </div>
  );
};


