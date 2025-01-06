import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Shimmer from "@/components/Shimmer";
import Header from "@/components/Header";

export default function Category() {
  const { name } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.container}>
      <Header title={name as string} />

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121214",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 24,
  },
  backButton: {
    padding: 8,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#333",
  },
  backButtonText: {
    color: "#FFF",
    fontSize: 18,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFF",
    marginLeft: 16,
  },
  loadingText: {
    color: "#666",
    fontSize: 16,
    marginTop: 25,
    marginLeft: 24,
    marginBottom: 24,
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
  shimmer: {
    backgroundColor: "#29292E",
    borderRadius: 4,
    overflow: "hidden",
    position: "relative",
  },
});
