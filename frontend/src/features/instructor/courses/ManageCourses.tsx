import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
// shared imports kept via CoursesHeader
import CoursesHeader from './components/CoursesHeader';
import CourseCard from './components/CourseCard';
import CourseSkeletonCard from './components/CourseSkeletonCard';
import { Plus } from 'lucide-react';
import { Course } from '../../student/studentCourses/services';
import { useInstructorCourses } from './hooks/useInstructorCourses';
import CreateCourseModal from './CreateCourseModal';
import CourseContentManager from './CourseContentManager';
import { useTheme } from '../../../contexts/ThemeContext';

const ManageCourses: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const { isDarkMode } = useTheme();
  const location = useLocation();
  const { courses: cachedCourses, loadingInitial, isUpdating, refetch, createCourse, deleteCourse, duplicateCourse, moveCourse, togglePublication, updateCourse } = useInstructorCourses();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all');
  // removed inline editing state in SRP refactor

  useEffect(() => {
    setCourses(cachedCourses as Course[]);
  }, [cachedCourses]);

  // Check for course ID from navigation state
  useEffect(() => {
    const state = location.state as { courseId?: string } | null;
    if (state?.courseId) {
      setSelectedCourseId(state.courseId);
      // Clear the state to prevent re-selection on re-renders
      window.history.replaceState({}, '', window.location.pathname);
    }
  }, [location.state]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => setOpenDropdownId(null);
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const loadCourses = async () => { await refetch(); };

  // creation handled via handleSaveCourse to unify edit/create

  const handleDeleteCourse = async (courseId: string) => {
    if (!confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
      return;
    }

    try {
      await deleteCourse(courseId);
      loadCourses();
      setOpenDropdownId(null);
    } catch (error: any) {
      console.error('Error deleting course:', error);
      alert(error.message || 'Failed to delete course');
    }
  };
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);

  const handleEditCourse = (course: Course) => {
    setEditingCourse(course);
    setShowCreateModal(true);
  };

  const handleSaveCourse = async (courseData: any) => {
    try {
      if (editingCourse) {
        await updateCourse({ id: editingCourse.id, data: courseData });
      } else {
        await createCourse(courseData);
      }
      setShowCreateModal(false);
      setEditingCourse(null);
      await loadCourses();
    } catch (error: any) {
      alert(error.message || 'Failed to save course');
    }
  };

  const handleDuplicateCourse = async (courseId: string) => {
    try {
      await duplicateCourse(courseId);
      await loadCourses();
      setOpenDropdownId(null);
      
      // After duplication, keep UX simple without inline title editing
    } catch (error: any) {
      console.error('Error duplicating course:', error);
      alert(error.message || 'Failed to duplicate course');
    }
  };

  const handleMoveCourse = async (courseId: string, direction: 'left' | 'right') => {
    try {
      await moveCourse({ id: courseId, direction });
      loadCourses();
      setOpenDropdownId(null);
    } catch (error: any) {
      console.error('Error moving course:', error);
      alert(error.message || 'Failed to move course');
    }
  };

  const handleTogglePublication = async (courseId: string, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent triggering other click handlers
    try {
      await togglePublication(courseId);
      loadCourses();
    } catch (error: any) {
      console.error('Error toggling course publication:', error);
      alert(error.message || 'Failed to toggle course publication');
    }
  };

  // removed tag color helpers (not used after refactor)

  const canMoveLeft = (index: number) => index > 0;
  const canMoveRight = (index: number) => index < courses.length - 1;

  if (selectedCourseId) {
    return (
      <CourseContentManager 
        courseId={selectedCourseId}
        onBack={() => setSelectedCourseId(null)}
      />
    );
  }

  const Header: React.FC = () => (
    <CoursesHeader isUpdating={isUpdating} onRefresh={refetch} filter={filter} onFilterChange={setFilter} />
  );

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      {/* Header */}
      <Header />

      {/* Courses Grid - Mobile First Responsive */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
        {/* Create New Course Card - Always First */}
        <div
          onClick={() => setShowCreateModal(true)}
          className={`${isDarkMode ? 'bg-gray-800/70 border-gray-700 text-gray-100 hover:border-purple-500/40' : 'bg-white border-gray-300 text-gray-900 hover:border-purple-400'} border-2 border-dashed rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 cursor-pointer group`}
        >
          {/* Top section - Mobile responsive height */}
          <div className={`h-24 sm:h-32 bg-gradient-to-br ${isDarkMode ? 'from-gray-700 to-gray-600' : 'from-gray-100 to-gray-200'} flex items-center justify-center transition-all duration-300`}>
            <div className={`${isDarkMode ? 'bg-gray-600' : 'bg-gray-200'} group-hover:bg-purple-500/10 p-3 sm:p-4 rounded-full transition-colors`}>
              <Plus className={`w-6 h-6 sm:w-8 sm:h-8 ${isDarkMode ? 'text-gray-200 group-hover:text-purple-300' : 'text-gray-500 group-hover:text-purple-600'} transition-colors`} />
            </div>
          </div>
          
          {/* Content section - Mobile optimized padding */}
          <div className="p-3 sm:p-4 lg:p-5">
            <div className="mb-2 sm:mb-3">
              <h3 className={`text-base sm:text-lg font-bold transition-colors mb-1 sm:mb-2 ${isDarkMode ? 'text-gray-100 group-hover:text-purple-300' : 'text-gray-700 group-hover:text-purple-700'}`}>
                New Course
              </h3>
              <p className={`${isDarkMode ? 'text-gray-400' : 'text-gray-500'} text-xs sm:text-sm mb-2 sm:mb-3`}>Create a new course</p>
            </div>
            
            {/* Stats placeholder - Mobile responsive */}
            <div className={`grid grid-cols-2 gap-2 sm:gap-4 mb-3 sm:mb-4 text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-400'}`}>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className={`w-3 h-3 sm:w-4 sm:h-4 rounded inline-block ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                <span className="truncate">0 modules</span>
              </div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <span className={`w-3 h-3 sm:w-4 sm:h-4 rounded inline-block ${isDarkMode ? 'bg-gray-600' : 'bg-gray-300'}`} />
                <span className="truncate">0 lessons</span>
              </div>
            </div>
            
            {/* Tags placeholder - Mobile responsive */}
            <div className="flex flex-wrap gap-1 sm:gap-2 mb-3 sm:mb-4">
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
                Get started
              </span>
            </div>

            {/* Button - Mobile optimized */}
            <div className={`w-full py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg transition-colors flex items-center justify-center space-x-1 sm:space-x-2 font-medium border text-sm sm:text-base ${isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-purple-900/20 hover:text-purple-300 border-gray-600' : 'bg-gray-200 text-gray-600 hover:bg-purple-100 hover:text-purple-700 border-gray-200'}`}>
              <Plus className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="truncate">Create Course</span>
            </div>
          </div>
        </div>

        {/* Existing Courses */}
        {(loadingInitial && courses.length === 0) ? (
          Array.from({ length: 6 }).map((_, i) => (
            <CourseSkeletonCard key={i} />
          ))
        ) : (
        courses
          .filter((c) => {
            if (filter === 'all') return true;
            if (filter === 'free') return c.type === 'free' || (typeof (c as any).price === 'number' ? (c as any).price === 0 : false);
            if (filter === 'paid') return c.type === 'paid' && (typeof (c as any).price === 'number' ? (c as any).price > 0 : true);
            return true;
          })
          .map((course, index) => {
          return (
            <div key={course.id} onClick={() => setSelectedCourseId(course.id)}>
              <CourseCard
                course={course}
                index={index}
                canMoveLeft={canMoveLeft}
                canMoveRight={canMoveRight}
                openDropdownId={openDropdownId}
                setOpenDropdownId={setOpenDropdownId}
                onMove={handleMoveCourse}
                onDuplicate={handleDuplicateCourse}
                onDelete={handleDeleteCourse}
                onTogglePublication={handleTogglePublication}
                onEdit={handleEditCourse}
              />
            </div>
          );
        }))}
      </div>

     

      {/* Create Course Modal */}
      {showCreateModal && (
        <CreateCourseModal
          course={editingCourse as any}
          onSave={handleSaveCourse}
          onCancel={() => setShowCreateModal(false)}
        />
      )}
    </div>
  );
};

export default ManageCourses;