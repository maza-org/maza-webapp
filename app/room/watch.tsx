import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, ScrollView, Dimensions } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import YoutubePlayer from 'react-native-youtube-iframe';
import { Module } from '@/app/room/lessons';

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

interface ModuleData {
  id: number;
  title: string;
  quiz: null;
  contents: Content[];
}

const YoutubePlayerModal = ({ videoId }: { videoId: string }) => (
  <View>
    <YoutubePlayer
      play={true}
      initialPlayerParams={{
        loop: false,
        controls: true,
      }}
      width={width}
      height={height}
      videoId={videoId}
      webViewProps={{
        injectedJavaScript: `
          var element = document.getElementsByClassName('container')[0];
          element.style.position = 'unset';
          element.style.paddingBottom = 'unset';
          true;
        `,
      }}
    />
  </View>
);

export default function CourseScreen() {
  const params = useLocalSearchParams();
  const moduleData = JSON.parse(params.module as string) as Module;
  const [playing, setPlaying] = React.useState(false);
  const [selectedContent, setSelectedContent] = React.useState<Content | null>(null);

  const handleContentPress = (content: Content) => {
    console.log(content);
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

  return (
    <>
      {playing && selectedContent && <YoutubePlayerModal videoId={selectedContent.youtubeID} />}
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
              <Image source={{ uri: 'https://placeholder.com/40x40' }} style={styles.instructorAvatar} />
              <Text style={styles.instructorName}>Instructor</Text>
              <Text style={styles.courseCategory}>• Course</Text>
            </View>
          </View>

          {/* Modules List */}
          <View style={styles.modulesList}>
            {moduleData.contents?.map((content, index) => (
              <TouchableOpacity
                key={content.id}
                style={[styles.moduleItem, selectedContent?.id === content.id && styles.moduleItemSelected]}
                onPress={() => handleContentPress(content)}
              >
                <View style={styles.moduleHeader}>
                  <Text style={styles.moduleNumber}>{index + 1}.</Text>
                  <Text style={styles.moduleTitle}>{content.title}</Text>
                </View>
                <View style={styles.moduleFooter}>
                  <View style={styles.moduleDuration}>
                    <Feather name={content.format === 'Text' ? 'file-text' : 'video'} size={14} color="#A8A8B3" />
                    <Text style={styles.moduleDurationText}>
                      {content.format === 'Text' ? 'Texto' : content.format}
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
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
  courseDescription: {
    fontSize: 14,
    color: '#A8A8B3',
    lineHeight: 20,
    marginBottom: 16,
  },
  instructorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
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
    color: '#A8A8B3',
    marginLeft: 4,
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
  moduleItemSelected: {
    backgroundColor: 'rgba(32, 32, 36, 0.8)',
    borderColor: '#00B37E',
    borderWidth: 1,
  },
  moduleHeader: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  moduleNumber: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    marginRight: 4,
  },
  moduleTitle: {
    fontSize: 16,
    color: '#FFF',
    flex: 1,
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
});
