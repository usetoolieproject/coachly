import React from 'react';
import { Eye, EyeOff, BookOpen, Clock, MoreHorizontal, ChevronLeft, ChevronRight, Copy, Trash2, Settings, Tag } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';
import { Course } from '../../../student/studentCourses/services';

interface Props {
  course: Course;
  index: number;
  canMoveLeft: (index: number) => boolean;
  canMoveRight: (index: number) => boolean;
  openDropdownId: string | null;
  setOpenDropdownId: (id: string | null) => void;
  onMove: (id: string, dir: 'left'|'right') => void;
  onDuplicate: (id: string) => Promise<void> | void;
  onDelete: (id: string) => void;
  onTogglePublication: (id: string, e: React.MouseEvent) => void;
  onEdit: (course: Course) => void;
}

const CourseCard: React.FC<Props> = ({ course, index, canMoveLeft, canMoveRight, openDropdownId, setOpenDropdownId, onMove, onDuplicate, onDelete, onTogglePublication, onEdit }) => {
  const { isDarkMode } = useTheme();
  const totalModules = course.modules?.length || 0;
  const totalLessons = course.modules?.reduce((acc, m) => acc + (m.lessons?.length || 0), 0) || 0;

  return (
    <div className={`${isDarkMode ? 'bg-gray-900/60 border-gray-700' : 'bg-white/90 border-gray-200'} group rounded-xl sm:rounded-2xl shadow-sm overflow-hidden hover:shadow-lg transition-all duration-300 border hover:-translate-y-0.5`}>
      <div className="relative h-28 sm:h-36 bg-gradient-to-br from-purple-500 to-blue-500">
        {course.thumbnail_url ? (
          <img src={course.thumbnail_url} alt={course.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <BookOpen className="w-12 h-12 text-white opacity-80" />
          </div>
        )}
        {/* subtle gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent" />
        {/* Price/Free badge (instructor view) - Mobile responsive */}
        <div className="absolute top-2 sm:top-3 left-2 sm:left-3">
          <div
            className={`inline-flex items-center gap-1 sm:gap-1.5 text-xs sm:text-sm font-semibold px-2 sm:px-3 py-1 sm:py-1.5 rounded-full backdrop-blur-sm ring-1 shadow-md ${
              course.type === 'paid'
                ? (isDarkMode ? 'bg-purple-600/95 text-white ring-white/10' : 'bg-white/95 text-purple-700 ring-black/10')
                : (isDarkMode ? 'bg-emerald-600/95 text-white ring-white/10' : 'bg-white/95 text-emerald-700 ring-black/10')
            }`}
          >
            <Tag className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="truncate">
              {course.type === 'paid'
                ? (typeof (course as any).price === 'number' ? `$${(course as any).price}` : 'Paid')
                : 'Free'}
            </span>
          </div>
        </div>
        <div className="absolute top-2 sm:top-3 right-2 sm:right-3">
          <button
            onClick={(e) => { e.stopPropagation(); setOpenDropdownId(openDropdownId === course.id ? null : course.id); }}
            className="p-1.5 sm:p-2 bg-white/20 hover:bg-white/30 rounded-full transition-all duration-200 backdrop-blur"
          >
            <MoreHorizontal className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
          </button>
          {openDropdownId === course.id && (
            <div className={`absolute right-0 top-full mt-2 w-48 rounded-lg shadow-lg z-10 border ${isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
              <div className="py-1">
                <button disabled={!canMoveLeft(index)} onClick={(e) => { e.stopPropagation(); onMove(course.id, 'left'); }} className={`w-full text-left px-4 py-2 text-sm disabled:text-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <ChevronLeft className="w-4 h-4" /><span>Move Left</span>
                </button>
                <button disabled={!canMoveRight(index)} onClick={(e) => { e.stopPropagation(); onMove(course.id, 'right'); }} className={`w-full text-left px-4 py-2 text-sm disabled:text-gray-400 disabled:cursor-not-allowed flex items-center space-x-2 ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <ChevronRight className="w-4 h-4" /><span>Move Right</span>
                </button>
                <div className={`my-1 border-t ${isDarkMode ? 'border-gray-700' : 'border-gray-200'}`} />
                <button onClick={(e) => { e.stopPropagation(); onEdit(course); }} className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <Settings className="w-4 h-4" /><span>Edit Course</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDuplicate(course.id); }} className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${isDarkMode ? 'text-gray-200 hover:bg-gray-700' : 'text-gray-700 hover:bg-gray-50'}`}>
                  <Copy className="w-4 h-4" /><span>Duplicate Course</span>
                </button>
                <button onClick={(e) => { e.stopPropagation(); onDelete(course.id); }} className={`w-full text-left px-4 py-2 text-sm flex items-center space-x-2 ${isDarkMode ? 'text-red-400 hover:bg-red-900/20' : 'text-red-600 hover:bg-red-50'}`}>
                  <Trash2 className="w-4 h-4" /><span>Delete Course</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
      <div className="p-3 sm:p-4 lg:p-5">
        <div className="flex items-start justify-between mb-2">
          <div className="flex-1 min-w-0">
            <h3 className={`text-base sm:text-lg font-semibold line-clamp-2 flex-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{course.title}</h3>
          </div>
          <button onClick={(e) => onTogglePublication(course.id, e)} className={`ml-2 sm:ml-3 p-1 sm:p-1.5 rounded-full transition-colors flex-shrink-0 ${course.is_published ? (isDarkMode ? 'bg-green-900/20 text-green-300 hover:bg-green-900/30' : 'bg-green-100 text-green-600 hover:bg-green-200') : (isDarkMode ? 'bg-gray-700 text-gray-200 hover:bg-gray-600' : 'bg-gray-100 text-gray-600 hover:bg-gray-200')}`} title={course.is_published ? 'Published - Click to unpublish' : 'Draft - Click to publish'}>
            {course.is_published ? <Eye className="w-3 h-3 sm:w-4 sm:h-4" /> : <EyeOff className="w-3 h-3 sm:w-4 sm:h-4" />}
          </button>
        </div>
        {course.description && <p className={`${isDarkMode ? 'text-gray-300' : 'text-gray-600'} text-xs sm:text-sm line-clamp-2 mb-3 sm:mb-4`}>{course.description}</p>}
        <div className={`flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3 sm:mb-4 text-xs sm:text-sm ${isDarkMode ? 'text-gray-300' : 'text-gray-600'} gap-2 sm:gap-0`}>
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-1 sm:space-x-2"><BookOpen className="w-3 h-3 sm:w-4 sm:h-4" /><span className="truncate">{totalModules} modules</span></div>
            <div className="flex items-center space-x-1 sm:space-x-2"><Clock className="w-3 h-3 sm:w-4 sm:h-4" /><span className="truncate">{totalLessons} lessons</span></div>
          </div>
          <div className={`text-xs px-2 py-1 rounded-full self-start sm:self-auto ${course.is_published ? (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-700') : (isDarkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-100 text-gray-600')}`}>
            {course.is_published ? 'Published' : 'Draft'}
          </div>
        </div>
        <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-2 sm:py-2.5 px-3 sm:px-4 rounded-lg hover:from-purple-700 hover:to-blue-700 transition-colors flex items-center justify-center space-x-1 sm:space-x-2 font-medium text-sm sm:text-base">
          <Settings className="w-4 h-4 sm:w-5 sm:h-5" /><span className="truncate">Manage Content</span>
        </button>
      </div>
    </div>
  );
};

export default CourseCard;


