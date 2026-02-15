import axios from 'axios';
import { toLower } from 'ramda';
import { baseUrl } from '@/services/api';
import {
  CourseData,
  CoursesApiResponse,
  CategoryQueryParams,
  Category,
  CategoriesApiResponse,
} from '@/app/types/categories';
import { data } from 'browserslist';

// Create axios instance for categories
const categoriesClient = axios.create({
  baseURL: baseUrl,
  timeout: 30000,
});

export class CategoriesService {
  static async fetchCoursesByCategory(params: CategoryQueryParams): Promise<CourseData[]> {
    try {
      const { type, name, token } = params;
      let url: string;
      const headers: Record<string, string> = {};

      // Build URL based on category type
      switch (type) {
        case 'popular':
          url = '/courses?sort=subscribed%3Adesc&pageSize=15&page=1';
          break;
        case 'new':
          url = '/courses?sort=publishedAt%3Adesc&pageSize=10&page=1';
          break;
        case 'suggested':
          url = '/courses/suggested?pageSize=10&page=1';
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }
          break;
        case 'category':
          if (!params.id) {
            throw new Error('ID da categoria é obrigatório');
          }
          url = `/courses?subjects=${params.id}`;
          break;
        default:
          if (!params.id) {
            throw new Error('ID da categoria é obrigatório');
          }
          url = `/courses?subjects=${params.id}`;
          break;
      }
      const response = await categoriesClient.get<CoursesApiResponse>(url, { headers });
      return response.data.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;

        switch (status) {
          case 400:
            throw new Error('Requisição inválida. Verifique os parâmetros.');
          case 401:
            throw new Error('Não autorizado. Sessão expirada?');
          case 403:
            throw new Error('Acesso negado.');
          case 404:
            throw new Error('Cursos não encontrados.');
          case 500:
            throw new Error('Erro interno do servidor. Tente novamente mais tarde.');
          case 503:
            throw new Error('Serviço temporariamente indisponível.');
          default:
            throw new Error(`Falha ao carregar cursos: ${status || 'unknown'}`);
        }
      }

      if (error instanceof Error) {
        throw error;
      }

      throw new Error('Não foi possível carregar os cursos. Verifique sua conexão e tente novamente.');
    }
  }

  static async searchCourses(keyword: string): Promise<CourseData[]> {
    try {
      const response = await categoriesClient.get<CoursesApiResponse>(
        `/courses?keyword=${encodeURIComponent(toLower(keyword))}`
      );

      return response.data.data || [];
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Erro na pesquisa: ${error.response?.status || 'unknown'}`);
      }

      throw new Error('Erro ao pesquisar cursos');
    }
  }

  static async getPopularCourses(pageSize: number = 15): Promise<CourseData[]> {
    return this.fetchCoursesByCategory({ type: 'popular' });
  }

  static async getNewCourses(pageSize: number = 10): Promise<CourseData[]> {
    return this.fetchCoursesByCategory({ type: 'new' });
  }

  static async getSuggestedCourses(token: string, pageSize: number = 10): Promise<CourseData[]> {
    return this.fetchCoursesByCategory({ type: 'suggested', token });
  }

  static async fetchCategories(): Promise<Category[]> {
    try {
      const response = await categoriesClient.get<CategoriesApiResponse>('/subjects');

      return response.data.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Erro ao buscar categorias: ${error.response?.status || 'unknown'}`);
      }

      throw new Error('Erro ao carregar categorias');
    }
  }
}
