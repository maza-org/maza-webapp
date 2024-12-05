import { Image, Text, TouchableOpacity, View, StyleSheet } from "react-native";
import React from "react";

export default function CourseItem() {
  return (
    <TouchableOpacity style={styles.courseItem}>
      <Image
        source={{ uri: "https://via.placeholder.com/60" }}
        style={styles.courseImage}
      />
      <View style={styles.courseInfo}>
        <Text style={styles.courseCategory}>Design</Text>
        <Text style={styles.courseItemTitle}>Principles of Industri...</Text>
        <Text style={styles.moduleCount}>7/10 Modulos</Text>
      </View>
      <Text style={styles.percentageText}>70%</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  coursesInProgress: {
    marginVertical: 24,
  },
  moduleCount: {
    color: "#FFF",
    opacity: 0.7,
    fontSize: 12,
  },
  percentageText: {
    color: "#00B37E",
    fontSize: 16,
    fontWeight: "600",
  },
  coursesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  coursesList: {
    gap: 12,
  },
  courseItem: {
    flexDirection: "row",
    backgroundColor: "#29292E",
    borderRadius: 12,
    padding: 6,
    alignItems: "center",
    margin: 10,
  },
  courseImage: {
    width: 60,
    height: 60,
    borderRadius: 8,
    marginRight: 12,
  },
  courseInfo: {
    flex: 1,
    gap: 4,
  },
  courseItemTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  courseCategory: {
    color: "#00B37E",
    fontSize: 14,
    fontWeight: "500",
  },
});
