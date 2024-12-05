import React from "react";
import { StyleSheet, View, Pressable, ScrollView, Image } from "react-native";
import { Text } from "@/components/Themed";
import { Ionicons } from "@expo/vector-icons";

const favoriteCourses = [
  {
    id: 1,
    title: "Entrepreneurship and New Venture Formation",
    category: "Negócios",
    instructor: {
      name: "Livia Donin",
    },
    level: "Intermédio",
    rating: 4.5,
  },
  {
    id: 2,
    title: "Introduction to Digital Marketing",
    category: "Marketing Digital",
    instructor: {
      name: "Sarah Adams",
    },
    level: "Iniciante",
    rating: 4.7,
  },
  {
    id: 3,
    title: "Full Stack React Development",
    category: "Desenvolvimento",
    instructor: {
      name: "Michael Chen",
    },
    level: "Avançado",
    rating: 4.9,
  },
  {
    id: 4,
    title: "Financial Planning Fundamentals",
    category: "Finanças",
    instructor: {
      name: "Carlos Silva",
    },
    level: "Iniciante",
    rating: 4.6,
  },
  {
    id: 5,
    title: "Advanced Data Analytics",
    category: "Data Science",
    instructor: {
      name: "Emma Watson",
    },
    level: "Avançado",
    rating: 4.8,
  },
];

const FavoriteCoursesGrid = () => {
  return (
    <ScrollView style={styles.container}>
      <View style={styles.gridContainer}>
        {favoriteCourses.map((course) => (
          <Pressable key={course.id} style={styles.courseCard}>
            {/* Course Image */}
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: "https://picsum.photos/400/320" }}
                style={styles.courseImage}
              />
              <Pressable style={styles.heartButton}>
                <Ionicons name="heart" size={20} color="#FF4B4B" />
              </Pressable>
            </View>

            {/* Course Content */}
            <View style={styles.contentContainer}>
              {/* Category */}
              <Text style={styles.category}>{course.category}</Text>

              {/* Title */}
              <Text style={styles.title} numberOfLines={2}>
                {course.title}
              </Text>

              {/* Instructor */}
              <View style={styles.instructorContainer}>
                <Image
                  source={{ uri: "https://i.pravatar.cc/300" }}
                  style={styles.instructorAvatar}
                />
                <Text style={styles.instructorName}>
                  {course.instructor.name}
                </Text>
              </View>

              {/* Footer */}
              <View style={styles.footer}>
                <Text style={styles.level}>{course.level}</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.rating}>{course.rating}</Text>
                </View>
              </View>
            </View>
          </Pressable>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121214",
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    padding: 16,
    gap: 16,
  },
  courseCard: {
    width: "47%", // Slightly less than 50% to account for gap
    backgroundColor: "#202024",
    borderRadius: 8,
    overflow: "hidden",
  },
  imageContainer: {
    height: 160,
    position: "relative",
  },
  courseImage: {
    width: "100%",
    height: "100%",
  },
  heartButton: {
    position: "absolute",
    top: 8,
    right: 8,
    width: 32,
    height: 32,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  contentContainer: {
    padding: 12,
  },
  category: {
    fontSize: 12,
    color: "#2EA8FF",
    marginBottom: 8,
  },
  title: {
    fontSize: 14,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 12,
    lineHeight: 20,
  },
  instructorContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  instructorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  instructorName: {
    fontSize: 12,
    color: "#8F8F8F",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  level: {
    fontSize: 12,
    color: "#8F8F8F",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  rating: {
    fontSize: 12,
    color: "#FFD700",
  },
});

export default FavoriteCoursesGrid;
