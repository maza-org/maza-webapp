import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { API_BASE } from './api';
import { getStoredAuthToken } from './secure-storage';

const QUEUE_KEY = 'maza_offline_request_queue';
let pending: Promise<unknown> = Promise.resolve();

function serialize<T>(operation: () => Promise<T>): Promise<T> {
  const result = pending.then(operation, operation);
  pending = result.catch(() => undefined);
  return result;
}

async function accountQueueKey() {
  const raw = await AsyncStorage.getItem('maza_user');
  const user = raw ? JSON.parse(raw) : null;
  if (!user?.id || !(await getStoredAuthToken())) throw new Error('Entre na sua conta para guardar esta ação.');
  return `${QUEUE_KEY}:${encodeURIComponent(user.id)}`;
}

type QueuedRequest = {
  id: string;
  method: 'post' | 'patch' | 'put';
  url: string;
  data?: any;
  queuedAt: string;
};

function validateRequest(request: Pick<QueuedRequest, 'method' | 'url'>) {
  if (!request || !['post', 'patch', 'put'].includes(request.method)
    || typeof request.url !== 'string'
    || !/^\/[a-zA-Z0-9]/.test(request.url)
    || /[\\\s]/.test(request.url)) {
    throw new Error('Ação offline inválida.');
  }
}

async function readQueue(key: string): Promise<QueuedRequest[]> {
  const value = JSON.parse(await AsyncStorage.getItem(key) ?? '[]');
  if (!Array.isArray(value)) throw new Error('Não foi possível ler as ações guardadas.');
  return value;
}

export async function queueOfflineRequest(request: Omit<QueuedRequest, 'id' | 'queuedAt'>) {
  validateRequest(request);
  const key = await accountQueueKey();
  return serialize(async () => {
    const queue = await readQueue(key);
    const duplicateIndex = queue.findIndex((item) => item.method === request.method && item.url === request.url);
    const item = { ...request, id: `${Date.now()}-${Math.random()}`, queuedAt: new Date().toISOString() };
    if (duplicateIndex >= 0) queue[duplicateIndex] = item;
    else queue.push(item);
    await AsyncStorage.setItem(key, JSON.stringify(queue));
  });
}

export async function flushOfflineQueue() {
  const key = await accountQueueKey();
  const token = await getStoredAuthToken();
  return serialize(async () => {
    const queue = await readQueue(key);
    const remaining: QueuedRequest[] = [];
    let synced = 0;
    for (const item of queue) {
      try {
        validateRequest(item);
        if (await accountQueueKey() !== key || await getStoredAuthToken() !== token) {
          remaining.push(item);
          continue;
        }
        await axios.request({
          baseURL: API_BASE, timeout: 15000,
          method: item.method, url: item.url, data: item.data,
          headers: { Authorization: `Bearer ${token}` },
        });
        synced += 1;
      } catch {
        // Preserve rejected actions for retry or recovery.
        remaining.push(item);
      }
    }
    await AsyncStorage.setItem(key, JSON.stringify(remaining));
    return { synced, remaining: remaining.length };
  });
}

export async function getOfflineQueueCount() {
  const key = await accountQueueKey();
  return serialize(async () => (await readQueue(key)).length);
}
