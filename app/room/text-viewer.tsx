import {
  ScrollView,
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { router } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';
import { Content } from '@/types/learning';
import { useState, useEffect, useMemo } from 'react';
import { useMarkContentAsCompleted } from '@/services/catalog';
import { useAuthUser } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';

export default function TextViewer() {
  const { content, userCourseId, moduleId, contentId } = useLocalSearchParams<{
    content: string;
    userCourseId?: string;
    moduleId?: string;
    contentId?: string;
  }>();
  const _content = JSON.parse(content as string) as Content;
  const [hasReachedBottom, setHasReachedBottom] = useState(false);

  // Theme
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  // Auth and progress tracking
  const { data: user } = useAuthUser();
  const markContentAsCompletedMutation = useMarkContentAsCompleted();

  const themedStyles = useMemo(() => StyleSheet.create({
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
    },
    scrollView: {
      flex: 1,
    },
    scrollViewContent: {
      padding: 24,
      flexGrow: 1,
    },
    bottomPadding: {
      height: 80,
    },
  }), [colors, isDark]);

  const themedMarkdownStyles = useMemo(() => ({
    body: {
      color: colors.text,
      fontSize: 16,
      lineHeight: 24,
    },
    heading1: {
      fontSize: 24,
      fontWeight: '700' as const,
      marginVertical: 16,
      color: colors.text,
    },
    heading2: {
      fontSize: 20,
      fontWeight: '600' as const,
      marginVertical: 12,
      color: colors.text,
    },
    strong: {
      color: colors.primary,
      fontWeight: '600' as const,
    },
    paragraph: {
      marginVertical: 8,
      color: colors.textMuted,
    },
    list: {
      marginLeft: 20,
    },
    listItem: {
      marginVertical: 4,
      color: colors.textMuted,
    },
    listUnorderedItemIcon: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.primary,
    },
    hr: {
      backgroundColor: colors.border,
      height: 1,
      marginVertical: 16,
    },
    link: {
      color: colors.primary,
    },
    blockquote: {
      backgroundColor: colors.cardBackground,
      borderLeftColor: colors.primary,
      borderLeftWidth: 4,
      padding: 8,
      marginVertical: 8,
    },
    blockquoteText: {
      color: colors.textMuted,
    },
    code_inline: {
      backgroundColor: colors.cardBackground,
      color: colors.primary,
      paddingHorizontal: 4,
      paddingVertical: 2,
      borderRadius: 4,
    },
    code_block: {
      backgroundColor: colors.cardBackground,
      padding: 16,
      borderRadius: 8,
      marginVertical: 8,
    },
  }), [colors]);

  // Mark content as completed when page opens (if user is authenticated)
  useEffect(() => {
    if (!user?.token || !userCourseId || !moduleId || !contentId) return;

    markContentAsCompletedMutation.mutate({
      userCourseId,
      moduleId: parseInt(moduleId, 10),
      contentId: parseInt(contentId, 10),
      token: user.token,
    });
  }, [user?.token, userCourseId, moduleId, contentId]);

  const handleScroll = ({ nativeEvent }: NativeSyntheticEvent<NativeScrollEvent>) => {
    const { layoutMeasurement, contentOffset, contentSize } = nativeEvent;
    const paddingToBottom = 20;

    const isCloseToBottom = layoutMeasurement.height + contentOffset.y >= contentSize.height - paddingToBottom;

    if (isCloseToBottom && !hasReachedBottom) {
      setHasReachedBottom(true);
      // Add your logic here when bottom is reached
    }
  };

  return (
    <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
      <View style={themedStyles.header}>
        <TouchableOpacity style={themedStyles.backButton} onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={themedStyles.headerTitle} numberOfLines={1}>
          {_content.title}
        </Text>
        <View style={themedStyles.headerRight} />
      </View>

      <ScrollView
        style={themedStyles.scrollView}
        contentContainerStyle={themedStyles.scrollViewContent}
        onScroll={handleScroll}
        scrollEventThrottle={400}
        showsVerticalScrollIndicator={true}
      >
        <Markdown style={themedMarkdownStyles}>{_content.description || ''}</Markdown>
        {/* Bottom padding to ensure content isn't cut off */}
        <View style={themedStyles.bottomPadding} />
      </ScrollView>
    </SafeAreaView>
  );
}
