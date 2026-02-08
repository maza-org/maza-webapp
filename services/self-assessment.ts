import { useMutation } from '@tanstack/react-query';
import { ChatMessage, SelfAssessmentRequest, SelfAssessmentResponse } from '@/types/self-assessment';
import api from './api';

export function useSelfAssessment() {
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
          timeout: 60000, // 60 seconds - API may take time for AI response
        }
      );
      return response.data;
    },
    retry: 1,
  });
}
