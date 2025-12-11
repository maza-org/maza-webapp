import { useQuery } from '@tanstack/react-query';
import { certificatesService } from '@/app/services/certificatesService';

export const useCertificates = (token: string | undefined) => {
  return useQuery({
    queryKey: ['certificates', token],
    queryFn: () => certificatesService.fetchCertificates(token!),
    enabled: !!token,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });
};