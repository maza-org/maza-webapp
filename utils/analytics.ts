import PostHog from 'posthog-react-native';
import { User } from '@/types/user';

export const posthogClient = new PostHog(process.env.EXPO_PUBLIC_POSTHOG_API_KEY!, {
  host: 'https://us.i.posthog.com',
  enableSessionReplay: false,
  disabled: __DEV__,
});

export const identifyAnalyticsUser = (user: User) => {
  if (posthogClient) {
    posthogClient.identify(user.documentId, {
      name: user.fullname,
      identifier: user.email || user.phone,
    });
  }
};
