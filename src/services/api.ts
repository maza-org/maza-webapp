import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { Platform } from 'react-native';

const configuredApiBase = process.env.EXPO_PUBLIC_API_BASE_URL;
const localApiBase = 'http://127.0.0.1:4000/api';
const productionWebApiBase = '/api';

// Native devices must receive EXPO_PUBLIC_API_BASE_URL from .env because
// their localhost is the device, not this backend machine.
export const API_BASE = configuredApiBase ?? (
  Platform.OS === 'web'
    ? productionWebApiBase
    : localApiBase
);



const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

let memoryToken: string | null | undefined;
const getCache = new Map<string, { expiresAt: number; promise?: Promise<any>; data?: any }>();
const persistentPrefix = 'maza_api_cache:';

const persistentCacheKey = (url: string) => `${persistentPrefix}${url}`;

export function setApiToken(token: string | null) {
  memoryToken = token;
  if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
  else delete api.defaults.headers.common.Authorization;
}

export function clearApiSession() {
  memoryToken = null;
  delete api.defaults.headers.common.Authorization;
  getCache.clear();
}

export function clearApiCache(prefix?: string) {
  if (!prefix) {
    getCache.clear();
    return;
  }
  [...getCache.keys()].forEach((key) => {
    if (key.startsWith(prefix)) getCache.delete(key);
  });
}

export async function clearPersistentApiCache(prefix?: string) {
  try {
    if (!prefix) {
      const keys = await AsyncStorage.getAllKeys();
      const cacheKeys = keys.filter((key) => key.startsWith(persistentPrefix));
      if (cacheKeys.length > 0) await AsyncStorage.multiRemove(cacheKeys);
      return;
    }

    const storagePrefix = persistentCacheKey(prefix);
    const keys = await AsyncStorage.getAllKeys();
    const cacheKeys = keys.filter((key) => key.startsWith(storagePrefix));
    if (cacheKeys.length > 0) await AsyncStorage.multiRemove(cacheKeys);
  } catch {}
}

export async function getCached<T = any>(url: string, ttlMs = 60000): Promise<T> {
  const now = Date.now();
  const cached = getCache.get(url);
  if (cached?.data !== undefined && cached.expiresAt > now) return cached.data as T;
  if (cached?.promise) return cached.promise as Promise<T>;

  const promise = api.get(url).then((res) => {
    getCache.set(url, { data: res.data, expiresAt: Date.now() + ttlMs });
    return res.data as T;
  }).catch((error) => {
    getCache.delete(url);
    throw error;
  });
  getCache.set(url, { promise, expiresAt: now + ttlMs });
  return promise;
}

export async function getPersistentCached<T = any>(
  url: string,
  ttlMs = 300000,
  onStaleData?: (data: T) => void
): Promise<T> {
  const storageKey = persistentCacheKey(url);
  const now = Date.now();
  const cached = getCache.get(url);
  if (cached?.data !== undefined && cached.expiresAt > now) return cached.data as T;

  let staleData: T | undefined;
  try {
    const raw = await AsyncStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      staleData = parsed.data as T;
      if (parsed.expiresAt > now) {
        getCache.set(url, { data: parsed.data, expiresAt: parsed.expiresAt });
        return parsed.data as T;
      }
      if (onStaleData) onStaleData(staleData);
    }
  } catch {}

  try {
    const data = await getCached<T>(url, ttlMs);
    AsyncStorage.setItem(storageKey, JSON.stringify({ data, expiresAt: Date.now() + ttlMs })).catch(() => {});
    return data;
  } catch (error) {
    if (staleData !== undefined) return staleData;
    throw error;
  }
}

export async function refreshPersistentCached<T = any>(url: string, ttlMs = 300000): Promise<T> {
  const storageKey = persistentCacheKey(url);
  const data = await api.get(url).then((res) => res.data as T);
  const expiresAt = Date.now() + ttlMs;
  getCache.set(url, { data, expiresAt });
  AsyncStorage.setItem(storageKey, JSON.stringify({ data, expiresAt })).catch(() => {});
  return data;
}

// Auto-attach token — but don't await if no token exists yet
api.interceptors.request.use(async (config) => {
  try {
    if (memoryToken === undefined) memoryToken = await AsyncStorage.getItem('maza_token');
    const token = memoryToken;
    if (token) config.headers.Authorization = `Bearer ${token}`;
  } catch {
    // Ignore — token just won't be attached (unauthenticated request)
  }
  return config;
});

// Log errors clearly so silent failures show up in console
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (__DEV__) {
      console.log('[API ERROR]', error?.config?.url, error?.response?.status, error?.message);
    }
    return Promise.reject(error);
  }
);

export default api;

export function mapAuthError(error: any) {
  const status = error.response?.status;

  if (status === 400) {
    return "Dados inválidos. Verifique as informações fornecidas.";
  }
  if (status === 401) {
    return "Credenciais inválidas.";
  }
  if (status === 403) {
    return "Acesso negado.";
  }
  if (status === 404) {
    return "Serviço não encontrado.";
  }
  if (status === 417) {
    return "Código inválido ou conta não encontrada.";
  }
  if (status === 429) {
    return "Muitas tentativas. Aguarde alguns minutos.";
  }
  if ([500, 502, 503].includes(status)) {
    return "Erro no servidor. Tente novamente mais tarde.";
  }
  if (error.request) {
    return "Erro de conexão. Verifique a sua internet.";
  }

  return "Ocorreu um erro inesperado.";
}
