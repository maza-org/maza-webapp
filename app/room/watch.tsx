import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import YoutubeIframe from 'react-native-youtube-iframe';
import { Module, Quiz } from '@/types/learning';
import ModuleItem from '@/components/ModuleItem';

const width = Dimensions.get('screen').width;
const height = Dimensions.get('screen').height;

interface Content {
  id: number;
  title: string;
  format: string;
  youtubeID: string;
  url: string;
  description: string | null;
}

const NativeYoutubeIframe = ({ videoId, onVideoEnd }: { videoId: string; onVideoEnd: () => void }) => {
  React.useEffect(() => {
    if (Platform.OS !== 'web') return;

    const handleMessage = (event: MessageEvent) => {
      if (event.data === 'video-ended') {
        onVideoEnd();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [onVideoEnd]);

  const iframeHtml = `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <style>
          body { margin: 0; padding: 0; background: #000; }
          #player { width: 100vw; height: 100vh; }
        </style>
      </head>
      <body>
        <div id="player"></div>
        <script>
          const tag = document.createElement('script');
          tag.src = "https://www.youtube.com/iframe_api";
          const firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);

          let player;
          window.onYouTubeIframeAPIReady = function() {
            player = new window.YT.Player('player', {
              height: '100%',
              width: '100%',
              videoId: '${videoId}',
              playerVars: {
                'autoplay': 1,
                'controls': 1,
                'modestbranding': 1,
                'rel': 0,
                'loop': 0
              },
              events: {
                'onStateChange': onPlayerStateChange
              }
            });
          }

          function onPlayerStateChange(event) {
            if (event.data === window.YT.PlayerState.ENDED) {
              window.parent.postMessage('video-ended', '*');
            }
          }
        </script>
      </body>
    </html>
  `;

  return (
    <View style={styles.videoContainer}>
      {Platform.OS === 'web' && (
        <iframe
          src={`data:text/html;charset=utf-8,${encodeURIComponent(iframeHtml)}`}
          style={
            {
              width: '100%',
              height: '100%',
              border: 'none',
            } as React.CSSProperties
          }
          allowFullScreen
        />
      )}
    </View>
  );
};

const YoutubePlayerModal = ({ videoId, onVideoEnd }: { videoId: string; onVideoEnd: () => void }) => {
  const onStateChange = (state: string) => {
    if (state === 'ended') {
      onVideoEnd();
    }
  };

  if (Platform.OS === 'web') {
    return <NativeYoutubeIframe videoId={videoId} onVideoEnd={onVideoEnd} />;
  }

  return (
    <View style={styles.videoContainer}>
      <YoutubeIframe
        play={true}
        initialPlayerParams={{
          loop: false,
          controls: true,
          modestbranding: true,
          rel: false,
        }}
        width={width}
        height={height}
        videoId={videoId}
        onChangeState={onStateChange}
        webViewProps={{
          injectedJavaScript: `
            var element = document.getElementsByClassName('container')[0];
            element.style.position = 'unset';
            element.style.paddingBottom = 'unset';
            // Force fullscreen when video starts playing
            var player = document.querySelector('iframe');
            player.requestFullscreen();
            true;
          `,
        }}
      />
    </View>
  );
};

export default function CourseScreen() {
  const { module, author, title, imageUrl, userCourseId, moduleId } = useLocalSearchParams();
  const moduleData = JSON.parse(module as string) as Module;
  const [playing, setPlaying] = React.useState(false);
  const [selectedContent, setSelectedContent] = React.useState<Content | undefined>(undefined);
  const [showFullDescription, setShowFullDescription] = React.useState(false);

  const handleContentPress = (content: Content) => {
    if (content.format === 'Text' && content.description && !content.youtubeID) {
      router.push({
        pathname: '/room/text-viewer',
        params: {
          content: JSON.stringify(content),
        },
      });
      return;
    } else {
      setSelectedContent(content);
      setPlaying(true);
    }
  };

  const handleVideoEnd = () => {
    setPlaying(false);
    setSelectedContent(undefined);
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

  return (
    <>
      {playing && selectedContent && (
        <YoutubePlayerModal videoId={selectedContent.youtubeID} onVideoEnd={handleVideoEnd} />
      )}
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <ScrollView style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Feather name="chevron-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {moduleData?.title}
            </Text>
            <TouchableOpacity style={styles.shareButton}>
              <Feather name="share" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Course Info */}
          <View style={styles.courseInfo}>

            <View style={styles.instructorInfo}>
              <Image source={{ uri: imageUrl as string }} style={styles.instructorAvatar} />
              <View style={styles.instructorTextContainer}>
                <Text style={styles.instructorName}>{author}</Text>
                <Text style={styles.courseCategory}>{title}</Text>
              </View>
            </View>

            {/* Description Section */}
            {moduleData.description && (
              <View style={styles.descriptionContainer}>
                <Text style={styles.descriptionText} numberOfLines={showFullDescription ? undefined : 3}>
                  {moduleData.description}
                </Text>
                <TouchableOpacity onPress={toggleDescription} style={styles.toggleButton}>
                  <Text style={styles.toggleButtonText}>{showFullDescription ? 'Ver menos' : 'Ver mais'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Modules List */}
          <View style={styles.modulesList}>
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
              <TouchableOpacity style={styles.moduleItem} onPress={() => handleQuizPress(moduleData.quiz)}>
                <View style={styles.moduleHeader}>
                  <Text style={styles.moduleNumber}>Q.</Text>
                  <Text style={styles.moduleTitle}>Avaliação</Text>
                  <View style={styles.quizIcon}>
                    <Ionicons name="help-circle" size={20} color="#4db5ff" />
                  </View>
                </View>
                <View style={styles.moduleFooter}>
                  <View style={styles.moduleDuration}>
                    <Feather name="check-circle" size={14} color="#A8A8B3" />
                    <Text style={styles.moduleDurationText}>{moduleData.quiz.questions?.length || 0} perguntas</Text>
                  </View>
                </View>
              </TouchableOpacity>
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
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
    color: '#FFF',
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 8,
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
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
    borderColor: 'rgba(255,255,255,0.1)',
  },
  instructorTextContainer: {
    marginLeft: 12,
    justifyContent: 'center',
    flex: 1,
  },
  instructorName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#E1E1E6',
    marginBottom: 2,
  },
  courseCategory: {
    fontSize: 14,
    color: '#4db5ff',
    fontWeight: '500',
  },
  descriptionContainer: {
    marginTop: 10,
    padding: 6,
  },
  descriptionText: {
    fontSize: 14,
    color: '#A8A8B3',
    lineHeight: 20,
  },
  toggleButton: {
    marginTop: 8,
  },
  toggleButtonText: {
    color: '#4db5ff',
    fontSize: 14,
    fontWeight: '500',
  },
  modulesList: {
    padding: 16,
  },
  moduleItem: {
    backgroundColor: 'rgba(32, 32, 36, 0.5)',
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  moduleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  moduleNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginRight: 8,
  },
  moduleTitle: {
    fontSize: 16,
    color: '#FFF',
    flex: 1,
  },
  quizIcon: {
    backgroundColor: '#2a2d3e',
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
    color: '#A8A8B3',
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
});
