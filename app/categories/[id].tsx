import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Shimmer from "@/components/Shimmer";
import Header from "@/components/Header";

interface Course {
  title: string;
  id: number;
  documentId: string;
  author: string | null;
  rating_avg: number;
  subjects: {
    id: number;
    documentId: string;
    name: string;
  }[];
}

interface ApiResponse {
  data: Course[];
  meta: {
    pagination: {
      page: number;
      pageSize: number;
      pageCount: number;
      total: number;
    };
  };
}

export default function Category() {
  const { name, id } = useLocalSearchParams();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCourses();
  }, [id]);

  const fetchCourses = async () => {
    try {
      const response = await fetch(
        `http://127.0.0.1:1337/api/courses?subjects=${id}`,
      );
      const data: ApiResponse = await response.json();
      setCourses(data.data);
      setIsLoading(false);
    } catch (error) {
      console.error("Error fetching courses:", error);
      setIsLoading(false);
    }
  };

  const handlePressCourse = (course: Course) => {
    console.log(course);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title={name as string} />

      {isLoading ? (
        <>
          <Text style={styles.loadingText}>Carregando cursos...</Text>
          {[...Array(7)].map((_, i) => (
            <View key={i} style={styles.courseCard}>
              <Shimmer>
                <View style={styles.thumbnail} />
              </Shimmer>
              <View style={styles.courseInfo}>
                <Shimmer>
                  <View style={styles.titleShimmer} />
                </Shimmer>
                <Shimmer>
                  <View style={styles.descriptionShimmer} />
                </Shimmer>
              </View>
            </View>
          ))}
        </>
      ) : (
        <>
          {courses.length === 0 ? (
            <Text style={styles.noCourses}>Nenhum curso encontrado</Text>
          ) : (
            courses.map((course) => (
              <TouchableOpacity
                key={course.id}
                style={styles.courseCard}
                onPress={() => handlePressCourse(course)}
              >
                <View style={styles.thumbnail}>
                  {/* You can add a placeholder image or icon here */}
                </View>
                <View style={styles.courseInfo}>
                  <Text style={styles.courseTitle}>{course.title}</Text>
                  <View style={styles.courseMetadata}>
                    <Text style={styles.rating}>
                      ★ {course.rating_avg.toFixed(1)}
                    </Text>
                    {course.author && (
                      <Text style={styles.author}>{course.author}</Text>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            ))
          )}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121214",
  },
  loadingText: {
    color: "#666",
    fontSize: 16,
    marginTop: 25,
    marginLeft: 24,
    marginBottom: 24,
  },
  noCourses: {
    color: "#666",
    fontSize: 16,
    marginTop: 25,
    marginLeft: 24,
  },
  courseCard: {
    flexDirection: "row",
    padding: 16,
    marginHorizontal: 24,
    backgroundColor: "#202024",
    borderRadius: 12,
    marginBottom: 16,
  },
  thumbnail: {
    width: 80,
    height: 80,
    backgroundColor: "#29292E",
    borderRadius: 8,
  },
  courseInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: "center",
  },
  courseTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
  },
  courseMetadata: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    color: "#FFD700",
    fontSize: 14,
    marginRight: 8,
  },
  author: {
    color: "#666",
    fontSize: 14,
  },
  titleShimmer: {
    height: 20,
    backgroundColor: "#29292E",
    borderRadius: 4,
    marginBottom: 8,
    width: "80%",
  },
  descriptionShimmer: {
    height: 16,
    backgroundColor: "#29292E",
    borderRadius: 4,
    width: "60%",
  },
});
