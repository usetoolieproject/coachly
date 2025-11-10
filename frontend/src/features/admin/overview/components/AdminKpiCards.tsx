import React from 'react';
import { Users, GraduationCap, DollarSign, CalendarClock } from 'lucide-react';

export const AdminKpiCards: React.FC<{
  totals: { educatorsCount: number; studentsTotal: number; totalRevenue: number; trials: number };
}> = ({ totals }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-2">
      <KpiCard
        color="emerald"
        title="Total Revenue"
        value={`$${totals.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
        icon={<DollarSign className="h-5 w-5 text-emerald-500" />}
        subtitle="lifetime"
      />
      <KpiCard
        color="indigo"
        title="Total Educators"
        value={totals.educatorsCount.toLocaleString()}
        icon={<Users className="h-5 w-5 text-indigo-500" />}
        subtitle="on the platform"
      />
      <KpiCard
        color="purple"
        title="Total Students"
        value={totals.studentsTotal.toLocaleString()}
        icon={<GraduationCap className="h-5 w-5 text-purple-500" />}
        subtitle="across all educators"
      />
      <KpiCard
        color="pink"
        title="On Trial"
        value={totals.trials.toLocaleString()}
        icon={<CalendarClock className="h-5 w-5 text-pink-500" />}
        subtitle="trialing membership"
      />
    </div>
  );
};

const KpiCard: React.FC<{
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  icon: React.ReactNode;
  color: 'emerald' | 'indigo' | 'purple' | 'pink' | 'orange' | 'cyan';
}> = ({ title, value, subtitle, icon, color }) => {
  const borderColor = {
    emerald: 'border-emerald-500',
    indigo: 'border-indigo-500',
    purple: 'border-purple-500',
    pink: 'border-pink-500',
    orange: 'border-orange-500',
    cyan: 'border-cyan-500',
  }[color];

  return (
    <div className={`shadow-sm border-l-4 ${borderColor} bg-white rounded-lg p-4`}>
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <div className="flex items-center gap-2 mt-2">
            <h3 className="text-2xl font-semibold leading-none">{value}</h3>
          </div>
          {subtitle && <p className="text-xs text-gray-500 mt-2">{subtitle}</p>}
        </div>
        <div className="p-2 rounded-2xl bg-gray-100">{icon}</div>
      </div>
    </div>
  );
};


