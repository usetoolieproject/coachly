import React from 'react';
import { Calendar as CalendarIcon, Clock } from 'lucide-react';
import { StatCard } from '../../../../components/shared';

interface StatsProps {
  upcomingCount: number;
  totalHours: number;
}

const Stats: React.FC<StatsProps> = ({ upcomingCount, totalHours }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
      <StatCard
        label="Upcoming Sessions"
        value={String(upcomingCount)}
        icon={<CalendarIcon className="w-5 h-5 sm:w-6 sm:h-6" />}
        borderColor="emerald"
        iconColor="emerald"
        delta="Available to join"
      />
      <StatCard
        label="Total Hours"
        value={`${totalHours.toFixed(1)}h`}
        icon={<Clock className="w-5 h-5 sm:w-6 sm:h-6" />}
        borderColor="purple"
        iconColor="purple"
        delta="Scheduled content"
      />
    </div>
  );
};

export default Stats;


