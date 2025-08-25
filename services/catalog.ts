import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import { CourseDetail, CertificateSummary } from '@/types/learning';

// Get course details by documentId
export function useCourseDetails(documentId: string) {
  return useQuery({
    queryKey: ['course', documentId],
    queryFn: async (): Promise<CourseDetail> => {
      console.log('Fetching course details for:', documentId);
      const response = await api.get(`/courses/${documentId}`);
      console.log('Course details response:', response.data);
      return response.data;
    },
    enabled: !!documentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
      console.log('Course details retry attempt:', failureCount, error.message);
      return failureCount < 3;
    },
  });
}

// Get user courses in progress
export function useUserCoursesInProgress(token: string) {
  return useQuery({
    queryKey: ['user-courses', 'in-progress'],
    queryFn: async () => {
      const response = await api.get('/user-courses?status=InProgress', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get certificates
export function useCertificates() {
  return useQuery({
    queryKey: ['certificates'],
    queryFn: async (): Promise<CertificateSummary[]> => {
      console.log('Fetching certificates...');
      const response = await api.get('/certificates');
      console.log('Certificates response:', response.data);
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error: any) => {
      console.log('Certificates retry attempt:', failureCount, error.message);
      // Don't retry on 4xx errors (client errors)
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

// Get user favorites
export function useUserFavorites(token: string) {
  return useQuery({
    queryKey: ['user-favorites'],
    queryFn: async () => {
      const response = await api.get('/user-courses/favorites', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: !!token,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Check if course is in favorites
export function useIsFavorite(courseId: string, token: string) {
  const { data: favorites, isLoading: favoritesLoading } = useUserFavorites(token);

  return {
    isFavorite: favorites?.data?.some((favorite: any) => favorite.course.documentId === courseId) || false,
    isLoading: !!token && favoritesLoading,
  };
}

// Add course to favorites
export function useAddToFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, token }: { courseId: string; token: string }) => {
      const response = await api.post(
        '/user-courses/favorites',
        {
          data: {
            course: courseId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onMutate: async ({ courseId, token }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user-favorites'] });

      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData(['user-favorites']);

      // Optimistically update to the new value
      queryClient.setQueryData(['user-favorites'], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: [...old.data, { course: { documentId: courseId } }],
        };
      });

      // Return a context object with the snapshotted value
      return { previousFavorites };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFavorites) {
        queryClient.setQueryData(['user-favorites'], context.previousFavorites);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
    },
  });
}

// Remove course from favorites
export function useRemoveFromFavorites() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, token }: { courseId: string; token: string }) => {
      const response = await api.delete(`/user-courses/favorites/${courseId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onMutate: async ({ courseId, token }) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['user-favorites'] });

      // Snapshot the previous value
      const previousFavorites = queryClient.getQueryData(['user-favorites']);

      // Optimistically update to the new value
      queryClient.setQueryData(['user-favorites'], (old: any) => {
        if (!old?.data) return old;
        return {
          ...old,
          data: old.data.filter((favorite: any) => favorite.course.documentId !== courseId),
        };
      });

      // Return a context object with the snapshotted value
      return { previousFavorites };
    },
    onError: (err, variables, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousFavorites) {
        queryClient.setQueryData(['user-favorites'], context.previousFavorites);
      }
    },
    onSettled: () => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: ['user-favorites'] });
    },
  });
}

// Start course (add to user courses)
export function useStartCourse() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, token }: { courseId: string; token: string }) => {
      const response = await api.post(
        '/user-courses',
        {
          courseId,
          status: 'InProgress',
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      // Invalidate user courses queries
      queryClient.invalidateQueries({ queryKey: ['user-courses'] });
    },
  });
}

// Check if course is in progress
export function useCourseProgress(courseId: string, token: string) {
  const { data: userCourses, isLoading: userCoursesLoading } = useUserCoursesInProgress(token);

  return {
    isInProgress: userCourses?.data?.some((course: any) => course.course.documentId === courseId) || false,
    isLoading: !!token && userCoursesLoading,
  };
}
