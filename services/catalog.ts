import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from './api';
import { CourseDetail, CertificateSummary, ForumComment } from '@/types/learning';

// Get course details by documentId
export function useCourseDetails(documentId: string) {
  return useQuery({
    queryKey: ['course', documentId],
    queryFn: async (): Promise<CourseDetail> => {
      const response = await api.get(`/courses/${documentId}`);
      return response.data;
    },
    enabled: !!documentId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error) => {
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

// Get all user courses (with all states)
export function useUserCourses(token: string) {
  return useQuery({
    queryKey: ['user-courses', 'all'],
    queryFn: async () => {
      const response = await api.get('/user-courses', {
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
export function useCertificates(token?: string) {
  return useQuery({
    queryKey: ['certificates', token],
    queryFn: async (): Promise<CertificateSummary[]> => {
      const response = await api.get('/certificates', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    enabled: !!token,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error: any) => {
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
      // 1) Add course to saved courses
      const response = await api.post(
        '/user-courses',
        {
          data: {
            course: courseId,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      const saveResult = response.data;

      // 2) Get user courses to find the newly saved course user-course documentId
      const listResponse = await api.get('/user-courses', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const userCourses: any[] = listResponse?.data?.data || [];
      const matching = userCourses.find((uc: any) => uc?.course?.documentId === courseId);

      if (!matching?.documentId) {
        throw new Error('Falha ao localizar o curso guardado do utilizador');
      }

      const userCourseDocumentId: string = matching.documentId;

      // 3) Get this user-course progress (not strictly needed for the next step, but per spec)
      const userCourseDetails = await api.get(`/user-courses/${userCourseDocumentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const module = userCourseDetails.data.modules[0];
      const content = module.contents[0];
      // 4) Conclude first module/content to initialize progress
      // Assumes module index 1 and content index 1 per provided spec

      const updateProgressResponse = await api.put(
        `/user-courses/${userCourseDetails.data.documentId}/module/${module.moduleId}/content/${content.contentId}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return saveResult;
    },
    onSuccess: () => {
      // Invalidate user courses queries
      queryClient.invalidateQueries({ queryKey: ['user-courses'] });
    },
  });
}

// Mark quiz as completed (for final tests)
export function useMarkQuizAsCompleted() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ grade, courseId, token }: { grade: number; courseId: string; token: string }) => {
      // First, get the user courses to find the specific user-course document ID
      const listResponse = await api.get('/user-courses', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userCourses: any[] = listResponse?.data?.data || [];
      const matchingUserCourse = userCourses.find((uc: any) => uc?.course?.documentId === courseId);

      if (!matchingUserCourse?.documentId) {
        throw new Error('User course not found for course ID: ' + courseId);
      }

      const userCourseDocumentId = matchingUserCourse.documentId;

      // Update the user course with the grade
      const response = await api.put(
        `/user-courses/${userCourseDocumentId}`,
        {
          data: {
            grade: grade,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    },
    onSuccess: () => {
      // Invalidate user courses queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['user-courses'] });
    },
  });
}

// Check if course is in progress
export function useCourseProgress(courseId: string, token: string) {
  const { data: userCourses, isLoading: userCoursesLoading } = useUserCoursesInProgress(token);

  const courseInProgress = userCourses?.data?.find((course: any) => course.course.documentId === courseId);

  return {
    isInProgress: !!courseInProgress,
    progress: courseInProgress?.progress || 0,
    isLoading: !!token && userCoursesLoading,
  };
}

// Conclude module quiz
export function useConcludeModuleQuiz() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      userCourseId,
      moduleId,
      grade,
      token,
    }: {
      userCourseId: string;
      moduleId: number;
      grade: number;
      token: string;
    }) => {
      const response = await api.put(
        `/user-courses/${userCourseId}/module/${moduleId}/quiz`,
        {
          data: {
            grade: grade,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    },
    onSuccess: () => {
      // Invalidate user courses queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['user-courses'] });
      queryClient.invalidateQueries({ queryKey: ['user-courses', 'in-progress'] });
    },
  });
}

// Get user course details by course ID
export function useUserCourseDetails(courseId: string, token: string) {
  return useQuery({
    queryKey: ['user-course-details', courseId],
    queryFn: async () => {
      // First, get the user courses to find the specific user-course document ID
      const listResponse = await api.get('/user-courses', {
        headers: { Authorization: `Bearer ${token}` },
      });

      const userCourses: any[] = listResponse?.data?.data || [];
      const matchingUserCourse = userCourses.find((uc: any) => uc?.course?.documentId === courseId);

      if (!matchingUserCourse?.documentId) {
        throw new Error('User course not found for course ID: ' + courseId);
      }

      const userCourseDocumentId = matchingUserCourse.documentId;

      // Get the user course details
      const response = await api.get(`/user-courses/${userCourseDocumentId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      return {
        ...response.data,
        userCourseId: userCourseDocumentId,
      };
    },
    enabled: !!token && !!courseId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Check if course is finished and certificates should be available
export function useCourseStateAndCertificates(courseId: string, token: string) {
  const { data: userCourses, isLoading: userCoursesLoading } = useUserCourses(token);
  const { data: certificates = [], isLoading: certificatesLoading } = useCertificates(token);

  const userCourse = userCourses?.data?.find((course: any) => course.course.documentId === courseId);
  const courseState = userCourse?.state; // Expected states: 'Started', 'InProgress', 'NotStarted', 'Finished'
  const isCourseFinished = courseState === 'Finished';

  // Only fetch certificates if user is logged in and course is finished
  const shouldFetchCertificates = !!token && isCourseFinished;
  const hasCertificate = shouldFetchCertificates && certificates.some((cert) => cert.course.documentId === courseId);

  return {
    courseState,
    isCourseFinished,
    shouldFetchCertificates,
    hasCertificate,
    certificates: shouldFetchCertificates ? certificates : [],
    isLoading: !!token && (userCoursesLoading || (shouldFetchCertificates && certificatesLoading)),
  };
}

// Get forum comments
export function useForumComments(courseId: string, token?: string) {
  return useQuery({
    queryKey: ['forum-comments', courseId],
    queryFn: async (): Promise<ForumComment[]> => {
      const response = await api.get(`/courses/${courseId}/forum/`);
      return response.data;
    },
    enabled: !!courseId,
    staleTime: 60 * 1000, // 1 minute
  });
}

// Add forum comment
export function useAddForumComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ courseId, comment, token }: { courseId: string; comment: string; token: string }) => {
      const response = await api.post(
        `/courses/${courseId}/forum/comments`,
        {
          data: {
            comment,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['forum-comments', courseId] });
    },
  });
}

// Reply to forum comment
export function useReplyToComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      commentId,
      comment,
      token,
    }: {
      courseId: string;
      commentId: string;
      comment: string;
      token: string;
    }) => {
      const response = await api.post(
        `/courses/${courseId}/forum/comments/${commentId}/replies`,
        {
          data: {
            comment,
          },
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      return response.data;
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['forum-comments', courseId] });
    },
  });
}

// Delete forum comment
export function useDeleteForumComment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      courseId,
      commentUuid,
      token,
    }: {
      courseId: string;
      commentUuid: string;
      token: string;
    }) => {
      const response = await api.delete(`/courses/${courseId}/forum/comments/${commentUuid}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    },
    onSuccess: (_, { courseId }) => {
      queryClient.invalidateQueries({ queryKey: ['forum-comments', courseId] });
    },
  });
}
