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
let usageTrackingStarted = false;
let activeStartedAt = 0;
let lastActiveFlushAt = 0;
let activeFlushInterval: ReturnType<typeof setInterval> | null = null;

const ACTIVE_FLUSH_INTERVAL_MS = 15 * 1000;
const MIN_ACTIVE_SECONDS_TO_SEND = 3;
const MAX_ACTIVE_SECONDS_PER_FLUSH = 10 * 60;

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

function stopActiveFlushInterval() {
  if (!activeFlushInterval) return;
  clearInterval(activeFlushInterval);
  activeFlushInterval = null;
}

function flushActiveTime(reason: string) {
  if (!activeStartedAt || !lastActiveFlushAt) return;

  const now = Date.now();
  const activeSeconds = Math.min(
    Math.floor((now - lastActiveFlushAt) / 1000),
    MAX_ACTIVE_SECONDS_PER_FLUSH
  );

  if (activeSeconds < MIN_ACTIVE_SECONDS_TO_SEND) return;

  lastActiveFlushAt = now;
  trackActivity({
    type: 'APP_ACTIVE',
    metadata: {
      activeSeconds,
      appState: AppState.currentState,
      reason,
    },
  });
}

function startActiveSession() {
  if (!activeStartedAt) {
    const now = Date.now();
    activeStartedAt = now;
    lastActiveFlushAt = now;
    trackAppOpen();
  }

  if (!activeFlushInterval) {
    activeFlushInterval = setInterval(() => flushActiveTime('interval'), ACTIVE_FLUSH_INTERVAL_MS);
  }
}

function stopActiveSession(reason: string) {
  flushActiveTime(reason);
  activeStartedAt = 0;
  lastActiveFlushAt = 0;
  stopActiveFlushInterval();
}

export function startAppUsageTracking() {
  if (usageTrackingStarted) return () => {};
  usageTrackingStarted = true;

  if (!['background', 'inactive'].includes(AppState.currentState)) startActiveSession();

  const subscription = AppState.addEventListener('change', (state) => {
    if (state === 'active') startActiveSession();
    else stopActiveSession(state);
  });

  return () => {
    stopActiveSession('cleanup');
    subscription.remove();
    usageTrackingStarted = false;
  };
}
