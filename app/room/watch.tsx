import React, { useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEventListener } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { Content, ContentState, Quiz, QuizState } from '@/types/learning';
import ModuleItem from '@/components/ModuleItem';
import { useMarkContentAsCompleted } from '@/services/catalog';
import { useAuthUser } from '@/hooks/useAuth';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import { baseUrl } from '@/services/api';
import YoutubePlayerModal from '@/components/YoutubePlayerModal';
import AudioPlayerModal from '@/components/AudioPlayerModal';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

const getFullMediaUrl = (url?: string): string => {
  if (!url) return '';
  if (url.startsWith('http') || url.startsWith('blob:')) return url;

  const mediaBaseUrl = baseUrl.replace(/\/api$/, '');

  return `${mediaBaseUrl}${url}`;
};

const LocalVideoPlayerModal = ({ videoUrl, onVideoEnd }: { videoUrl: string; onVideoEnd: () => void }) => {
  const fullVideoUrl = getFullMediaUrl(videoUrl);
  const player = useVideoPlayer(fullVideoUrl, (player) => {
    player.loop = false;
    player.play();
  });

  useEventListener(player, 'playToEnd', () => {
    onVideoEnd();
  });

  return (
    <View style={videoStyles.videoContainer}>
      <TouchableOpacity style={videoStyles.closeButton} onPress={onVideoEnd}>
        <Ionicons name="close" size={24} color="#FFF" />
      </TouchableOpacity>
      <VideoView
        style={{ width: width, height: height, flex: 1 }}
        player={player}
        allowsFullscreen
        allowsPictureInPicture
        nativeControls
        fullscreenOptions={{ enable: true, orientation: 'landscape', autoExitOnRotate: true }}
      />
    </View>
  );
};

const videoStyles = StyleSheet.create({
  videoContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#000',
    zIndex: 999,
  },
  closeButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 50 : 20,
    right: 20,
    zIndex: 1000,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 20,
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

// Extended content type that handles both Content and UserCourseContent
interface ExtendedContent extends Content {
  contentId?: number;
  state?: ContentState;
  date?: string | null;
}

// Extended quiz type that handles both Quiz and UserCourseQuiz
interface ExtendedQuiz extends Quiz {
  quizId?: number;
  state?: QuizState;
  date?: string | null;
  grade?: number | null;
}

// Extended module type that handles both regular Module and UserCourseModule
interface ExtendedModuleData {
  id: number;
  moduleId?: number;
  title: string;
  quiz: ExtendedQuiz;
  description?: string;
  contents: ExtendedContent[];
}

export default function CourseScreen() {
  const { module, author, title, imageUrl, userCourseId, moduleId } = useLocalSearchParams();
  const moduleData = useMemo((): ExtendedModuleData | null => {
    try {
      return module ? JSON.parse(module as string) : null;
    }
    catch {
      return null;
    }
  }, [module]);
  const [playing, setPlaying] = React.useState(false);
  const [selectedContent, setSelectedContent] = React.useState<ExtendedContent | undefined>(undefined);
  const [showAudioPlayer, setShowAudioPlayer] = React.useState(false);
  const [selectedAudioContent, setSelectedAudioContent] = React.useState<ExtendedContent | undefined>(undefined);
  const [showFullDescription, setShowFullDescription] = React.useState(false);

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
        content: {
          flex: 1,
        },
        header: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 16,
        },
        headerTitle: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
          flex: 1,
          textAlign: 'center',
          marginHorizontal: 8,
        },
        backButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
          justifyContent: 'center',
          alignItems: 'center',
        },
        shareButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
          justifyContent: 'center',
          alignItems: 'center',
        },
        courseInfo: {
          padding: 16,
        },
        instructorInfo: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 24,
        },
        instructorAvatar: {
          width: 48,
          height: 48,
          borderRadius: 24,
          borderWidth: 1.5,
          borderColor: colors.border,
        },
        instructorTextContainer: {
          marginLeft: 12,
          justifyContent: 'center',
          flex: 1,
        },
        instructorName: {
          fontSize: 16,
          fontWeight: '600',
          color: colors.text,
          marginBottom: 2,
        },
        courseCategory: {
          fontSize: 14,
          color: colors.primary,
          fontWeight: '500',
        },
        descriptionContainer: {
          marginTop: 10,
          padding: 6,
        },
        descriptionText: {
          fontSize: 14,
          color: colors.textMuted,
          lineHeight: 20,
        },
        toggleButton: {
          marginTop: 8,
        },
        toggleButtonText: {
          color: colors.primary,
          fontSize: 14,
          fontWeight: '500',
        },
        modulesList: {
          padding: 16,
        },
        moduleItem: {
          backgroundColor: isDark ? 'rgba(32, 32, 36, 0.5)' : colors.cardBackground,
          borderRadius: 8,
          padding: 16,
          marginBottom: 8,
          borderWidth: isDark ? 0 : 1,
          borderColor: colors.border,
        },
        moduleHeader: {
          flexDirection: 'row',
          alignItems: 'center',
          marginBottom: 8,
        },
        moduleNumber: {
          fontSize: 16,
          fontWeight: 'bold',
          color: colors.text,
          marginRight: 8,
        },
        moduleTitle: {
          fontSize: 16,
          color: colors.text,
          flex: 1,
        },
        moduleTitleCompleted: {
          color: colors.primary,
        },
        moduleItemCompleted: {
          borderColor: colors.primary,
          borderWidth: 1,
        },
        quizGradeContainer: {
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 8,
          borderWidth: 1,
          borderColor: 'rgba(34, 197, 94, 0.2)',
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        quizGradeText: {
          color: '#22C55E',
          fontSize: 12,
          fontWeight: '700',
        },
        quizIcon: {
          backgroundColor: isDark ? '#2a2d3e' : colors.inputBackground,
          borderRadius: 50,
          padding: 5,
        },
        moduleFooter: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        moduleDuration: {
          flexDirection: 'row',
          alignItems: 'center',
          gap: 4,
        },
        moduleDurationText: {
          color: colors.textMuted,
          fontSize: 12,
        },
        videoContainer: {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: '#000',
          zIndex: 999,
        },
      }),
    [colors, isDark]
  );

  // Helper to get contentId from content (handles both Module and UserCourseModule structures)
  const getContentId = (content: ExtendedContent): number => {
    return content.contentId ?? content.id;
  };

  // Mark content as completed
  const markContentAsCompleted = React.useCallback(
    (content: ExtendedContent) => {
      if (!user?.token || !userCourseId || !moduleId) return;

      const contentId = getContentId(content);

      markContentAsCompletedMutation.mutate({
        userCourseId: userCourseId as string,
        moduleId: parseInt(moduleId as string, 10),
        contentId,
        token: user.token,
      });
    },
    [user?.token, userCourseId, moduleId, markContentAsCompletedMutation]
  );

  const handleContentPress = (content: ExtendedContent) => {
    if (content.format === 'Text' && content.description && !content.youtubeID) {
      router.push({
        pathname: '/room/text-viewer',
        params: {
          content: JSON.stringify(content),
          userCourseId: userCourseId as string,
          moduleId: moduleId as string,
          contentId: getContentId(content).toString(),
        },
      });
      return;
    } else if (content.format === 'HTML' || content.url?.endsWith('.html')) {
      router.push({
        pathname: '/room/html-viewer',
        params: {
          content: JSON.stringify(content),
          userCourseId: userCourseId as string,
          moduleId: moduleId as string,
          contentId: getContentId(content).toString(),
        },
      });
      return;
    } else if (content.format === 'PDF' && (content.url || content.file?.url)) {
      router.push({
        pathname: '/room/pdf-viewer',
        params: {
          content: JSON.stringify(content),
          userCourseId: userCourseId as string,
          moduleId: moduleId as string,
          contentId: getContentId(content).toString(),
        },
      });
      return;
    } else if (content.format === 'Picture') {
      router.push({
        pathname: '/room/picture-viewer',
        params: {
          content: JSON.stringify(content),
          userCourseId: userCourseId as string,
          moduleId: moduleId as string,
          contentId: getContentId(content).toString(),
        },
      });
      return;
    } else if (content.format === 'Audio') {
      setSelectedAudioContent(content);
      setShowAudioPlayer(true);
      markContentAsCompleted(content);
      return;
    } else {
      // Check if it's a video content (either youtubeID or file/url)
      // We explicitly exclude other known formats to prevent false positives
      const isVideo =
        content.format === 'Video' ||
        content.youtubeID ||
        (content.file?.url && !['PDF', 'Audio', 'Text', 'Picture'].includes(content.format)) ||
        content.url?.endsWith('.mp4');

      if (isVideo) {
        setSelectedContent(content);
        setPlaying(true);
        markContentAsCompleted(content);
      }
    }
  };

  const handleVideoEnd = () => {
    setPlaying(false);
    setSelectedContent(undefined);
  };

  const handleAudioEnd = () => {
    // Optional: Auto-close or just stop playing
    // setShowAudioPlayer(false);
    // setSelectedAudioContent(undefined);
  };

  const closeAudioPlayer = () => {
    setShowAudioPlayer(false);
    setSelectedAudioContent(undefined);
  };

  const handleQuizPress = (quiz: Quiz) => {
    router.push({
      pathname: '/room/quiz',
      params: {
        content: JSON.stringify(quiz),
        userCourseId: userCourseId as string,
        moduleId: moduleId as string,
      },
    });
  };

  const toggleDescription = () => {
    setShowFullDescription(!showFullDescription);
  };

  // Determine which video type to show
  // We prioritize file.url (direct upload). If that exists, we show direct player.
  // If not, we check if it is a youtube video (has youtubeID).
  // If no youtubeID, we fall back to checking .url for a direct link.
  // This prevents the 'url' field (which might contain the youtube link) from triggering showDirectVideo when we want showYoutubeVideo.
  if (!moduleData) { router.back(); return null; }

  const showDirectVideo =
    playing && selectedContent && (selectedContent.file?.url || (selectedContent.url && !selectedContent.youtubeID));
  const showYoutubeVideo = playing && selectedContent && selectedContent.youtubeID && !selectedContent.file?.url;

  return (
    <>
      {showDirectVideo && (
        <LocalVideoPlayerModal
          videoUrl={selectedContent?.file?.url || selectedContent?.url || ''}
          onVideoEnd={handleVideoEnd}
        />
      )}
      {showYoutubeVideo && <YoutubePlayerModal youtubeId={selectedContent?.youtubeID || ''} onClose={handleVideoEnd} />}
      {showAudioPlayer && selectedAudioContent && (
        <AudioPlayerModal
          audioUrl={getFullMediaUrl(selectedAudioContent.file?.url || selectedAudioContent.url)}
          title={selectedAudioContent.title}
          onClose={closeAudioPlayer}
          onAudioEnd={handleAudioEnd}
        />
      )}
      <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
        <ScrollView style={themedStyles.content}>
          {/* Header */}
          <View style={themedStyles.header}>
            <TouchableOpacity style={themedStyles.backButton} onPress={() => router.back()}>
              <Feather name="chevron-left" size={24} color={colors.text} />
            </TouchableOpacity>
            <Text style={themedStyles.headerTitle} numberOfLines={1}>
              {moduleData?.title}
            </Text>
            <TouchableOpacity style={themedStyles.shareButton}>
              <Feather name="share" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Course Info */}
          <View style={themedStyles.courseInfo}>
            <View style={themedStyles.instructorInfo}>
              <Image source={{ uri: imageUrl as string }} style={themedStyles.instructorAvatar} />
              <View style={themedStyles.instructorTextContainer}>
                <Text style={themedStyles.instructorName}>{author}</Text>
                <Text style={themedStyles.courseCategory}>{title}</Text>
              </View>
            </View>

            {/* Description Section */}
            {moduleData.description && (
              <View style={themedStyles.descriptionContainer}>
                <Text style={themedStyles.descriptionText} numberOfLines={showFullDescription ? undefined : 3}>
                  {moduleData.description}
                </Text>
                <TouchableOpacity onPress={toggleDescription} style={themedStyles.toggleButton}>
                  <Text style={themedStyles.toggleButtonText}>{showFullDescription ? 'Ver menos' : 'Ver mais'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Modules List */}
          <View style={themedStyles.modulesList}>
            {moduleData.contents?.map((content, index) => (
              <ModuleItem
                key={content.id}
                content={content}
                index={index}
                selectedContent={selectedContent}
                onPress={handleContentPress}
              />
            ))}

            {/* Quiz Item */}
            {moduleData.quiz && (
              <TouchableOpacity
                style={[
                  themedStyles.moduleItem,
                  moduleData.quiz.state === 'Passed' && themedStyles.moduleItemCompleted,
                ]}
                onPress={() => handleQuizPress(moduleData.quiz)}
              >
                <View style={themedStyles.moduleHeader}>
                  <Text style={themedStyles.moduleNumber}>Q.</Text>
                  <Text
                    style={[
                      themedStyles.moduleTitle,
                      moduleData.quiz.state === 'Passed' && themedStyles.moduleTitleCompleted,
                    ]}
                  >
                    Avaliação
                  </Text>
                  {moduleData.quiz.state === 'Passed' ? (
                    <Ionicons name="checkmark-circle" size={24} color="#22C55E" />
                  ) : (
                    <View style={themedStyles.quizIcon}>
                      <Ionicons name="help-circle" size={20} color={colors.primary} />
                    </View>
                  )}
                </View>
                <View style={themedStyles.moduleFooter}>
                  <View style={themedStyles.moduleDuration}>
                    <Feather name="check-circle" size={14} color={colors.textMuted} />
                    <Text style={themedStyles.moduleDurationText}>
                      {moduleData.quiz.questions?.length || 0} perguntas
                    </Text>
                  </View>
                  {moduleData.quiz.state === 'Passed' && moduleData.quiz.grade != null && (
                    <View style={themedStyles.quizGradeContainer}>
                      <Ionicons name="trophy-outline" size={12} color="#22C55E" />
                      <Text style={themedStyles.quizGradeText}>Nota: {moduleData.quiz.grade}%</Text>
                    </View>
                  )}
                </View>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}
