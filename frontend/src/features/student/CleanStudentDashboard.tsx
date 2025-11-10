import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { UpdatingIndicator, RefreshButton, FilterPills } from '../../components/shared';
import { BookOpen } from 'lucide-react';
import { studentCourseService, StudentCourse } from './studentCourses/services';
import { StudentLearningView } from './studentCourses';
import { useTheme } from '../../contexts/ThemeContext';
import { CourseSkeletonCard } from './studentCourses/components/CourseSkeletonCard';
import StudentCourseCard from './studentCourses/components/StudentCourseCard';
import { useStudentCoursesStore } from './studentCourses/hooks/useStudentCoursesStore';

const CleanStudentDashboard: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { courses, loadingInitial, isUpdating, fetchAvailable, refetch } = useStudentCoursesStore();
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const returnCourseId = params.get('courseId') || undefined;
    // Also support route state to avoid flicker
    const state = (window.history.state && (window.history.state as any).usr) || {};
    const stateCourseId: string | undefined = state.courseId;

    // If courseId passed via route state, open immediately without showing the grid
    if (stateCourseId) {
      setSelectedCourseId(stateCourseId);
      // Replace state to clear it so back/forward works naturally
      try {
        const url = new URL(window.location.href);
        window.history.replaceState({}, '', url.toString());
      } catch {}
      return;
    }

    // Always fetch the list
    fetchAvailable().then(async () => {
      if (sessionId && returnCourseId) {
        // Highlight the purchased course and confirm in background, stay on grid
        const { setPendingPaidCourse, confirmSessionAndRefresh } = useStudentCoursesStore.getState();
        setPendingPaidCourse(returnCourseId);
        const timeout = setTimeout(() => setPendingPaidCourse(null), 5000);
        try {
          await confirmSessionAndRefresh(sessionId, returnCourseId);
        } finally {
          clearTimeout(timeout);
          const url = new URL(window.location.href);
          url.searchParams.delete('session_id');
          url.searchParams.delete('paid');
          url.searchParams.delete('status');
          url.searchParams.delete('payment_success');
          window.history.replaceState({}, '', url.toString());
          setPendingPaidCourse(null);
        }
      } else if (returnCourseId && !sessionId) {
        // If courseId is provided without sessionId, select the course for learning
        setSelectedCourseId(returnCourseId);
        // Clean up the URL
        const url = new URL(window.location.href);
        url.searchParams.delete('courseId');
        window.history.replaceState({}, '', url.toString());
      }
    });
  }, [fetchAvailable]);

  const loadAllCourses = refetch;

  const [subscribingCourseId, setSubscribingCourseId] = useState<string | null>(null);

  // price formatting moved into StudentCourseCard

  const handleCourseClick = async (course: StudentCourse) => {
    const isPaidCourse = course.type === 'paid';
    const hasPaid = (course as any).isPaid === true;
    if (isPaidCourse && !hasPaid) {
      if (subscribingCourseId) return;
      try {
        setSubscribingCourseId(course.id);
        const { url } = await studentCourseService.createCourseCheckoutSession(course.id);
        if (url) window.location.href = url;
      } catch (e) {
        console.error('Failed to start checkout', e);
        setSubscribingCourseId(null);
      }
      return;
    }
    setSelectedCourseId(course.id);
  };

  const handleBackFromCourse = () => {
    setSelectedCourseId(null);
    loadAllCourses();
  };



  // If viewing a specific course, show the learning view
  if (selectedCourseId) {
    return (
      <StudentLearningView 
        courseId={selectedCourseId} 
        onBack={handleBackFromCourse}
      />
    );
  }

  // Initial render can show lightweight header with updating indicator instead of spinner

  return (
    <div className={`max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 ${isDarkMode ? 'text-gray-100' : ''}`}>
      {/* Header - Mobile First Responsive */}
      <div className="mb-4 sm:mb-6 lg:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-6">
          <div className="flex-1 min-w-0">
            <h1 className={`text-2xl sm:text-3xl lg:text-4xl font-bold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>My Courses</h1>
            <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mt-1 sm:mt-2 text-sm sm:text-base`}>Continue your learning journey</p>
          </div>
          
          {/* Controls - Responsive Layout */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-2">
            {/* Mobile: Full width controls, Desktop: Compact */}
            <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
              {/* Updating Indicator */}
              <div className="w-6 sm:w-24 flex items-center justify-start">
                <UpdatingIndicator isUpdating={loadingInitial || isUpdating} />
              </div>
            </div>
            
            {/* Action Buttons - Touch friendly */}
            <div className="flex items-center gap-2 sm:gap-2">
              <RefreshButton onClick={loadAllCourses} isRefreshing={isUpdating} />
              <FilterPills value={filter} onChange={setFilter as any} dark={isDarkMode} />
            </div>
          </div>
        </div>
      </div>

      {/* Courses Grid - Mobile First */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {(() => {
          const { pendingPaidCourseId} = useStudentCoursesStore.getState();
          const sourceList = loadingInitial ? Array.from({ length: 6 }) : courses;
          const list = loadingInitial ? sourceList : sourceList.filter((c: any) => {
            if (filter === 'all') return true;
            if (filter === 'free') return c?.type === 'free' || c?.price === 0;
            if (filter === 'paid') return c?.type === 'paid' && (typeof c?.price === 'number' ? c.price > 0 : true);
            return true;
          });
          return list.map((course: any, idx: number) => {
            if (loadingInitial || (pendingPaidCourseId && course?.id === pendingPaidCourseId)) {
              return <CourseSkeletonCard key={course?.id || idx} isDark={isDarkMode} />;
            }
          return (
            <div key={course.id} onClick={() => handleCourseClick(course)}>
              <StudentCourseCard
                course={course}
                dark={isDarkMode}
                isProcessing={subscribingCourseId === course.id}
                onActionClick={handleCourseClick}
              />
            </div>
          );
          });
        })()}
      </div>

      {/* Empty State - Mobile Responsive */}
      {!loadingInitial && courses.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <BookOpen className="w-16 h-16 sm:w-24 sm:h-24 text-gray-400 mx-auto mb-4 sm:mb-6" />
          <h3 className={`text-xl sm:text-2xl font-semibold ${isDarkMode ? 'text-gray-100' : 'text-gray-900'} mb-3 sm:mb-4`}>No courses available</h3>
          <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-600'} mb-6 sm:mb-8 max-w-md mx-auto text-sm sm:text-base`}>
            Join a community to discover courses, or check back later for new content.
          </p>
          <button
            onClick={() => navigate("/student/community")}
            className={`${isDarkMode ? 'bg-blue-700 hover:bg-blue-600' : 'bg-blue-600 hover:bg-blue-700'} text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium text-sm sm:text-base`}
          >
            Explore Communities
          </button>
        </div>
      )}
    </div>
  );
};

export default CleanStudentDashboard;