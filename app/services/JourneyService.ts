import api from '@/services/api';
import { Root } from '@/app/types/journeys';

class JourneyService {
  static async getJourneys() {
    try {
      const { data } = await api.get<Root>('/journeys?populate=categories');

      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getJourneyById(id: string) {
    try {
      const { data } = await api.get<{ data: Root['data'][0] }>(`/journeys/${id}?populate=categories`);
      return data;
    } catch (error) {
      throw error;
    }
  }

  static async getJourneyCourses(journeyDocumentId: string) {
    try {
      const { data } = await api.get<{ data: any[] }>(
        `/courses?filters[journey][documentId][$eq]=${journeyDocumentId}&populate[0]=cover&populate[1]=picture`
      );
      return data.data;
    } catch (error) {
      throw error;
    }
  }
}

export default JourneyService;
