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

      // Set authorization header if token is provided
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      // Build URL based on category type
      switch (type) {
        case 'popular':
          url = '/courses?sort=subscribed%3Adesc&pageSize=15&page=1';
          break;
        case 'new':
          url = '/courses?sort=publishedAt:desc&pageSize=10&page=1';
          break;
        case 'suggested':
          url = '/courses/suggested?pageSize=10&page=1';
          break;
        default:
          // Search by name/keyword
          if (!name) {
            throw new Error('Nome é obrigatório para pesquisa');
          }
          url = `/courses?keyword=${encodeURIComponent(toLower(name))}`;
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
      const response = await categoriesClient.get<CategoriesApiResponse>('/courses');

      const coursesBySubject = response.data.data.reduce(
        (acc: Record<string, { id: number; count: number }>, course) => {
          course.subjects.forEach((subject) => {
            if (!acc[subject.name]) {
              acc[subject.name] = {
                id: subject.id,
                count: 1,
              };
            } else {
              acc[subject.name].count++;
            }
          });
          return acc;
        },
        {}
      );

      // TODO: this can be fetched from remote
      const subjectToIcon: Record<string, string> = {
        'Competências Vocacionais': 'construct-outline',
        'Competências Verdes': 'leaf-outline',
        'Mudanças Climáticas': 'cloud-outline',
        'Informação sobre proteção': 'shield-checkmark-outline',
        'Competências Fundamentais': 'school-outline',
        'Competências Digitais': 'laptop-outline',
        'Competências Técnicas Digitais': 'code-outline',
        'Competências da Vida': 'people-outline',
        'Educação Financeira': 'cash-outline',
      };

      const categories = Object.entries(coursesBySubject).map(([name, data]) => ({
        id: data.id,
        name: name,
        courses: data.count,
        icon: subjectToIcon[name] || 'apps-outline',
      }));

      console.log(categories);

      return categories;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(`Erro ao buscar categorias: ${error.response?.status || 'unknown'}`);
      }

      throw new Error('Erro ao carregar categorias');
    }
  }
}
