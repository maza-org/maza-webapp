import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface User {
  id: number;
  documentId: string;
  fullname: string;
  email?: string;
  phone: string;
  yomaId?: string;
  token: string;
  interests?: Array<{
    id: number;
    documentId: string;
    name: string;
  }>;
  profile_image?: {
    formats?: {
      thumbnail?: {
        url: string;
      };
    };
  };
}

export default function useUser() {
  const [data, setData] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('@user');
      if (userJson) {
        setData(JSON.parse(userJson));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch user'));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const refetch = async () => {
    setIsLoading(true);
    await fetchUser();
  };

  return { data, isLoading, error, refetch };
}
