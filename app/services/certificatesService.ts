import axios from 'axios';
import { baseUrl } from '@/services/api';
import { CertificatesResponse } from '@/app/types/certificates';

export const certificatesService = {
  async fetchCertificates(token: string): Promise<CertificatesResponse> {
    try {
      const response = await axios.get<CertificatesResponse>(`${baseUrl}/certificates`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        }
        if (error.response?.status === 404) {
          throw new Error('Certificates not found');
        }
        if (error.response?.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch certificates');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },
};
