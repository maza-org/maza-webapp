import axios from 'axios';
import { baseUrl } from '@/services/api';
import { Certificate } from '@/app/types/profile';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: baseUrl,
  timeout: 30000,
});

export class ProfileService {
  static async fetchCertificates(token: string): Promise<Certificate[]> {
    const response = await apiClient.get('/certificates', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.data;
  }

  static async deleteInterest(documentId: string, token: string): Promise<void> {
    await apiClient.delete(`/users-permissions/interests/${documentId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
  }

  static async logout(): Promise<void> {
    // Simulate logout delay
    await new Promise((resolve) => setTimeout(resolve, 500));
    // The actual removal from AsyncStorage will be handled by the mutation
  }
}
