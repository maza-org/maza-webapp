import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { AppState, Platform, StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import * as SplashScreen from 'expo-splash-screen';
import { AuthProvider } from './src/context/AuthContext';
import { ThemeProvider, useTheme } from './src/context/ThemeContext';
import AppNavigator from './src/navigation/AppNavigator';
import { trackAppOpen } from './src/services/analytics';

SplashScreen.preventAutoHideAsync().catch(() => {});

function Root() {
  const { isDark } = useTheme();
  return (
    <View style={styles.appRoot}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      <AppNavigator />
    </View>
  );
}

export default function App() {
  useEffect(() => {
    trackAppOpen();
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active') trackAppOpen();
    });
    return () => subscription.remove();
  }, []);

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
      }
      body {
        background: #eef5fb;
      }
      *, *::before, *::after {
        box-sizing: border-box;
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
          {Platform.OS === 'web' ? (
            <View style={styles.webViewport}>
              <View style={styles.webShell}>
                <Root />
              </View>
            </View>
          ) : (
            <Root />
          )}
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  appRoot: {
    flex: 1,
    minHeight: 0,
  },
  webViewport: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    backgroundColor: '#eef5fb',
  },
  webShell: {
    flex: 1,
    width: '100%',
    maxWidth: 1180,
    minHeight: '100%',
    backgroundColor: '#FAFAFA',
  },
});
