import { create } from 'zustand';
import { studentCourseService } from '../services';
import type { StudentCourse } from '../types';

type State = {
  courses: StudentCourse[];
  loadingInitial: boolean;
  isUpdating: boolean;
  error: string | null;
  pendingPaidCourseId: string | null;
  isConfirmingPayment: boolean;
};

type Actions = {
  fetchAvailable: () => Promise<void>;
  refetch: () => Promise<void>;
  setPendingPaidCourse: (courseId: string | null) => void;
  confirmSessionAndRefresh: (sessionId: string, courseId?: string) => Promise<void>;
};

export const useStudentCoursesStore = create<State & Actions>((set, get) => ({
  courses: [],
  loadingInitial: true,
  isUpdating: false,
  error: null,
  pendingPaidCourseId: null,
  isConfirmingPayment: false,

  fetchAvailable: async () => {
    try {
      set({ error: null, loadingInitial: true });
      const data = await studentCourseService.getAvailableCourses();
      set({ courses: data });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to load courses' });
    } finally {
      set({ loadingInitial: false, isUpdating: false });
    }
  },

  refetch: async () => {
    const { loadingInitial } = get();
    try {
      set({ isUpdating: !loadingInitial });
      const data = await studentCourseService.getAvailableCourses();
      set({ courses: data });
    } catch (e: any) {
      set({ error: e?.message || 'Failed to refresh courses' });
    } finally {
      set({ isUpdating: false, loadingInitial: false });
    }
  },

  setPendingPaidCourse: (courseId: string | null) => set({ pendingPaidCourseId: courseId }),

  confirmSessionAndRefresh: async (sessionId: string, courseId?: string) => {
    try {
      set({ isConfirmingPayment: true });
      await studentCourseService.confirmCheckoutSession(sessionId, courseId);
    } catch (e) {
      // swallow; UI will still refetch and user can retry
    } finally {
      await get().refetch();
      set({ isConfirmingPayment: false });
    }
  },
}));


