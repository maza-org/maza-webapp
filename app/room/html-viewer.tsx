import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Content } from '@/types/learning';
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useMarkContentAsCompleted } from '@/services/catalog';
import { useAuthUser } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import { WebView, WebViewMessageEvent } from 'react-native-webview';
import { baseUrl } from '@/services/api';

const getFullMediaUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;
  const mediaBaseUrl = baseUrl.replace(/\/api$/, '');
  return `${mediaBaseUrl}${url}`;
};

const NOTIFY_COMPLETE_SCRIPT = `
  window.notifyComplete = function() {
    window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'QUIZ_COMPLETE' }));
  };
  true;
`;

export default function HtmlViewer() {
  const { content, userCourseId, moduleId, contentId } = useLocalSearchParams<{
    content: string;
    userCourseId?: string;
    moduleId?: string;
    contentId?: string;
  }>();
  const _content = content ? (JSON.parse(content as string) as Content) : ({} as Content);

  const [htmlContent, setHtmlContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompleted, setHasCompleted] = useState(false);

  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const { data: user } = useAuthUser();
  const markContentAsCompletedMutation = useMarkContentAsCompleted();

  const htmlUrl = useMemo(() => {
    return getFullMediaUrl(_content.file?.url || _content.url);
  }, [_content]);

  // Fetch HTML as text so WebView gets inline content — avoids Android JS sandbox issues with remote URIs
  useEffect(() => {
    if (!htmlUrl) return;
    fetch(htmlUrl)
      .then((res) => res.text())
      .then((html) => {
        setHtmlContent(html);
        setIsLoading(false);
      })
      .catch(() => setIsLoading(false));
  }, [htmlUrl]);

  const markCompleted = useCallback(() => {
    if (hasCompleted || !user?.token || !userCourseId || !moduleId || !contentId) return;
    setHasCompleted(true);
    markContentAsCompletedMutation.mutate({
      userCourseId,
      moduleId: parseInt(moduleId, 10),
      contentId: parseInt(contentId, 10),
      token: user.token,
    });
  }, [hasCompleted, user?.token, userCourseId, moduleId, contentId]);

  const handleMessage = useCallback(
    (event: WebViewMessageEvent) => {
      try {
        const data = JSON.parse(event.nativeEvent.data);
        if (data.type === 'QUIZ_COMPLETE') markCompleted();
      } catch {
        // ignore malformed messages
      }
    },
    [markCompleted]
  );

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        container: { flex: 1, backgroundColor: colors.background },
        header: {
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        backButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.05)',
          justifyContent: 'center',
          alignItems: 'center',
        },
        headerTitle: {
          flex: 1,
          color: colors.text,
          fontSize: 18,
          fontWeight: '600',
          textAlign: 'center',
          marginHorizontal: 16,
        },
        headerRight: { width: 40 },
        webViewContainer: { flex: 1 },
        webView: { flex: 1, backgroundColor: colors.background },
        loadingContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        },
        loadingText: { marginTop: 12, color: colors.textMuted, fontSize: 14 },
        errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
        errorText: { color: colors.textMuted, fontSize: 16, textAlign: 'center', marginTop: 12 },
      }),
    [colors, isDark]
  );

  const header = (
    <View style={themedStyles.header}>
      <TouchableOpacity style={themedStyles.backButton} onPress={() => router.back()}>
        <Feather name="chevron-left" size={24} color={colors.text} />
      </TouchableOpacity>
      <Text style={themedStyles.headerTitle} numberOfLines={1}>
        {_content.title}
      </Text>
      <View style={themedStyles.headerRight} />
    </View>
  );

  if (!htmlUrl) {
    return (
      <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
        {header}
        <View style={themedStyles.errorContainer}>
          <Feather name="code" size={48} color={colors.textMuted} />
          <Text style={themedStyles.errorText}>Conteúdo não disponível</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isLoading) {
    return (
      <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
        {header}
        <View style={themedStyles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={themedStyles.loadingText}>Carregando...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (Platform.OS === 'web') {
    return (
      <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
        {header}
        <View style={themedStyles.webViewContainer}>
          <iframe
            src={htmlUrl}
            style={{ width: '100%', height: '100%', border: 'none' } as React.CSSProperties}
            title={_content.title}
            onLoad={markCompleted}
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
      {header}
      <View style={themedStyles.webViewContainer}>
        <WebView
          source={{ html: htmlContent ?? '', baseUrl: htmlUrl }}
          style={themedStyles.webView}
          injectedJavaScript={NOTIFY_COMPLETE_SCRIPT}
          onMessage={handleMessage}
          onLoadEnd={markCompleted}
          setSupportMultipleWindows={false}
          domStorageEnabled={false}
          javaScriptEnabled={true}
          mediaPlaybackRequiresUserAction={false}
        />
      </View>
    </SafeAreaView>
  );
}
