import { useQuery } from '@tanstack/react-query';
import { CategoriesService } from '@/app/services/categoriesService';
import { CourseData, CategoryQueryParams } from '@/app/types/categories';
import useUser from '@/hooks/useUser';

// Query Keys
export const categoriesQueryKeys = {
  courses: ['categories', 'courses'] as const,
  byType: (type: string) => ['categories', 'courses', type] as const,
  byName: (name: string) => ['categories', 'courses', 'search', name] as const,
  popular: () => ['categories', 'courses', 'popular'] as const,
  new: () => ['categories', 'courses', 'new'] as const,
  suggested: () => ['categories', 'courses', 'suggested'] as const,
  custom: (params: CategoryQueryParams) => ['categories', 'courses', params.type, params.name, params.id] as const,
};

// Main hook for fetching courses by category
export function useCoursesByCategory(params: CategoryQueryParams) {
  return useQuery({
    queryKey: categoriesQueryKeys.custom(params),
    queryFn: () => CategoriesService.fetchCoursesByCategory(params),
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: (failureCount, error) => {
      // Don't retry on auth errors
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
    enabled: !!params.type, // Only run query if type is provided
  });
}

// Hook for popular courses
export function usePopularCourses() {
  return useQuery({
    queryKey: categoriesQueryKeys.popular(),
    queryFn: () => CategoriesService.getPopularCourses(),
    staleTime: 1000 * 60 * 10, // 10 minutes (popular courses change less frequently)
  });
}

// Hook for new courses
export function useNewCourses() {
  return useQuery({
    queryKey: categoriesQueryKeys.new(),
    queryFn: () => CategoriesService.getNewCourses(),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook for suggested courses (requires authentication)
export function useSuggestedCourses() {
  const { data: user } = useUser();

  return useQuery({
    queryKey: categoriesQueryKeys.suggested(),
    queryFn: () => {
      if (!user?.token) {
        throw new Error('Token de autenticação necessário');
      }
      return CategoriesService.getSuggestedCourses(user.token);
    },
    enabled: !!user?.token,
    staleTime: 1000 * 60 * 3, // 3 minutes (more frequent for personalized content)
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}

// Hook for course search
export function useSearchCourses(keyword: string, enabled: boolean = true) {
  return useQuery({
    queryKey: categoriesQueryKeys.byName(keyword),
    queryFn: () => CategoriesService.searchCourses(keyword),
    enabled: enabled && !!keyword.trim() && keyword.trim().length >= 2, // Only search if keyword has at least 2 characters
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Dynamic hook that chooses the right query based on type
export function useCategoryQuery(type: string, name?: string, id?: string | number, token?: string) {
  const params: CategoryQueryParams = { type, name, id, token };
  switch (type) {
    case 'popular':
      return usePopularCourses();
    case 'new':
      return useNewCourses();
    case 'suggested':
      return useSuggestedCourses();
    case 'category':
      return useCoursesByCategory(params);
    default:
      return useCoursesByCategory(params);
  }
}

// Hook for fetching categories list
export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: () => CategoriesService.fetchCategories(),
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: (failureCount, error) => {
      if (error?.message?.includes('401') || error?.message?.includes('403')) {
        return false;
      }
      return failureCount < 2;
    },
  });
}
