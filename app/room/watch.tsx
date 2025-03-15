import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Module, Quiz } from '@/app/room/lessons';
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

const YoutubePlayerModal = ({ videoId, onVideoEnd }: { videoId: string; onVideoEnd: () => void }) => {
  const onStateChange = (state: string) => {
    if (state === 'ended') {
      onVideoEnd();
    }
  };

  return (
    <View style={styles.videoContainer}>
      <YoutubePlayer
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
  const { module, author, title, imageUrl } = useLocalSearchParams();
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
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
              <Feather name="chevron-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.shareButton}>
              <Feather name="share" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Course Info */}
          <View style={styles.courseInfo}>
            <Text style={styles.courseTitle}>{moduleData.title}</Text>
            <View style={styles.instructorInfo}>
              <Image source={{ uri: imageUrl }} style={styles.instructorAvatar} />
              <Text style={styles.instructorName}>{author}</Text>
              <Text style={styles.courseCategory}>• {title}</Text>
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
    padding: 16,
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
  courseTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  instructorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  instructorName: {
    fontSize: 14,
    color: '#A8A8B3',
  },
  courseCategory: {
    fontSize: 14,
    color: '#1fa2df',
    marginLeft: 10,
    width: 250,
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
