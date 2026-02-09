import { useMutation, useQuery, UseMutationOptions } from '@tanstack/react-query';
import { ChatMessage, SelfAssessmentRequest, SelfAssessmentResponse } from '@/types/self-assessment';
import api from './api';

export function useInitSelfAssessment(token?: string) {
  return useQuery({
    queryKey: ['self-assessment', 'init', token],
    queryFn: async (): Promise<SelfAssessmentResponse> => {
      const response = await api.post<SelfAssessmentResponse>(
        '/users-permissions/survey',
        { messages: [] } as SelfAssessmentRequest,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 60000,
        }
      );

      if (!response.data?.reply?.content) {
        throw new Error('Invalid response from server');
      }

      return response.data;
    },
    enabled: !!token,
    staleTime: Infinity,
    retry: 3,
  });
}

export function useSelfAssessment(
  options?: UseMutationOptions<SelfAssessmentResponse, Error, { token: string; messages: ChatMessage[] }>
) {
  return useMutation({
    mutationFn: async ({
      token,
      messages,
    }: {
      token: string;
      messages: ChatMessage[];
    }): Promise<SelfAssessmentResponse> => {
      const response = await api.post<SelfAssessmentResponse>(
        '/users-permissions/survey',
        { messages } as SelfAssessmentRequest,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          timeout: 60000,
        }
      );

      if (!response.data?.reply?.content) {
        throw new Error('Invalid response from server');
      }

      return response.data;
    },
    retry: 1,
    ...options,
  });
}
