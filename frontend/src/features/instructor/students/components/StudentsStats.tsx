import StatCard from '../../../../components/shared/ui/StatCard';
import { Users, TrendingUp, MessageSquare, DollarSign } from 'lucide-react';

export function StudentsStats({ total, avgProgress, totalPosts, totalRevenue }: { total: number; avgProgress: number; totalPosts: number; totalRevenue: number; }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 lg:gap-6 mt-4 sm:mt-6">
      <StatCard label="Total Students" value={String(total)} icon={<Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />} borderColor="indigo" iconColor="indigo" />
      <StatCard label="Avg Progress" value={`${Math.round(avgProgress)}%`} icon={<TrendingUp className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />} borderColor="green" iconColor="green" />
      <StatCard label="Total Posts" value={String(totalPosts)} icon={<MessageSquare className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />} borderColor="blue" iconColor="blue" />
      <StatCard label="Total Revenue" value={`$${totalRevenue}`} icon={<DollarSign className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6" />} borderColor="purple" iconColor="purple" />
    </div>
  );
}


