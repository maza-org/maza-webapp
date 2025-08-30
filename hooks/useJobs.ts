import { useQuery } from '@tanstack/react-query';
import { Job } from '@/types/job';
import jobsApi from '@/services/jobsApi';

type JobWithCompatibility = Job & {
  city?: { id: number; slug: string; name: string };
  category?: { id: number; slug: string; name: string };
};

export function useJobs() {
  return useQuery({
    queryKey: ['jobs'],
    queryFn: async (): Promise<JobWithCompatibility[]> => {
      const response = await jobsApi.get('/vacancies/front');
      const jobs = response.data.results || [];

      return jobs.map((job: any) => ({
        ...job,
        city: job.locations && job.locations.length > 0 ? job.locations[0] : undefined,
        category: job.categories && job.categories.length > 0 ? job.categories[0] : undefined,
      }));
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useJobDetails(slug: string) {
  return useQuery({
    queryKey: ['job', slug],
    queryFn: async (): Promise<JobWithCompatibility> => {
      const response = await jobsApi.get(`/vacancies?name=${slug}`);

      if (!response.data.results || response.data.results.length === 0) {
        throw new Error('Vaga não encontrada');
      }

      const job = response.data.results[0];
      return {
        ...job,
        city: job.locations && job.locations.length > 0 ? job.locations[0] : undefined,
        category: job.categories && job.categories.length > 0 ? job.categories[0] : undefined,
      };
    },
    enabled: !!slug,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: (failureCount, error: any) => {
      if (error.response?.status >= 400 && error.response?.status < 500) {
        return false;
      }
      return failureCount < 3;
    },
  });
}

export function useJobSearch(query: string) {
  return useQuery({
    queryKey: ['jobs', 'search', query],
    queryFn: async (): Promise<JobWithCompatibility[]> => {
      const response = await jobsApi.get(`/search/?s=${encodeURIComponent(query)}`);

      if (!response.data.results) return [];

      return response.data.results.map((job: any) => ({
        ...job,
        city: job.locations && job.locations.length > 0 ? job.locations[0] : undefined,
        category: job.categories && job.categories.length > 0 ? job.categories[0] : undefined,
      }));
    },
    enabled: !!query && query.trim().length > 0,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
}
