import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_BASE, clearApiSession, setApiToken } from '../services/api';
import { getStoredAuthToken, removeStoredAuthToken, storeAuthToken } from '../services/secure-storage';

type UserProfile = {
  totalPoints: number;
  currentStreak: number;
  assessmentDone: boolean;
  botSessionId?: string | null;
};

type User = {
  id: string;
  name: string | null;
  username?: string | null;
  email?: string | null;
  phone: string | null;
  idDocument?: string | null;
  occupation?: string | null;
  dob?: string | null;
  educationLevel?: string | null;
  school?: string | null;
  province?: string | null;
  district?: string | null;
  age?: number | null;
  gender?: string | null;
  role: string;
  profile?: UserProfile | null;
  enrollments?: {
    courseId: string;
    progress: number;
    completedAt?: string | null;
    enrolledAt?: string | null;
  }[];
  impact?: {
    averageImpactPercent: number | null;
    averageImpactPoints: number | null;
    averageBaseline: number | null;
    averageEndline: number | null;
    completedCourses: number;
  } | null;
  monitoring?: {
    totalDaysPlayed: number;
    minutesInsideApp: number;
    completion: number;
    progress: number;
    enrolledCourses: number;
    completedCertificates: number;
  } | null;
};

type AuthContextType = {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (identifier: string, password?: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: User) => Promise<void>;
  setSession: (token: string, fullUser: User) => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({} as AuthContextType);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await getStoredAuthToken();
        const storedUser = await AsyncStorage.getItem('maza_user');
        if (storedToken && storedUser) {
          const parsedUser = JSON.parse(storedUser);
          setApiToken(storedToken);

          // Always fetch fresh profile FIRST so assessmentDone is current
          // before the navigator renders — prevents routing to wrong screen
          try {
            const meRes = await fetch(`${API_BASE}/auth/me`, {
              headers: { Authorization: `Bearer ${storedToken}` },
            });
            if (meRes.ok) {
              const meData = await meRes.json();
              const refreshed = { ...meData };
              await AsyncStorage.setItem('maza_user', JSON.stringify(refreshed));
              setToken(storedToken);
              setUser(refreshed);
            } else {
              // Token expired — log out silently
              await removeStoredAuthToken();
              await AsyncStorage.removeItem('maza_user');
            }
          } catch {
            // Offline — use cached data as fallback
            setToken(storedToken);
            setUser(parsedUser);
          }
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const login = async (identifier: string, password?: string) => {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data?.error ?? 'Login failed');

    const { token: t } = data;
    let fullUser = data.user;

    // Fetch full profile to get assessmentDone and all user fields
    try {
      const meRes = await fetch(`${API_BASE}/auth/me`, {
        headers: { Authorization: `Bearer ${t}` },
      });
      if (meRes.ok) {
        fullUser = await meRes.json();
      }
    } catch { /* fallback to login data */ }

    await storeAuthToken(t);
    await AsyncStorage.setItem('maza_user', JSON.stringify(fullUser));
    setApiToken(t);
    setToken(t);
    setUser(fullUser);
  };

  const logout = async () => {
    try {
      await removeStoredAuthToken();
      await AsyncStorage.removeItem('maza_user');
    } catch (e) {
      try {
        await removeStoredAuthToken();
        await AsyncStorage.removeItem('maza_user');
      } catch (err) {}
    } finally {
      clearApiSession();
      setToken(null);
      setUser(null);
    }
  };

  const updateUser = async (updatedUser: User) => {
    const mergedUser = user ? { ...user, ...updatedUser, profile: updatedUser.profile ?? user.profile } : updatedUser;
    await AsyncStorage.setItem('maza_user', JSON.stringify(mergedUser));
    setUser(mergedUser);
  };

  const setSession = async (t: string, fullUser: User) => {
    await storeAuthToken(t);
    await AsyncStorage.setItem('maza_user', JSON.stringify(fullUser));
    setApiToken(t);
    setToken(t);
    setUser(fullUser);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, logout, updateUser, setSession }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
