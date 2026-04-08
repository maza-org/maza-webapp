import PostHog from 'posthog-react-native';
import { User } from '@/types/user';

let posthogClient: PostHog | null = null;

try {
  const apiKey = process.env.EXPO_PUBLIC_POSTHOG_API_KEY;
  if (apiKey) {
    posthogClient = new PostHog(apiKey, {
      host: 'https://us.i.posthog.com',
      enableSessionReplay: false,
      disabled: __DEV__,
      captureAppLifecycleEvents: true,
    });
  } else {
    console.warn('[Analytics] PostHog API key not set, analytics disabled');
  }
} catch (error) {
  console.warn('[Analytics] Failed to initialize PostHog:', error);
}

export { posthogClient };

export const identifyAnalyticsUser = (user: User) => {
  try {
    posthogClient?.identify(user.documentId, {
      name: user.fullname,
      identifier: user.email || user.phone,
    });
  } catch (error) {
    console.warn('[Analytics] Failed to identify user:', error);
  }
};
