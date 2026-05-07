import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePostHog } from 'posthog-react-native';
import { ProfileService } from '@/app/services/profileService';
import { Certificate, Subject } from '@/app/types/profile';
import useUser from '@/hooks/useUser';
import { useToast } from '@/hooks/useToast';
import { router } from 'expo-router';

// Query Keys
export const profileQueryKeys = {
  certificates: ['certificates'] as const,
  user: ['user'] as const,
  interests: ['interests'] as const,
};

// Hook to fetch certificates
export function useCertificates() {
  const { data: user } = useUser();

  return useQuery({
    queryKey: profileQueryKeys.certificates,
    queryFn: () => {
      if (!user?.token) {
        throw new Error('No authentication token found');
      }
      return ProfileService.fetchCertificates(user.token);
    },
    enabled: !!user?.token,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}

// Hook to delete an interest
export function useDeleteInterest() {
  const { data: user, refetch: refetchUser } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (subject: Subject) => {
      if (!user?.token) {
        throw new Error('No authentication token found');
      }
      await ProfileService.deleteInterest(subject.documentId, user.token);
    },
    onMutate: async () => {
      // Could add optimistic updates here if needed
    },
    onSuccess: async () => {
      Alert.alert('Sucesso', 'Interesse removido com sucesso');
      await refetchUser();
      // Invalidate user data to refresh interests
      queryClient.invalidateQueries({ queryKey: profileQueryKeys.user });
    },
    onError: (error) => {
      console.error('Error deleting interest:', error);
      Alert.alert('Erro', 'Falha ao remover interesse');
    },
  });
}

// Hook to handle logout
export function useLogout() {
  const { showLoading, showSuccess, hideToast } = useToast();
  const queryClient = useQueryClient();
  const posthog = usePostHog();

  return useMutation({
    mutationFn: async () => {
      showLoading('A terminar sessão...');
      await ProfileService.logout();
      await AsyncStorage.removeItem('@user');
    },
    onSuccess: () => {
      hideToast();
      showSuccess('Sessão terminada com sucesso');

      // Reset PostHog identity so events are anonymous again
      posthog?.reset();

      // Clear all cached data
      queryClient.clear();

      setTimeout(() => {
        router.replace('/');
      }, 1000);
    },
    onError: (error) => {
      console.error('Error during logout:', error);
      hideToast();
      Alert.alert('Erro', 'Falha ao terminar sessão');
    },
  });
}

// Hook to handle profile refresh
export function useProfileRefresh() {
  const { refetch: refetchUser } = useUser();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      await refetchUser();
      await queryClient.invalidateQueries({ queryKey: profileQueryKeys.certificates });
    },
    onError: (error) => {
      console.error('Error refreshing profile data:', error);
    },
  });
}
