import { useQuery } from '@tanstack/react-query';
import { getCachedUserData } from '@/services/user';
import { User } from '@/types/user';

export default function useUser() {
  const query = useQuery<User | null>({
    queryKey: ['user'],
    queryFn: getCachedUserData,
    staleTime: 0, // Data is considered stale immediately
    gcTime: 0, // Don't cache the data
    refetchOnMount: true, // Always refetch when component mounts
    refetchOnWindowFocus: true, // Refetch when window regains focus
    refetchOnReconnect: true, // Refetch when network reconnects
  });

  return {
    ...query,
    refresh: () => query.refetch(),
  };
}
