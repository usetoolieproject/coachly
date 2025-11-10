import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { AdminService } from '../services/adminService';
import { AdminTableData, AdminFilters } from '../types';

export const useAdminDashboard = () => {
  const [filters, setFilters] = useState<AdminFilters>({
    search: '',
    status: 'all',
    sortBy: 'recent',
    dateRange: '30days',
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTab, setActiveTab] = useState<'overview' | 'instructors' | 'students' | 'courses' | 'payments'>('overview');

  // Fetch admin stats
  const statsQuery = useQuery({
    queryKey: ['admin-stats'],
    queryFn: AdminService.getAdminStats,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch instructors data
  const instructorsQuery = useQuery({
    queryKey: ['admin-instructors', filters, currentPage],
    queryFn: () => AdminService.getInstructors(filters, currentPage, 10),
    enabled: activeTab === 'instructors',
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch students data
  const studentsQuery = useQuery({
    queryKey: ['admin-students', filters, currentPage],
    queryFn: () => AdminService.getStudents(filters, currentPage, 10),
    enabled: activeTab === 'students',
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch courses data
  const coursesQuery = useQuery({
    queryKey: ['admin-courses', filters, currentPage],
    queryFn: () => AdminService.getCourses(filters, currentPage, 10),
    enabled: activeTab === 'courses',
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Fetch payments data
  const paymentsQuery = useQuery({
    queryKey: ['admin-payments', filters, currentPage],
    queryFn: () => AdminService.getPayments(filters, currentPage, 10),
    enabled: activeTab === 'payments',
    staleTime: 2 * 60 * 1000, // 2 minutes
  });

  // Get current data based on active tab
  const getCurrentData = (): AdminTableData | null => {
    switch (activeTab) {
      case 'instructors':
        return instructorsQuery.data || null;
      case 'students':
        return studentsQuery.data || null;
      case 'courses':
        return coursesQuery.data || null;
      case 'payments':
        return paymentsQuery.data || null;
      default:
        return null;
    }
  };

  // Get current loading state
  const isLoading = () => {
    switch (activeTab) {
      case 'instructors':
        return instructorsQuery.isLoading;
      case 'students':
        return studentsQuery.isLoading;
      case 'courses':
        return coursesQuery.isLoading;
      case 'payments':
        return paymentsQuery.isLoading;
      default:
        return false;
    }
  };

  // Get current error state
  const getError = () => {
    switch (activeTab) {
      case 'instructors':
        return instructorsQuery.error;
      case 'students':
        return studentsQuery.error;
      case 'courses':
        return coursesQuery.error;
      case 'payments':
        return paymentsQuery.error;
      default:
        return null;
    }
  };

  // Update filters
  const updateFilters = (newFilters: Partial<AdminFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1); // Reset to first page when filters change
  };

  // Update page
  const updatePage = (page: number) => {
    setCurrentPage(page);
  };

  // Update user status
  const updateUserStatus = async (userId: string, status: 'active' | 'suspended') => {
    try {
      await AdminService.updateUserStatus(userId, status);
      // Refetch data after status update
      switch (activeTab) {
        case 'instructors':
          instructorsQuery.refetch();
          break;
        case 'students':
          studentsQuery.refetch();
          break;
        default:
          break;
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      throw error;
    }
  };

  // Export data
  const exportData = async (type: 'instructors' | 'students' | 'courses' | 'payments') => {
    try {
      const blob = await AdminService.exportData(type, filters);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}-export-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error exporting data:', error);
      throw error;
    }
  };

  // Refresh all data
  const refreshData = () => {
    statsQuery.refetch();
    switch (activeTab) {
      case 'instructors':
        instructorsQuery.refetch();
        break;
      case 'students':
        studentsQuery.refetch();
        break;
      case 'courses':
        coursesQuery.refetch();
        break;
      case 'payments':
        paymentsQuery.refetch();
        break;
    }
  };

  return {
    // Data
    stats: statsQuery.data,
    currentData: getCurrentData(),
    
    // Loading states
    isLoadingStats: statsQuery.isLoading,
    isLoading: isLoading(),
    
    // Error states
    statsError: statsQuery.error,
    error: getError(),
    
    // Filters and pagination
    filters,
    currentPage,
    activeTab,
    
    // Actions
    updateFilters,
    updatePage,
    setActiveTab,
    updateUserStatus,
    exportData,
    refreshData,
    
    // Query objects for advanced usage
    statsQuery,
    instructorsQuery,
    studentsQuery,
    coursesQuery,
    paymentsQuery,
  };
};
