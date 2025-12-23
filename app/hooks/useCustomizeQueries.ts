import { useQuery, useMutation } from '@tanstack/react-query';
import { customizeService } from '@/app/services/customizeService';

export const useTopics = () => {
  return useQuery({
    queryKey: ['topics'],
    queryFn: customizeService.fetchTopics,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
  });
};

export const useUpdateInterests = () => {
  return useMutation({
    mutationFn: ({ token, interests }: { token: string; interests: string[] }) =>
      customizeService.updateInterests(token, interests),
  });
};

export const useRemoveInterest = () => {
  return useMutation({
    mutationFn: ({ token, documentId }: { token: string; documentId: string }) =>
      customizeService.removeInterest(token, documentId),
  });
};
