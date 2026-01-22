import React from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack, useRouter, useSegments, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect, useState } from 'react';
import 'react-native-reanimated';
import * as Sentry from '@sentry/react-native';
import { isRunningInExpoGo } from 'expo';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { hasSeenOnboarding } from '@/util/onboarding';
import { ThemeProvider, useTheme } from '@/contexts/ThemeContext';
import { PostHogProvider, usePostHog } from 'posthog-react-native';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';
// Prevent the splash screen from auto-hiding before asset loading is complete.
SplashScreen.preventAutoHideAsync();

// Only initialize Sentry in production
if (process.env.NODE_ENV === 'production') {
  // Construct a new integration instance. This is needed to communicate between the integration and React
  const navigationIntegration = Sentry.reactNavigationIntegration({
    enableTimeToInitialDisplay: !isRunningInExpoGo(),
  });

  Sentry.init({
    dsn: 'https://703cf8daf0b6979b53253ad09bdf358c@o4509072021127168.ingest.de.sentry.io/4509072023617616',
    debug: false, // If `true`, Sentry will try to print out useful debugging information if something goes wrong with sending the event. Set it to `false` in production
    tracesSampleRate: 1.0, // Set tracesSampleRate to 1.0 to capture 100% of transactions for tracing. Adjusting this value in production.
    integrations: [
      // Pass integration
      navigationIntegration,
    ],
    enableNativeFramesTracking: !isRunningInExpoGo(), // Tracks slow and frozen frames in the application
  });
}

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60,
      refetchOnWindowFocus: false,
      refetchOnReconnect: true,
      refetchOnMount: true,
    },
  },
});

function RootLayout() {
  const [loaded, error] = useFonts({
    ManropeRegular: require('../assets/fonts/Manrope-Regular.ttf'),
    ManropeBold: require('../assets/fonts/Manrope-Bold.ttf'),
    ManropeMedium: require('../assets/fonts/Manrope-Medium.ttf'),
    ...FontAwesome.font,
  });

  // Expo Router uses Error Boundaries to catch errors in the navigation tree.
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  if (!loaded) {
    return null;
  }

  return <RootLayoutNav onReady={() => SplashScreen.hideAsync()} />;
}

export default RootLayout;

function RootLayoutNav({ onReady }: { onReady: () => void }) {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const checkOnboardingStatus = async () => {
      try {
        const hasCompleted = await hasSeenOnboarding();

        // If user has seen onboarding, redirect to main app
        if (hasCompleted) {
          router.replace('/(tabs)');
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error);
      } finally {
        setIsReady(true);
      }
    };

    checkOnboardingStatus();
  }, []);

  useEffect(() => {
    if (isReady) {
      onReady();
    }
  }, [isReady, onReady]);

  // Always render the full tree - splash screen stays visible until isReady
  // This prevents any white screen flash
  return (
    <PostHogProvider
      apiKey={process.env.EXPO_PUBLIC_POSTHOG_API_KEY}
      options={{
        host: 'https://us.i.posthog.com',
        enableSessionReplay: false,
        disabled: __DEV__,
      }}
      autocapture={{
        captureScreens: false, // We'll handle screen tracking manually for Expo Router
        captureTouches: true,
      }}
    >
      <SafeAreaProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <ThemedNavigator />
          </ThemeProvider>
        </QueryClientProvider>
      </SafeAreaProvider>
    </PostHogProvider>
  );
}

function ThemedNavigator() {
  const { isDark } = useTheme();
  const posthog = usePostHog();
  const pathname = usePathname();
  const segments = useSegments();

  // Track screen views whenever the route changes
  useEffect(() => {
    if (posthog && pathname) {
      posthog.screen(pathname, {
        segments: segments.join('/'),
      });
    }
  }, [pathname, segments, posthog]);

  return (
    <NavigationThemeProvider value={isDark ? { ...DarkTheme } : DefaultTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </NavigationThemeProvider>
  );
}

