import React from 'react';
import { DollarSign, Users, BookOpen, Sparkles } from 'lucide-react';
import { StatCard } from '../../../../components/shared';

interface AnalyticsProps {
  analytics: {
    totalRevenue: number;
    totalStudents: number;
    totalCourses: number;
    avgRating: number;
    totalCompletions: number;
  };
}

const StatsCards: React.FC<AnalyticsProps> = ({ analytics }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
      <StatCard 
        label="Total Revenue" 
        value={`$${analytics.totalRevenue}`} 
        icon={<DollarSign className="h-4 w-4 sm:h-5 sm:w-5" />} 
        borderColor="emerald" 
        iconColor="emerald" 
      />
      
      <StatCard 
        label="Total Students" 
        value={analytics.totalStudents.toString()} 
        icon={<Users className="h-4 w-4 sm:h-5 sm:w-5" />} 
        borderColor="indigo" 
        iconColor="indigo" 
      />
      
      <StatCard 
        label="Active Courses" 
        value={`${analytics.totalCourses} courses`} 
        icon={<BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />} 
        borderColor="purple" 
        iconColor="purple" 
      />
      
      <StatCard 
        label="Completed Lessons" 
        value={analytics.totalCompletions.toString()} 
        icon={<Sparkles className="h-4 w-4 sm:h-5 sm:w-5" />} 
        borderColor="pink" 
        iconColor="pink" 
      />
    </div>
  );
};

export default StatsCards;


