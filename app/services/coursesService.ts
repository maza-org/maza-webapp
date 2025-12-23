import axios from 'axios';
import { baseUrl } from '@/services/api';

// Create axios instance for courses
const coursesClient = axios.create({
  baseURL: baseUrl,
  timeout: 30000,
});

export interface CourseData {
  id: string;
  course: {
    title: string;
    author: string;
    rating_avg: number;
    duration: string;
    picture?: {
      formats?: {
        thumbnail?: {
          url: string;
        };
      };
    };
  };
}

export interface CompletedCoursesResponse {
  data: CourseData[];
}

export class CoursesService {
  static async fetchCompletedCourses(token: string): Promise<CourseData[]> {
    try {
      const response = await coursesClient.get<CompletedCoursesResponse>('/user-courses?status=Completed', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        switch (status) {
          case 204:
            return []; // No content
          case 400:
            throw new Error('Requisição inválida (400). Verifique os dados enviados.');
          case 401:
            throw new Error('Não autorizado (401). Sessão expirada?');
          case 403:
            throw new Error('Acesso negado (403). Você não tem permissão para ver isto.');
          case 404:
            throw new Error('Recurso não encontrado (404).');
          case 500:
            throw new Error('Erro interno do servidor (500). Tente novamente mais tarde.');
          case 503:
            throw new Error('Serviço temporariamente indisponível (503).');
          default:
            throw new Error(`Erro inesperado (${status || 'unknown'}).`);
        }
      }

      throw new Error('Erro desconhecido ao buscar cursos.');
    }
  }

  static async fetchInProgressCourses(token: string): Promise<CourseData[]> {
    try {
      const response = await coursesClient.get<CompletedCoursesResponse>('/user-courses?status=InProgress', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        throw new Error(`Erro ao buscar cursos em progresso (${status || 'unknown'}).`);
      }

      throw new Error('Erro desconhecido ao buscar cursos em progresso.');
    }
  }

  static async fetchFavoriteCourses(token: string): Promise<CourseData[]> {
    try {
      const response = await coursesClient.get<CompletedCoursesResponse>('/user-courses?status=Favorite', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        throw new Error(`Erro ao buscar cursos favoritos (${status || 'unknown'}).`);
      }

      throw new Error('Erro desconhecido ao buscar cursos favoritos.');
    }
  }
}
