import React from 'react';

const BackgroundBlobs: React.FC = () => {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
      {/* Mobile: Smaller, more subtle blobs */}
      <div className="absolute -top-20 -left-20 h-32 w-32 sm:h-48 sm:w-48 md:h-64 md:w-64 lg:h-[28rem] lg:w-[28rem] rounded-full bg-gradient-to-br from-indigo-200 to-cyan-100 blur-3xl opacity-40 sm:opacity-50 lg:opacity-60" />
      <div className="absolute -right-20 top-12 h-28 w-28 sm:h-40 sm:w-40 md:h-52 md:w-52 lg:h-[26rem] lg:w-[26rem] rounded-full bg-gradient-to-br from-fuchsia-200 to-indigo-100 blur-3xl opacity-30 sm:opacity-40 lg:opacity-50" />
      <div className="absolute left-1/4 bottom-[-3rem] sm:bottom-[-4rem] md:bottom-[-5rem] lg:bottom-[-6rem] h-24 w-24 sm:h-32 sm:w-32 md:h-40 md:w-40 lg:h-[20rem] lg:w-[20rem] rounded-full bg-gradient-to-br from-rose-100 to-amber-100 blur-3xl opacity-30 sm:opacity-40 lg:opacity-50" />
    </div>
  );
};

export default BackgroundBlobs;


