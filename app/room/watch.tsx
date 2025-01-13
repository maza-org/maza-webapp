import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

interface CourseModule {
  id: number;
  title: string;
  duration: string;
  progress?: number;
  locked?: boolean;
}

export default function CourseScreen() {
  const modules: CourseModule[] = [
    {
      id: 1,
      title: "Introduction to Industrial Design",
      duration: "06:34",
      progress: 70,
    },
    {
      id: 2,
      title: "Design Thinking and Problem Solving",
      duration: "06:34",
      locked: true,
    },
    {
      id: 3,
      title: "User Experience (UX) in Industrial Design",
      duration: "06:34",
      locked: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => {
              router.back();
            }}
          >
            <Feather name="chevron-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.shareButton}>
            <Feather name="share" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Video Preview */}
        <View style={styles.videoPreview}>
          <Image
            source={{ uri: "https://placeholder.com/800x400" }}
            style={styles.thumbnail}
          />
          <View style={styles.playButton}>
            <Feather name="play" size={24} color="#FFF" />
          </View>
          <View style={styles.videoDuration}>
            <Text style={styles.durationText}>2:20</Text>
            <TouchableOpacity style={styles.fullscreenButton}>
              <Feather name="maximize" size={14} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Course Info */}
        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>
            Introduction to Industrial Design
          </Text>
          <Text style={styles.courseDescription}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras congue
            arcu purus, vitae vehicula tortor iaculis vel.
          </Text>
          <View style={styles.instructorInfo}>
            <Image
              source={{ uri: "https://placeholder.com/40x40" }}
              style={styles.instructorAvatar}
            />
            <Text style={styles.instructorName}>Livia Donin</Text>
            <Text style={styles.courseCategory}>• Negócios</Text>
          </View>
        </View>

        {/* Modules List */}
        <View style={styles.modulesList}>
          {modules.map((module) => (
            <TouchableOpacity
              key={module.id}
              style={[
                styles.moduleItem,
                module.locked && styles.moduleItemLocked,
              ]}
              disabled={module.locked}
            >
              <View style={styles.moduleHeader}>
                <Text style={styles.moduleNumber}>{module.id}.</Text>
                <Text style={styles.moduleTitle}>{module.title}</Text>
              </View>
              <View style={styles.moduleFooter}>
                <View style={styles.moduleDuration}>
                  <Feather name="clock" size={14} color="#A8A8B3" />
                  <Text style={styles.moduleDurationText}>
                    {module.duration}
                  </Text>
                </View>
                {module.locked ? (
                  <Feather name="lock" size={20} color="#A8A8B3" />
                ) : module.progress ? (
                  <View>
                    <Text style={styles.progressText}>{module.progress}%</Text>
                  </View>
                ) : null}
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121214",
  },
  content: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 16,
  },
  backButton: {
    padding: 8,
  },
  shareButton: {
    padding: 8,
  },
  videoPreview: {
    height: 200,
    backgroundColor: "#202024",
    position: "relative",
  },
  thumbnail: {
    width: "100%",
    height: "100%",
  },
  playButton: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  videoDuration: {
    position: "absolute",
    bottom: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 4,
    borderRadius: 4,
  },
  durationText: {
    color: "#FFF",
    fontSize: 12,
    marginRight: 8,
  },
  fullscreenButton: {
    padding: 2,
  },
  courseInfo: {
    padding: 16,
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#FFF",
    marginBottom: 8,
  },
  courseDescription: {
    fontSize: 14,
    color: "#A8A8B3",
    lineHeight: 20,
    marginBottom: 16,
  },
  instructorInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  instructorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  instructorName: {
    fontSize: 14,
    color: "#A8A8B3",
  },
  courseCategory: {
    fontSize: 14,
    color: "#A8A8B3",
    marginLeft: 4,
  },
  modulesList: {
    padding: 16,
  },
  moduleItem: {
    backgroundColor: "rgba(32, 32, 36, 0.5)",
    borderRadius: 8,
    padding: 16,
    marginBottom: 8,
  },
  moduleItemLocked: {
    opacity: 0.7,
  },
  moduleHeader: {
    flexDirection: "row",
    marginBottom: 8,
  },
  moduleNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFF",
    marginRight: 4,
  },
  moduleTitle: {
    fontSize: 16,
    color: "#FFF",
    flex: 1,
  },
  moduleFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  moduleDuration: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  moduleDurationText: {
    color: "#A8A8B3",
    fontSize: 12,
  },
  progressCircle: {
    backgroundColor: "#00B37E",
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  progressText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
});
