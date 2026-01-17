import { StyleSheet, View, Text, TouchableOpacity, Platform, Dimensions, ActivityIndicator, StatusBar } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLocalSearchParams, router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Content } from '@/types/learning';
import { useState, useEffect, useMemo, useRef } from 'react';
import { useMarkContentAsCompleted } from '@/services/catalog';
import { useAuthUser } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import Pdf from 'react-native-pdf';

const { width, height } = Dimensions.get('window');

export default function PdfViewer() {
  const { content, userCourseId, moduleId, contentId } = useLocalSearchParams<{
    content: string;
    userCourseId?: string;
    moduleId?: string;
    contentId?: string;
  }>();
  const _content = JSON.parse(content as string) as Content;
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const pdfRef = useRef<any>(null);
  const insets = useSafeAreaInsets();

  // Theme
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  // Auth and progress tracking
  const { data: user } = useAuthUser();
  const markContentAsCompletedMutation = useMarkContentAsCompleted();

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
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
        headerRight: {
          width: 40,
          alignItems: 'center',
        },
        pageIndicator: {
          color: colors.textMuted,
          fontSize: 12,
        },
        pdfContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          position: 'relative',
        },
        pdf: {
          flex: 1,
          width: isFullScreen ? Dimensions.get('window').width : width,
          height: isFullScreen ? Dimensions.get('window').height : height,
          backgroundColor: colors.background,
        },
        webPdfContainer: {
          flex: 1,
          width: '100%',
          height: '100%',
        },
        loadingContainer: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: colors.background,
        },
        loadingText: {
          marginTop: 12,
          color: colors.textMuted,
          fontSize: 14,
        },
        errorContainer: {
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        },
        errorText: {
          color: colors.textMuted,
          fontSize: 16,
          textAlign: 'center',
          marginTop: 12,
        },
        bottomNavigationContainer: {
          position: 'absolute',
          bottom: 16 + insets.bottom,
          left: 0,
          right: 0,
          flexDirection: 'row',
          justifyContent: 'center',
          alignItems: 'center',
          gap: 40,
          zIndex: 10,
        },
        fullscreenButton: {
          position: 'absolute',
          right: 16,
          bottom: 16 + insets.bottom,
          zIndex: 10,
        },
        controlButtonBackground: {
          width: 44,
          height: 44,
          borderRadius: 22,
          backgroundColor: colors.primary,
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
        secondaryControlButtonBackground: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: isDark ? 'rgba(0,0,0,0.6)' : 'rgba(255,255,255,0.8)',
          justifyContent: 'center',
          alignItems: 'center',
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: 2,
          },
          shadowOpacity: 0.25,
          shadowRadius: 3.84,
          elevation: 5,
        },
      }),
    [colors, isDark, isFullScreen, insets]
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

  const handlePrevPage = () => {
    if (currentPage > 1) {
      pdfRef.current?.setPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      pdfRef.current?.setPage(currentPage + 1);
    }
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  const renderPdf = () => {
    if (!_content.url) {
      return (
        <View style={themedStyles.errorContainer}>
          <Feather name="file-text" size={48} color={colors.textMuted} />
          <Text style={themedStyles.errorText}>URL do PDF não disponível</Text>
        </View>
      );
    }

    if (Platform.OS === 'web') {
      return (
        <View style={themedStyles.webPdfContainer}>
          <iframe
            src={_content.url}
            style={{
              width: '100%',
              height: '100%',
              border: 'none',
            } as React.CSSProperties}
            title={_content.title}
          />
        </View>
      );
    }

    return (
      <>
        <Pdf
          ref={pdfRef}
          source={{ uri: _content.url, cache: true }}
          style={themedStyles.pdf}
          trustAllCerts={false}
          onLoadComplete={(numberOfPages) => {
            setTotalPages(numberOfPages);
            setIsLoading(false);
          }}
          onPageChanged={(page) => {
            setCurrentPage(page);
          }}
          onError={(error) => {
            console.error('PDF Error:', error);
            setIsLoading(false);
          }}
          enablePaging={true}
          horizontal={false}
          fitPolicy={0}
          spacing={0}
        />
        {isLoading && (
          <View style={themedStyles.loadingContainer}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={themedStyles.loadingText}>Carregando PDF...</Text>
          </View>
        )}
      </>
    );
  };

  return (
    <SafeAreaView style={themedStyles.container} edges={isFullScreen ? [] : ['top', 'bottom']}>
      <StatusBar hidden={isFullScreen} />
      {!isFullScreen && (
        <View style={themedStyles.header}>
          <TouchableOpacity style={themedStyles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={themedStyles.headerTitle} numberOfLines={1}>
            {_content.title}
          </Text>
          <View style={themedStyles.headerRight}>
            {totalPages > 0 && Platform.OS !== 'web' && (
              <Text style={themedStyles.pageIndicator}>
                {currentPage}/{totalPages}
              </Text>
            )}
          </View>
        </View>
      )}

      <View style={themedStyles.pdfContainer}>
        {renderPdf()}

        {Platform.OS !== 'web' && !isLoading && (
          <>
            {/* Bottom Navigation Controls */}
            <View style={themedStyles.bottomNavigationContainer} pointerEvents="box-none">
              <TouchableOpacity
                disabled={currentPage <= 1}
                style={{ opacity: currentPage <= 1 ? 0 : 1 }}
                onPress={handlePrevPage}
              >
                <View style={themedStyles.controlButtonBackground}>
                  <Feather name="chevron-left" size={24} color="#FFF" />
                </View>
              </TouchableOpacity>

              <TouchableOpacity
                disabled={currentPage >= totalPages}
                style={{ opacity: currentPage >= totalPages ? 0 : 1 }}
                onPress={handleNextPage}
              >
                <View style={themedStyles.controlButtonBackground}>
                  <Feather name="chevron-right" size={24} color="#FFF" />
                </View>
              </TouchableOpacity>
            </View>

            {/* Full Screen Button */}
            <TouchableOpacity style={themedStyles.fullscreenButton} onPress={toggleFullScreen}>
              <View style={themedStyles.secondaryControlButtonBackground}>
                <Feather name={isFullScreen ? "minimize" : "maximize"} size={20} color={colors.text} />
              </View>
            </TouchableOpacity>

            {/* Close Full Screen Button (Top Left) - Optional if user gets stuck */}
            {isFullScreen && (
              <TouchableOpacity
                style={{ position: 'absolute', top: 16, left: 16, zIndex: 11 }}
                onPress={toggleFullScreen}
              >
                <View style={themedStyles.secondaryControlButtonBackground}>
                  <Feather name="x" size={20} color={colors.text} />
                </View>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  );
}
