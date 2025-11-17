import React from 'react';
import { useNavigate } from 'react-router-dom';
import { StudentsHeader, StudentsFilters, StudentsStats, StudentsTable } from './components';
import { useStudents } from './hooks/useStudents';
import type { Student } from './types';
import { useTheme } from '../../../contexts/ThemeContext';
import { instructorStudentService } from '../../../services/instructorStudentService';

const InstructorStudents: React.FC = () => {
  const navigate = useNavigate();
  const { isDarkMode } = useTheme();
  const { students, isLoading, isRefreshing, refresh, filtered, search, setSearch, handleSort } = useStudents();
  const [deleting, setDeleting] = React.useState<string | null>(null);

  const exportToCSV = () => {
    const headers = [
      'Name',
      'Email',
      'Amount Paid',
      'Payment Method', 
      'Status',
      'Date Joined',
      'Course Progress %'
    ];

    const csvData = filtered.map((student: Student) => [
      `${student.firstName} ${student.lastName}`,
      student.email,
      `$${student.amountPaid}`,
      student.paymentMethod,
      student.status,
      new Date(student.joinedDate).toLocaleDateString(),
      `${student.progress.completionPercentage}%`
    ]);

    const csvContent = [headers, ...csvData]
      .map(row => row.map(field => `"${field}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `students-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportToPDF = () => {
    window.print();
  };

  const handleDelete = async (studentId: string) => {
    const student = filtered.find(s => s.id === studentId);
    if (!student) return;

    const confirmed = window.confirm(
      `Are you sure you want to delete ${student.firstName} ${student.lastName}? This action cannot be undone and will permanently remove the student and all their data.`
    );

    if (!confirmed) return;

    try {
      setDeleting(studentId);
      await instructorStudentService.deleteStudent(studentId);
      await refresh(); // Refresh the list after deletion
      alert('Student deleted successfully');
    } catch (error: any) {
      console.error('Error deleting student:', error);
      alert(error.message || 'Failed to delete student. Please try again.');
    } finally {
      setDeleting(null);
    }
  };

  // Skeleton when first loading
  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 w-1/3 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="h-24 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-24 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-24 rounded bg-gray-200 dark:bg-gray-800" />
            <div className="h-24 rounded bg-gray-200 dark:bg-gray-800" />
          </div>
          <div className="h-14 rounded bg-gray-200 dark:bg-gray-800" />
          <div className="h-64 rounded bg-gray-200 dark:bg-gray-800" />
        </div>
      </div>
    );
  }

  return (
    <div className={`max-w-7xl mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 lg:py-8 ${isDarkMode ? 'text-white' : ''}`}>
      {/* Header */}
      <StudentsHeader total={students.length} onExport={exportToCSV} onExportPdf={exportToPDF} isUpdating={isRefreshing} onRefresh={refresh} />
      
      {/* Stats */}
      <StudentsStats total={students.length} avgProgress={(students.reduce((acc, s) => acc + s.progress.completionPercentage, 0) / (students.length || 1))} totalPosts={students.reduce((acc, s) => acc + s.activity.totalPosts, 0)} totalRevenue={students.reduce((acc, s) => acc + s.amountPaid, 0)} />

      {/* Filters */}
      <StudentsFilters value={search} onChange={setSearch} />

      {/* Students Table */}
      <StudentsTable 
        rows={filtered} 
        onSort={handleSort} 
        onView={(id)=>{
          navigate(`/coach/students/${id}`);
        }}
        onDelete={handleDelete}
      />

      {/* Empty State */}
      {filtered.length === 0 && (
        <div className="text-center py-8 sm:py-12">
          <svg className="mx-auto h-12 w-12 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M16 11c1.657 0 3-1.79 3-4s-1.343-4-3-4-3 1.79-3 4 1.343 4 3 4Z"/><path d="M6 11c1.657 0 3-1.79 3-4S7.657 3 6 3 3 4.79 3 7s1.343 4 3 4Z"/><path d="M6 14c-2.67 0-8 1.34-8 4v3h12v-3c0-2.66-5.33-4-8-4Zm10 0c-.29 0-.62.02-.97.05 1.16.84 1.97 1.96 1.97 3.45v3h8v-3c0-2.66-5.33-4-8-4Z"/></svg>
          <h3 className={`mt-2 text-sm font-medium ${isDarkMode ? 'text-gray-100' : 'text-gray-900'}`}>No students found</h3>
          <p className={`mt-1 text-sm ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
            {search ? 'Try adjusting your search terms.' : 'Students will appear here when they join your community.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default InstructorStudents;