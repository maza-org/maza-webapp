import { useQuery } from '@tanstack/react-query';
import { getCachedUserData } from '@/services/user';
import { User } from '@/types/user';

export default function useUser() {
  return useQuery<User | null>({
    queryKey: ['user'],
    queryFn: getCachedUserData,
  });
}
