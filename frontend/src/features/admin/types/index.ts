// Admin Types - Re-exports from individual modules for backward compatibility
export type { OverviewStats } from '../overview/types';
export type { Instructor, InstructorStats } from '../instructors/types';
export type { Student, StudentStats } from '../students/types';
export type { Course, CourseStats } from '../courses/types';
export type { Payment, PaymentStats } from '../payments/types';

// Combined types for backward compatibility
export interface AdminStats {
  active: number;
  pending: number;
  suspended: number;
  trials: number;
  educatorsCount: number;
  studentsTotal: number;
}

export interface AdminTableData {
  instructors?: any[];
  students?: any[];
  courses?: any[];
  payments?: any[];
  totalPages?: number;
  currentPage?: number;
  totalCount?: number;
}

export interface AdminFilters {
  search: string;
  status: string;
  sortBy: string;
  dateRange: string;
}

// Promo Codes
export type PromoCodeType = 'discount' | 'duration';

export interface PromoCode {
  id: string;
  code: string;
  type: PromoCodeType;
  discount_percent?: number | null;
  free_months?: number | null;
  plan_id?: string | null;
  max_uses?: number | null;
  used_count: number;
  expires_at?: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}