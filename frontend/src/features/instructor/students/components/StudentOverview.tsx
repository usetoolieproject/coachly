import React from 'react';
import { BookOpen, MessageSquare, Users } from 'lucide-react';
import { useTheme } from '../../../../contexts/ThemeContext';
import type { StudentDetails } from '../../../../services/instructorStudentService';

export function StudentOverview({ student }: { student: StudentDetails }) {
  const { isDarkMode } = useTheme();
  return (
    <div>
      <h2 className={`text-2xl font-bold mb-6 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Student Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Full Name</label>
            <div className={`mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{student.firstName} {student.lastName}</div>
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Email</label>
            <div className={`mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{student.email}</div>
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Phone</label>
            <div className={`mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{student.phone || 'Not provided'}</div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Location</label>
            <div className={`mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{student.location || 'Not provided'}</div>
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Date Joined</label>
            <div className={`mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{new Date(student.joinedDate).toLocaleDateString()}</div>
          </div>
          <div>
            <label className={`block text-sm font-medium ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Account Created</label>
            <div className={`mt-1 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>{new Date(student.accountCreated).toLocaleDateString()}</div>
          </div>
        </div>
      </div>

      {student.bio && (
        <div className="mb-8">
          <label className={`block text-sm font-medium mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Bio</label>
          <div className={`rounded-lg p-4 ${isDarkMode ? 'bg-gray-800 text-gray-100' : 'bg-gray-50 text-gray-900'}`}>{student.bio}</div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className={`${isDarkMode ? 'bg-blue-900/20' : 'bg-blue-50'} p-6 rounded-lg`}>
          <BookOpen className={`h-10 w-10 mb-3 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`} />
          <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Learning Progress</h3>
          <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-blue-400' : 'text-blue-600'}`}>{student.courses.reduce((t,c)=>t+c.completedLessons,0)}</div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>of {student.courses.reduce((t,c)=>t+c.totalLessons,0)} lessons completed</p>
        </div>
        <div className={`${isDarkMode ? 'bg-green-900/20' : 'bg-green-50'} p-6 rounded-lg`}>
          <MessageSquare className={`h-10 w-10 mb-3 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`} />
          <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Posts Created</h3>
          <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-green-400' : 'text-green-600'}`}>{student.posts.length}</div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Community discussions</p>
        </div>
        <div className={`${isDarkMode ? 'bg-purple-900/20' : 'bg-purple-50'} p-6 rounded-lg`}>
          <Users className={`h-10 w-10 mb-3 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`} />
          <h3 className={`font-semibold mb-2 ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>Comments Made</h3>
          <div className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-purple-400' : 'text-purple-600'}`}>{student.comments.length}</div>
          <p className={`text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-600'}`}>Community engagement</p>
        </div>
      </div>
    </div>
  );
}


