import { AppState } from 'react-native';
import api from './api';

type TrackActivityInput = {
  type: string;
  courseId?: string | null;
  lessonId?: string | null;
  quizId?: string | null;
  jobId?: string | null;
  metadata?: Record<string, unknown>;
};

const sessionId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
let lastAppOpenTrackedAt = 0;

export function trackActivity(input: TrackActivityInput) {
  const type = String(input.type || '').trim().toUpperCase();
  if (!type) return;

  api.post('/analytics/track', {
    ...input,
    type,
    source: 'MOBILE',
    sessionId,
  }, { timeout: 5000 }).catch(() => {});
}

export function trackAppOpen() {
  const now = Date.now();
  if (now - lastAppOpenTrackedAt < 5 * 60 * 1000) return;
  lastAppOpenTrackedAt = now;
  trackActivity({ type: 'APP_OPEN', metadata: { appState: AppState.currentState } });
}
