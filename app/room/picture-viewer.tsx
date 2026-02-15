import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator, StatusBar, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Content } from '@/types/learning';
import { useState, useEffect, useMemo } from 'react';
import { useMarkContentAsCompleted } from '@/services/catalog';
import { useAuthUser } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import { Image } from 'expo-image';
import { baseUrl } from '@/services/api';

const getFullMediaUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;

  const mediaBaseUrl = baseUrl.replace(/\/api$/, '');

  return `${mediaBaseUrl}${url}`;
};

export default function PictureViewer() {
  const { content, userCourseId, moduleId, contentId } = useLocalSearchParams<{
    content: string;
    userCourseId?: string;
    moduleId?: string;
    contentId?: string;
  }>();
  // Safe parsing in case content is missing
  const _content = content ? (JSON.parse(content as string) as Content) : ({} as Content);

  const [isLoading, setIsLoading] = useState(true);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Theme
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  // Auth and progress tracking
  const { data: user } = useAuthUser();
  const markContentAsCompletedMutation = useMarkContentAsCompleted();

  const imageUrl = useMemo(() => {
    return getFullMediaUrl(_content.file?.url || _content.url);
  }, [_content]);

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: '#000', // Black background for image viewer usually looks better
        },
        header: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 12,
          zIndex: 10,
          backgroundColor: 'rgba(0,0,0,0.5)',
        },
        backButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: 'rgba(255,255,255,0.2)',
          justifyContent: 'center',
          alignItems: 'center',
        },
        headerTitle: {
          flex: 1,
          color: '#FFF',
          fontSize: 16,
          fontWeight: '600',
          textAlign: 'center',
          marginHorizontal: 16,
        },
        headerRight: {
          width: 40,
        },
        imageContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
        },
        image: {
          width: '100%',
          height: '100%',
        },
        errorContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        },
        errorText: {
          color: '#FFF',
          fontSize: 16,
          textAlign: 'center',
          marginTop: 12,
        },
        loadingContainer: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
        },
      }),
    [colors, isDark]
  );

  // Mark content as completed when page opens
  useEffect(() => {
    if (!user?.token || !userCourseId || !moduleId || !contentId) return;

    markContentAsCompletedMutation.mutate({
      userCourseId,
      moduleId: parseInt(moduleId, 10),
      contentId: parseInt(contentId, 10),
      token: user.token,
    });
  }, [user?.token, userCourseId, moduleId, contentId]);

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <SafeAreaView style={themedStyles.container} edges={isFullScreen ? [] : ['top', 'bottom']}>
      <StatusBar barStyle="light-content" hidden={isFullScreen} />

      {!isFullScreen && (
        <View style={themedStyles.header}>
          <TouchableOpacity style={themedStyles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={themedStyles.headerTitle} numberOfLines={1}>
            {_content.title}
          </Text>
          <View style={themedStyles.headerRight} />
        </View>
      )}

      <View style={themedStyles.imageContainer}>
        <TouchableOpacity activeOpacity={1} onPress={toggleFullScreen} style={{ flex: 1, width: '100%' }}>
          {imageUrl ? (
            <Image
              source={{ uri: imageUrl }}
              style={themedStyles.image}
              contentFit="contain"
              onLoadStart={() => setIsLoading(true)}
              onLoad={() => setIsLoading(false)}
              onError={() => setIsLoading(false)}
            />
          ) : (
            <View style={themedStyles.errorContainer}>
              <Feather name="image" size={48} color="#666" />
              <Text style={themedStyles.errorText}>URL da Imagem não disponível</Text>
            </View>
          )}

          {isLoading && (
            <View style={themedStyles.loadingContainer}>
              <ActivityIndicator size="large" color="#FFF" />
            </View>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
