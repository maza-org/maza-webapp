import { useQuery } from '@tanstack/react-query';
import { searchService } from '@/app/services/searchService';

export const useSearchCourses = (keyword: string) => {
  return useQuery({
    queryKey: ['search-courses', keyword],
    queryFn: () => searchService.searchCourses(keyword),
    enabled: !!keyword,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
