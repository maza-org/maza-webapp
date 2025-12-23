import { useQuery } from '@tanstack/react-query';
import { CoursesService, CourseData } from '@/app/services/coursesService';
import useUser from '@/hooks/useUser';

// Query Keys
export const coursesQueryKeys = {
  completed: ['courses', 'completed'] as const,
  inProgress: ['courses', 'inProgress'] as const,
  favorites: ['courses', 'favorites'] as const,
  byStatus: (status: string) => ['courses', status] as const,
};

// Hook to fetch completed courses
export function useCompletedCourses() {
  const { data: user } = useUser();

  return useQuery({
    queryKey: coursesQueryKeys.completed,
    queryFn: () => {
      if (!user?.token) {
        throw new Error('No authentication token found');
      }
      return CoursesService.fetchCompletedCourses(user.token);
    },
    enabled: !!user?.token,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Hook to fetch in-progress courses
export function useInProgressCourses() {
  const { data: user } = useUser();

  return useQuery({
    queryKey: coursesQueryKeys.inProgress,
    queryFn: () => {
      if (!user?.token) {
        throw new Error('No authentication token found');
      }
      return CoursesService.fetchInProgressCourses(user.token);
    },
    enabled: !!user?.token,
    staleTime: 1000 * 60 * 3, // 3 minutes (more frequent for active courses)
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Hook to fetch favorite courses
export function useFavoriteCourses() {
  const { data: user } = useUser();

  return useQuery({
    queryKey: coursesQueryKeys.favorites,
    queryFn: () => {
      if (!user?.token) {
        throw new Error('No authentication token found');
      }
      return CoursesService.fetchFavoriteCourses(user.token);
    },
    enabled: !!user?.token,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Generic hook to fetch courses by status
export function useCoursesByStatus(status: 'completed' | 'inProgress' | 'favorites') {
  switch (status) {
    case 'completed':
      return useCompletedCourses();
    case 'inProgress':
      return useInProgressCourses();
    case 'favorites':
      return useFavoriteCourses();
    default:
      throw new Error(`Invalid course status: ${status}`);
  }
}
