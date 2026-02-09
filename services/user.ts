import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';
import { User } from '@/types/user';

export async function getCachedUserData(): Promise<User | null> {
  try {
    // Get the stored user object
    const userDataString = await AsyncStorage.getItem('@user');
    if (!userDataString) {
      return null;
    }

    const cachedUser = JSON.parse(userDataString) as User;
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
    console.log('DEBUG: userData from API:', JSON.stringify(userData, null, 2));

    // Transform the API response to match our User interface
    const user: User = {
      id: userData.id,
      documentId: userData.documentId,
      email: userData.email,
      fullname: userData.fullname,
      name: userData.name,
      username: userData.username,
      surname: userData.surname,
      middlename: userData.middlename,
      phone: userData.phone,
      yoma_id: userData.yoma_id,
      gender: userData.gender,
      dateOfBirth: userData.dateOfBirth,
      nationalID: userData.nationalID,
      province: userData.province,
      district: userData.district,
      occupation: userData.occupation,
      academicInstitution: userData.academicInstitution,
      academicLevel: userData.academicLevel,
      token: cachedUser.token,
      interests: userData.interests || [],
      profile_image: userData.profile_image,
      survey: userData.survey || null,
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
        return JSON.parse(cachedUserData) as User;
      }
    } catch (cacheError) {
      console.error('Error loading cached user data:', cacheError);
    }
    throw new Error('Falha ao carregar dados do utilizador');
  }
}

export async function getUserData(token: string): Promise<User | null> {
  try {
    const response = await api.get('/users/me', {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const userData = response.data;

    // Transform the API response to match our User interface
    const user: User = {
      id: userData.id,
      documentId: userData.documentId,
      email: userData.email,
      fullname: userData.fullname,
      name: userData.name,
      surname: userData.surname,
      middlename: userData.middlename,
      phone: userData.phone,
      yoma_id: userData.yoma_id,
      gender: userData.gender,
      dateOfBirth: userData.dateOfBirth,
      nationalID: userData.nationalID,
      province: userData.province,
      district: userData.district,
      occupation: userData.occupation,
      username: userData.username,
      academicInstitution: userData.academicInstitution,
      academicLevel: userData.academicLevel,
      token: token,
      interests: userData.interests || [],
      profile_image: userData.profile_image,
      survey: userData.survey || null,
    };

    return user;
  } catch (error) {
    console.error('Error fetching user data:', error);
    throw new Error('Falha ao carregar dados do utilizador');
  }
}
