import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  ActivityIndicator,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import Ionicons from "@expo/vector-icons/Ionicons";
import { router, useLocalSearchParams } from "expo-router";
import Reviews from "@/components/Reviews";

interface Content {
  id: number;
  title: string;
  format: string;
  url: string;
  description: string | null;
}

interface Module {
  id: number;
  title: string;
  quiz: any;
  contents: Content[];
}

interface Question {
  id: number;
  description: string;
  format: string;
  options: {
    id: number;
    description: string;
    comment: string | null;
    is_correct: boolean;
  }[];
}

interface FinalTest {
  id: number;
  pass_grade: number;
  questions: Question[];
}

interface Subject {
  id: number;
  documentId: string;
  name: string;
}

interface CourseData {
  id: number;
  documentId: string;
  title: string;
  author: string;
  rating_avg: number;
  createdAt: string;
  updatedAt: string;
  publishedAt: string;
  subjects: Subject[];
  final_test: FinalTest;
  modules: Module[];
}

interface TabProps {
  active: boolean;
  onPress: () => void;
  children: string;
}

function Tab({ active, onPress, children }: TabProps): JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[styles.tab, active && styles.activeTab]}
    >
      <Text style={[styles.tabText, active && styles.activeTabText]}>
        {children}
      </Text>
    </TouchableOpacity>
  );
}

export default function CourseDetail(): JSX.Element {
  const [activeTab, setActiveTab] = useState<"lessons" | "opinions">("lessons");
  const [courseData, setCourseData] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);

  // Get the documentId from route parameters
  const { documentId } = useLocalSearchParams();

  useEffect(() => {
    fetchCourseData();
  }, [documentId]); // Add documentId as dependency

  const fetchCourseData = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:1337/api/courses/${documentId}`,
      );
      const data = await response.json();
      setCourseData(data);
    } catch (error) {
      console.error("Error fetching course data:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1fa2df" />
      </View>
    );
  }

  if (!courseData) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Failed to load course data</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} stickyHeaderIndices={[1]}>
        <ImageBackground
          source={{ uri: "https://via.placeholder.com/400x200" }}
          style={styles.header}
        >
          <View style={styles.headerOverlay}>
            <View style={styles.headerActions}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.back()}
              >
                <Feather name="chevron-left" size={24} color="#FFF" />
              </TouchableOpacity>
              <View style={styles.rightActions}>
                <TouchableOpacity style={styles.iconButton}>
                  <Feather name="share" size={24} color="#FFF" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.iconButton}>
                  <Feather name="heart" size={24} color="#FFF" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>{courseData.title}</Text>
          <View style={styles.instructor}>
            <Text style={styles.instructorName}>{courseData.author}</Text>
            <Text style={styles.categoryTag}>
              • {courseData.subjects[0]?.name || ""}
            </Text>
          </View>

          <View style={styles.tabContainer}>
            <Tab
              active={activeTab === "lessons"}
              onPress={() => setActiveTab("lessons")}
            >
              Aulas
            </Tab>
            <Tab
              active={activeTab === "opinions"}
              onPress={() => setActiveTab("opinions")}
            >
              Opiniões
            </Tab>
          </View>
        </View>

        {activeTab === "lessons" ? (
          <View style={styles.modulesList}>
            {courseData.modules.map((module, index) => (
              <TouchableOpacity key={module.id} style={styles.moduleItem}>
                <View style={styles.moduleContent}>
                  <View style={styles.moduleTopRow}>
                    <View style={styles.moduleInfo}>
                      <Text style={styles.moduleNumber}>{index + 1}.</Text>
                      <Text style={styles.moduleTitle}>{module.title}</Text>
                    </View>
                    <View style={styles.moduleDetails}>
                      <View style={styles.iconContainer}>
                        <Ionicons name="play" size={20} color="#4db5ff" />
                      </View>
                    </View>
                  </View>
                  <View style={styles.videoCount}>
                    <Feather name="film" size={14} color="#A8A8B3" />
                    <Text style={styles.videoCountText}>
                      {module.contents.length} videos
                    </Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.opinionsContainer}>
            <View style={styles.ratingOverview}>
              <Reviews courseId={documentId as string} />
            </View>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.startButton}>
          <Text style={styles.startButtonText}>Iniciar Curso</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121214",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#121214",
  },
  errorText: {
    color: "#FFF",
    fontSize: 16,
  },
  container: {
    flex: 1,
    backgroundColor: "#121214",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    height: 200,
  },
  headerOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    padding: 24,
    justifyContent: "space-between",
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  rightActions: {
    flexDirection: "row",
    gap: 16,
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  courseInfo: {
    padding: 24,
    backgroundColor: "#121214",
  },
  courseTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 16,
  },
  instructor: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  instructorName: {
    color: "#FFF",
    fontSize: 14,
  },
  categoryTag: {
    color: "#1fa2df",
    fontSize: 14,
    marginLeft: 8,
  },
  tabContainer: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#323238",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
  },
  activeTab: {
    borderBottomWidth: 2,
    borderBottomColor: "#1fa2df",
  },
  tabText: {
    color: "#A8A8B3",
    fontSize: 16,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#1fa2df",
  },
  modulesList: {
    padding: 24,
  },
  moduleItem: {
    padding: 16,
    backgroundColor: "#202024",
    borderRadius: 15,
    marginBottom: 12,
  },
  moduleContent: {
    gap: 12,
  },
  moduleTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  moduleInfo: {
    flex: 1,
    flexDirection: "row",
    gap: 12,
  },
  moduleNumber: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  moduleTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
    flex: 1,
  },
  moduleDetails: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "#2a2d3e",
    borderRadius: 50,
    padding: 5,
  },
  videoCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginStart: 25,
  },
  videoCountText: {
    color: "#A8A8B3",
    fontSize: 12,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#323238",
  },
  startButton: {
    backgroundColor: "#1fa2df",
    padding: 16,
    borderRadius: 50,
    alignItems: "center",
  },
  startButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    fontFamily: "ManropeBold",
  },
  opinionsContainer: {},
  ratingOverview: {
    marginBottom: 24,
  },
  overallRating: {
    alignItems: "center",
    marginBottom: 24,
  },
  ratingNumber: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
  },
  starsContainer: {
    flexDirection: "row",
    marginBottom: 8,
  },
  starIcon: {
    marginHorizontal: 2,
  },
});
