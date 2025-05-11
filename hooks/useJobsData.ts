import { useState, useCallback, useEffect } from 'react';
import { Job } from '@/types/job';

const API_ENDPOINT = 'https://www.emprego.co.mz/wp-api/vacancies/front';

export function useJobsData() {
  const [state, setState] = useState<{
    jobs: Job[];
    isLoading: boolean;
    isRefreshing: boolean;
    error?: string;
  }>({
    jobs: [],
    isLoading: true,
    isRefreshing: false,
    error: undefined,
  });

  const fetchJobs = useCallback(async (isRefreshing = false) => {
    try {
      setState((prev) => ({
        ...prev,
        isLoading: !isRefreshing,
        isRefreshing,
        error: undefined,
      }));

      const response = await fetch(API_ENDPOINT, {
        method: 'GET',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setState((prev) => ({
          ...prev,
          jobs: data.results || [],
          isLoading: false,
          isRefreshing: false,
        }));
        return;
      }

      const errorMessages: Record<number, string> = {
        400: 'Requisição inválida. Por favor, tente novamente.',
        401: 'Não autorizado. Por favor, faça login novamente.',
        403: 'Acesso proibido. Não tem permissão para ver estas oportunidades.',
        404: 'Recurso não encontrado. A API solicitada não existe.',
        429: 'Muitas requisições. Atingiu o limite de requisições permitidas.',
        500: 'Erro no servidor. Por favor, tente novamente mais tarde.',
        503: 'Serviço indisponível. O servidor está temporariamente fora do ar.',
      };

      const errorMessage = errorMessages[response.status] || `Erro desconhecido! Status: ${response.status}`;

      throw new Error(errorMessage);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Erro ao carregar as oportunidades. Tente novamente mais tarde.';

      setState((prev) => ({
        ...prev,
        error: errorMessage,
        isLoading: false,
        isRefreshing: false,
      }));

      console.error('Error fetching jobs:', err);
    }
  }, []);

  const refreshJobs = useCallback(() => {
    fetchJobs(true);
  }, [fetchJobs]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    ...state,
    refreshJobs,
    fetchJobs,
  };
}
