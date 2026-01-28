import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePostHog } from 'posthog-react-native';
import { AuthUser } from '@/types/learning';
import api from '@/services/api';
import { User } from '@/types/user';
import { identifyAnalyticsUser, posthogClient } from '@/utils/analytics';

// Get cached user data with API refresh
export function useAuthUser() {
  return useQuery({
    queryKey: ['auth-user'],
    queryFn: async (): Promise<AuthUser | null> => {
      try {
        // Get the stored user object
        const userDataString = await AsyncStorage.getItem('@user');
        if (!userDataString) {
          return null;
        }

        const cachedUser = JSON.parse(userDataString) as AuthUser;
        if (!cachedUser.token) {
          return null;
        }

        // Fetch fresh user data from API
        const response = await api.get('/users/me', {
          headers: {
            Authorization: `Bearer ${cachedUser.token}`,
          },
        });

        const userData = response.data;

        // Transform the API response to match our AuthUser interface
        const user: AuthUser = {
          id: userData.id.toString(),
          documentId: userData.documentId,
          email: userData.email,
          fullname: userData.fullname,
          phone: userData.phone,
          yoma_id: userData.yoma_id,
          token: cachedUser.token,
        };

        // Update the cached data with fresh data
        await AsyncStorage.setItem('@user', JSON.stringify(user));

        return user;
      } catch (error) {
        console.error('Error fetching user data:', error);
        // If API call fails, try to return cached data as fallback
        try {
          const cachedUserData = await AsyncStorage.getItem('@user');
          if (cachedUserData !== null) {
            return JSON.parse(cachedUserData) as AuthUser;
          }
        } catch (cacheError) {
          console.error('Error loading cached user data:', cacheError);
        }
        throw new Error('Falha ao carregar dados do utilizador');
      }
    },
    staleTime: 0, // Always consider data stale to check for updates
    gcTime: 10 * 60 * 1000, // 10 minutes
    refetchOnWindowFocus: true, // Refetch when app comes back to focus
    refetchOnMount: true, // Refetch when component mounts
  });
}

// Get user data by token
export function useGetUserData(token: string) {
  return useQuery({
    queryKey: ['user-data', token],
    queryFn: async (): Promise<AuthUser | null> => {
      const response = await api.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const userData = response.data;

      // Transform the API response to match our AuthUser interface
      const user: AuthUser = {
        id: userData.id.toString(),
        documentId: userData.documentId,
        email: userData.email,
        fullname: userData.fullname,
        phone: userData.phone,
        yoma_id: userData.yoma_id,
        token: token,
      };

      return user;
    },
    enabled: !!token,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Set user data in cache and identify user in PostHog
export function useSetUserData() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (user: User) => {
      await AsyncStorage.setItem('@user', JSON.stringify(user));
      return user;
    },
    onSuccess: (user) => {
      // Update the auth user query
      queryClient.setQueryData(['auth-user'], user);

      // Identify user in PostHog for analytics tracking
      identifyAnalyticsUser(user);
    },
  });
}

// Clear user data (logout) and reset PostHog identity
export function useLogout() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await AsyncStorage.removeItem('@user');
    },
    onSuccess: () => {
      // Clear all user-related queries
      queryClient.clear();

      // Reset PostHog identity so events are anonymous again
      if(posthogClient){
        posthogClient.reset();
      }
    },
  });
}
