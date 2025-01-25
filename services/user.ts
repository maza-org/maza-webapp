import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { User } from '@/types/user';

export async function getCachedUserData(): Promise<User | null> {
  try {
    const userData = await AsyncStorage.getItem('@user');
    if (userData !== null) {
      return JSON.parse(userData) as User;
    }
    return null;
  } catch (error) {
    console.error('Error loading user data:', error);
    throw new Error('Falha ao carregar dados do utilizador');
  }
}

export async function getUserData(token: string) {
  try {
    const response = await api.get('/user');
  } catch (error) {
    throw new Error('Falha ao carregar dados do utilizador');
  }
}
