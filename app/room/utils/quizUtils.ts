import { Duration } from '@/types/quiz';

export const calculateDurationInSeconds = (duration: Duration): number => {
  if (!duration.type && duration.value) {
    return duration.value * 60;
  }

  switch (duration.type) {
    case 'hours':
      return duration.value * 60 * 60;
    case 'minutes':
      return duration.value * 60;
    case 'seconds':
      return duration.value;
    default:
      return 10 * 60; // Default to 10 minutes as fallback
  }
};

export const formatTime = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
};