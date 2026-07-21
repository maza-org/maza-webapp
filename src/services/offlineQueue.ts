import AsyncStorage from '@react-native-async-storage/async-storage';
import api from './api';

const QUEUE_KEY = 'maza_offline_request_queue';

type QueuedRequest = {
  id: string;
  method: 'post' | 'patch' | 'put';
  url: string;
  data?: any;
  queuedAt: string;
};

async function readQueue(): Promise<QueuedRequest[]> {
  try { return JSON.parse(await AsyncStorage.getItem(QUEUE_KEY) ?? '[]'); }
  catch { return []; }
}

export async function queueOfflineRequest(request: Omit<QueuedRequest, 'id' | 'queuedAt'>) {
  const queue = await readQueue();
  const duplicateIndex = queue.findIndex((item) => item.method === request.method && item.url === request.url);
  const item = { ...request, id: `${Date.now()}-${Math.random()}`, queuedAt: new Date().toISOString() };
  if (duplicateIndex >= 0) queue[duplicateIndex] = item;
  else queue.push(item);
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
}

export async function flushOfflineQueue() {
  const queue = await readQueue();
  const remaining: QueuedRequest[] = [];
  let synced = 0;
  for (const item of queue) {
    try {
      await api.request({ method: item.method, url: item.url, data: item.data });
      synced += 1;
    } catch (error: any) {
      // Never discard a learner action merely because the current session or
      // server version rejected it. It can be retried after login or an update.
      remaining.push(item);
    }
  }
  await AsyncStorage.setItem(QUEUE_KEY, JSON.stringify(remaining));
  return { synced, remaining: remaining.length };
}
