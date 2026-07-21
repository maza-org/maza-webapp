import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { Platform } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { startAppUsageTracking } from './src/services/analytics';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Root() {
  const { isDark } = useTheme();
  const { token, loading } = useAuth();

  useEffect(() => {
    if (loading || !token) return;
    return startAppUsageTracking();
  }, [loading, token]);

  return (
    <>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </>
  );
}

export default function App() {
  useEffect(() => {
    if (Platform.OS !== 'web') return;

    const style = document.createElement('style');
    style.setAttribute('data-maza-web-viewport', 'true');
    style.textContent = `
      html, body, #root {
        width: 100%;
        min-width: 0;
        height: 100%;
        margin: 0;
        overflow-x: hidden;
        touch-action: pan-y;
        -webkit-overflow-scrolling: touch;
      }
      *, *::before, *::after {
        box-sizing: border-box;
      }
      #root [role="button"],
      #root button,
      #root a {
        touch-action: pan-y;
      }
      #root [style*="overflow"] {
        -webkit-overflow-scrolling: touch;
      }
    `;
    document.head.appendChild(style);

    return () => {
      style.remove();
    };
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <Root />
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
