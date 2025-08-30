import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useJobs } from './useJobs';
import { Job } from '@/types/job';

type JobWithCompatibility = Job & {
  city?: { id: number; slug: string; name: string };
  category?: { id: number; slug: string; name: string };
};

export function useJobsData() {
  const queryClient = useQueryClient();
  const { data: jobs = [], isLoading, error, refetch, isFetching } = useJobs();

  const fetchJobs = useCallback(async () => {
    await refetch();
  }, [refetch]);

  const refreshJobs = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['jobs'] });
  }, [queryClient]);

  const formattedError =
    error instanceof Error
      ? error.message
      : typeof error === 'string'
        ? error
        : 'Erro ao carregar as oportunidades. Tente novamente mais tarde.';

  return {
    jobs,
    isLoading,
    isRefreshing: isFetching && !isLoading,
    error: error ? formattedError : undefined,
    fetchJobs,
    refreshJobs,
  };
}
