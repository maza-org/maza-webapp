import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SurveyQuestionsResponse, SurveySubmissionRequest, SurveySubmissionResponse } from '@/types/survey';
import surveyApi from './api';

// Add interceptors for debugging
surveyApi.interceptors.request.use(
  (config) => {
    console.log('Survey API Request:', config.method?.toUpperCase(), config.url);
    return config;
  },
  (error) => {
    console.error('Survey API Request Error:', error);
    return Promise.reject(error);
  }
);

surveyApi.interceptors.response.use(
  (response) => {
    console.log('Survey API Response:', response.status, response.config.url);
    return response;
  },
  (error) => {
    console.error('Survey API Response Error:', error.response?.status, error.config?.url, error.message);
    return Promise.reject(error);
  }
);

/**
 * Hook to fetch survey questions
 */
export function useSurveyQuestions() {
  return useQuery({
    queryKey: ['survey-questions'],
    queryFn: async (): Promise<SurveyQuestionsResponse> => {
      const response = await surveyApi.get('/questions');
      return response.data;
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
  });
}

/**
 * Hook to submit survey responses
 */
export function useSubmitSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      token,
      answers,
    }: {
      token: string;
      answers: SurveySubmissionRequest;
    }): Promise<SurveySubmissionResponse> => {
      const response = await surveyApi.post('/users-permissions/survey', answers, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return {
        success: true,
        message: 'Survey submitted successfully',
      };
    },
    onSuccess: () => {
      // Invalidate user data to refresh profile
      queryClient.invalidateQueries({ queryKey: ['auth-user'] });
      queryClient.invalidateQueries({ queryKey: ['user-data'] });
    },
    retry: 1,
  });
}
