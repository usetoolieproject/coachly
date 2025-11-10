import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { instructorStudentService, StudentDetails } from '../../../services/instructorStudentService';
import { useTheme } from '../../../contexts/ThemeContext';
import { StudentQuickStats } from './components/StudentQuickStats';
import { StudentOverview } from './components/StudentOverview';
import { StudentCourseProgress } from './components/StudentCourseProgress';
import { StudentCommunityActivity } from './components/StudentCommunityActivity';
import { useQuery } from '@tanstack/react-query';
import { RefreshButton, UpdatingIndicator } from '../../../components/shared';

const InstructorStudentDetails: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const [student, setStudent] = useState<StudentDetails | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'activity'>('overview');
  const query = useQuery({
    queryKey: ['instructor-student-details', studentId],
    queryFn: async () => await instructorStudentService.getStudentDetails(studentId as string),
    enabled: !!studentId,
    staleTime: 5 * 60_000,
    gcTime: 15 * 60_000,
  });
  if (query.data && student !== query.data) setStudent(query.data as StudentDetails);
  const loading = query.isLoading;
  const isUpdating = query.isFetching && !query.isLoading;

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-40 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="flex gap-6">
            <div className="h-8 w-24 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-8 w-40 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-8 w-56 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
          <div className="h-96 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Student not found</h2>
          <button
            onClick={() => navigate('/coach/students')}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Back to Students
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 ${isDarkMode ? 'text-gray-100' : ''}`}>
      {/* Header */}
      <div className="mb-6 sm:mb-8">
        {/* Desktop Layout - Original (lg and above) */}
        <div className="hidden lg:block">
          <div className="flex items-center justify-between mb-4">
            <button
              onClick={() => navigate('/coach/students')}
              className={`flex items-center transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </button>
            <div className="flex items-center gap-3">
              <UpdatingIndicator isUpdating={isUpdating} />
              <RefreshButton onClick={() => query.refetch()} isRefreshing={isUpdating} />
            </div>
          </div>
        </div>

        {/* Mobile/Tablet Layout - Multi-row Design (below lg) */}
        <div className="lg:hidden">
          {/* Row 1: Back button */}
          <div className="mb-4">
            <button
              onClick={() => navigate('/coach/students')}
              className={`flex items-center transition-colors ${isDarkMode ? 'text-gray-400 hover:text-gray-200' : 'text-gray-600 hover:text-gray-900'}`}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Students
            </button>
          </div>

          {/* Row 2: Updating indicator and Refresh button (right side) */}
          <div className="flex items-center justify-end gap-3 sm:gap-4 mb-4 sm:mb-6">
            <UpdatingIndicator isUpdating={isUpdating} />
            <RefreshButton onClick={() => query.refetch()} isRefreshing={isUpdating} />
          </div>
        </div>

        <StudentQuickStats student={student} />

        {/* Tabs - Responsive Design */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-6 mt-4 sm:mt-6">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-2 border-b-2 transition-colors font-medium text-sm sm:text-base ${
              activeTab === 'overview'
                ? 'border-indigo-600 text-indigo-600'
                : `${isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-200' : 'border-transparent text-gray-500 hover:text-gray-700'}`
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className={`pb-2 border-b-2 transition-colors font-medium text-sm sm:text-base ${
              activeTab === 'progress'
                ? 'border-indigo-600 text-indigo-600'
                : `${isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-200' : 'border-transparent text-gray-500 hover:text-gray-700'}`
            }`}
          >
            Course Progress
          </button>
          <button
            onClick={() => setActiveTab('activity')}
            className={`pb-2 border-b-2 transition-colors font-medium text-sm sm:text-base ${
              activeTab === 'activity'
                ? 'border-indigo-600 text-indigo-600'
                : `${isDarkMode ? 'border-transparent text-gray-400 hover:text-gray-200' : 'border-transparent text-gray-500 hover:text-gray-700'}`
            }`}
          >
            Community Activity
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className={`rounded-xl shadow-sm border p-4 sm:p-6 ${isDarkMode ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'}`}>
        {activeTab === 'overview' && (
          <StudentOverview student={student} />
        )}

        {activeTab === 'progress' && (
          <StudentCourseProgress student={student} />
        )}

        {activeTab === 'activity' && (
          <StudentCommunityActivity student={student} />
        )}
      </div>
    </div>
  );
};

export default InstructorStudentDetails;