import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { courseService, Course } from '../../../student/studentCourses/services';

const queryKey = ['instructor-courses'];

export function useInstructorCourses() {
  const qc = useQueryClient();

  const listQuery = useQuery<Course[]>({
    queryKey,
    queryFn: () => courseService.getCourses(),
    placeholderData: (prev) => prev,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const refetch = () => listQuery.refetch();

  const createMutation = useMutation({
    mutationFn: (data: any) => courseService.createCourse(data),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => courseService.deleteCourse(id),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const duplicateMutation = useMutation({
    mutationFn: (id: string) => courseService.duplicateCourse(id),
    onSuccess: (newCourse) => {
      // Optimistically merge into cache for snappy UX
      qc.setQueryData<Course[] | undefined>(queryKey, (old) => old ? [newCourse, ...old] : [newCourse]);
    },
  });

  const moveMutation = useMutation({
    mutationFn: ({ id, direction }: { id: string; direction: 'left'|'right' }) => courseService.updateCourseOrder(id, direction),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const publishMutation = useMutation({
    mutationFn: (id: string) => courseService.toggleCoursePublication(id),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const updateTitleMutation = useMutation({
    mutationFn: ({ id, title }: { id: string; title: string }) => courseService.updateCourse(id, { title }),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const updateCourseMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) => courseService.updateCourse(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey }),
  });

  const courses = (listQuery.data ?? []) as Course[];
  const loadingInitial = !listQuery.data && listQuery.isLoading;
  const isUpdating = listQuery.isFetching || createMutation.isPending || deleteMutation.isPending || duplicateMutation.isPending || moveMutation.isPending || publishMutation.isPending || updateTitleMutation.isPending;

  return {
    courses,
    loadingInitial,
    isUpdating,
    error: listQuery.error as any,
    refetch,
    createCourse: createMutation.mutateAsync,
    deleteCourse: deleteMutation.mutateAsync,
    duplicateCourse: duplicateMutation.mutateAsync,
    moveCourse: moveMutation.mutateAsync,
    togglePublication: publishMutation.mutateAsync,
    updateTitle: updateTitleMutation.mutateAsync,
    updateCourse: updateCourseMutation.mutateAsync,
  } as const;
}


