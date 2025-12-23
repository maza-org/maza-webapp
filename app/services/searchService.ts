import axios from 'axios';
import { baseUrl } from '@/services/api';
import { SearchResponse } from '@/app/types/search';

export const searchService = {
  async searchCourses(keyword: string): Promise<SearchResponse> {
    if (!keyword) {
      return {
        data: [],
        meta: {
          pagination: {
            page: 1,
            pageSize: 0,
            pageCount: 0,
            total: 0,
          },
        },
      };
    }

    try {
      const response = await axios.get<SearchResponse>(`${baseUrl}/courses?keyword=${encodeURIComponent(keyword)}`);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Courses not found');
        }
        if (error.response?.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error(error.response?.data?.message || 'Failed to search courses');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
};
