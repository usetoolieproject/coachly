import React from 'react';

export const ProgressBar: React.FC<{ value: number; color?: string; dark?: boolean }> = ({ value, color = 'bg-indigo-500', dark }) => (
  <div className={`w-full h-2 rounded-full ${dark ? 'bg-gray-700' : 'bg-gray-200/80'}`}>
    <div className={`h-2 rounded-full ${color}`} style={{ width: `${Math.min(100, Math.max(0, value))}%` }} />
  </div>
);

export const SectionCard: React.FC<React.PropsWithChildren<{ dark?: boolean }>> = ({ dark, children }) => (
  <section className={`rounded-2xl p-5 shadow-sm border ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>{children}</section>
);

export const StatCard: React.FC<{ label: string; value: string; delta?: string; icon: React.ReactNode; dark?: boolean }> = ({ label, value, delta, icon, dark }) => (
  <div className={`flex items-center justify-between rounded-2xl p-5 shadow-sm border ${dark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
    <div>
      <div className={`${dark ? 'text-gray-400' : 'text-gray-500'} text-sm`}>{label}</div>
      <div className={`mt-1 text-3xl font-semibold ${dark ? 'text-gray-100' : 'text-gray-900'}`}>{value}</div>
      {delta && <div className={`${dark ? 'text-emerald-400' : 'text-green-600'} text-sm mt-1`}>+{delta}</div>}
    </div>
    <div className={`grid place-items-center rounded-xl p-3 ${dark ? 'bg-gray-800 text-gray-200' : 'bg-gray-50 text-gray-700'}`}>{icon}</div>
  </div>
);


