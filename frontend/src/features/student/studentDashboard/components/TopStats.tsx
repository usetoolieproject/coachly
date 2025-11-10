import React from 'react';
import { BookOpen, Trophy, Zap } from 'lucide-react';
import { StatCard } from '../../../../components/shared';

interface Props {
  stats: { 
    coursesEnrolled: number; 
    coursesCompleted: number; 
    totalHours: number; 
    currentStreak: number;
    coursesEnrolledDeltaText?: string;
    coursesCompletedDeltaText?: string;
    currentStreakDeltaText?: string;
  };
}

const TopStats: React.FC<Props> = ({  stats }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <StatCard label="Courses Enrolled" value={stats.coursesEnrolled.toString()} icon={<BookOpen size={20} />} borderColor="emerald" iconColor="emerald" />
      <StatCard label="Courses Completed" value={stats.coursesCompleted.toString()} icon={<Trophy size={20} />} borderColor="indigo" iconColor="indigo" />
      <StatCard label="Current Streak" value={`${stats.currentStreak} days`} icon={<Zap size={20} />} borderColor="purple" iconColor="purple" />
    </div>
  );
};

export default TopStats;


