import axios from 'axios';
import { baseUrl } from '@/services/api';
import { TopicsResponse, UpdateInterestsRequest } from '@/app/types/customize';

export const customizeService = {
  async fetchTopics(): Promise<TopicsResponse> {
    try {
      const response = await axios.get<TopicsResponse>(
        `${baseUrl}/subjects?fields=name&sort=name`
      );
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Topics not found');
        }
        if (error.response?.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error(error.response?.data?.message || 'Failed to fetch topics');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  async updateInterests(token: string, interests: string[]): Promise<void> {
    try {
      const requestData: UpdateInterestsRequest = {
        data: {
          interests
        }
      };

      const response = await axios.post(
        `${baseUrl}/users-permissions/interests`,
        requestData,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 200 && response.status !== 201) {
        throw new Error('Failed to update interests');
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        }
        if (error.response?.status === 403) {
          throw new Error('Forbidden. You do not have permission to perform this action.');
        }
        if (error.response?.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error(error.response?.data?.message || 'Failed to update interests');
      }
      throw new Error('Network error. Please check your connection.');
    }
  },

  async removeInterest(token: string, documentId: string): Promise<void> {
    try {
      const response = await axios.delete(
        `${baseUrl}/users-permissions/interests/${documentId}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.status !== 200 && response.status !== 204) {
        throw new Error(`Failed to remove interest ${documentId}`);
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized. Please log in again.');
        }
        if (error.response?.status === 404) {
          throw new Error('Interest not found');
        }
        if (error.response?.status >= 500) {
          throw new Error('Server error. Please try again later.');
        }
        throw new Error(error.response?.data?.message || `Failed to remove interest ${documentId}`);
      }
      throw new Error('Network error. Please check your connection.');
    }
  }
};