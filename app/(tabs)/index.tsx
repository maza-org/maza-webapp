import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";

export default function Home() {
  const handleSearchPress = () => {
    router.push("/search");
  };
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header with Bell Icon */}
        <View style={styles.header}>
          <Text style={styles.headerText}>O que pretende aprender hoje?</Text>
          <TouchableOpacity>
            <Feather name="bell" size={24} color="#FFF" />
          </TouchableOpacity>
        </View>

        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={handleSearchPress}
          activeOpacity={0.7}
        >
          <TextInput
            style={styles.searchInput}
            placeholder="Pesquisar..."
            placeholderTextColor="#666"
            selectionColor="#fff"
          />
          <Feather
            name="search"
            size={20}
            color="#666"
            style={styles.searchIcon}
          />
        </TouchableOpacity>

        {/* Category Icons */}
        <View style={styles.categoryContainer}>
          <TouchableOpacity style={styles.categoryItem}>
            <View style={styles.iconContainer}>
              <Feather name="pen-tool" size={20} color="#FFF" />
            </View>
            <Text style={styles.categoryText}>Design</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryItem}>
            <View style={styles.iconContainer}>
              <Feather name="monitor" size={20} color="#FFF" />
            </View>
            <Text style={styles.categoryText}>Tecnologia</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryItem}>
            <View style={styles.iconContainer}>
              <Feather name="heart" size={20} color="#FFF" />
            </View>
            <Text style={styles.categoryText}>Saúde</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryItem}>
            <View style={styles.iconContainer}>
              <Feather name="grid" size={20} color="#FFF" />
            </View>
            <Text style={styles.categoryText}>Ver Mais</Text>
          </TouchableOpacity>
        </View>

        {/* Continue Course Section */}
        <View style={styles.courseSection}>
          <Text style={styles.sectionTitle}>Continuar curso</Text>

          <View style={styles.courseCard}>
            <View style={styles.courseHeader}>
              <Image
                source={{ uri: "https://via.placeholder.com/40" }}
                style={styles.profileImage}
              />
              <View style={styles.courseHeaderInfo}>
                <Text style={styles.instructorName}>Lívia Donin</Text>
                <View style={styles.ratingContainer}>
                  <Text style={styles.starIcon}>★</Text>
                  <Text style={styles.ratingText}>4,5</Text>
                </View>
              </View>
            </View>

            <Text style={styles.courseTitle}>
              Entrepreneurship and New Venture Creation
            </Text>

            <View style={styles.progressContainer}>
              <View style={styles.progressInfo}>
                <Text style={styles.progressText}>1/5 Module</Text>
                <Text style={styles.progressText}>10%</Text>
              </View>
              <View style={styles.progressBar}>
                <View style={[styles.progressFill, { width: "10%" }]} />
              </View>
            </View>
          </View>
        </View>

        {/* Points Display */}
        <View style={styles.pointsCard}>
          <View>
            <Text style={styles.pointsLabel}>Pontos acumulados</Text>
            <Text style={styles.pointsValue}>3.245</Text>
          </View>
          <TouchableOpacity style={styles.pointsButton}>
            <Text style={styles.pointsButtonText}>User Pontos</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.coursesInProgress}>
          <View style={styles.coursesHeader}>
            <Text style={styles.sectionTitle}>Cursos em andamento</Text>
            <TouchableOpacity>
              <Text style={styles.verTodos}>VER TODOS</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.coursesList}>
            <TouchableOpacity style={styles.courseItem}>
              <Image
                source={{ uri: "https://via.placeholder.com/60" }}
                style={styles.courseImage}
              />
              <View style={styles.courseInfo}>
                <Text style={styles.courseCategory}>Design</Text>
                <Text style={styles.courseItemTitle}>
                  Principles of Industri...
                </Text>
                <Text style={styles.moduleCount}>7/10 Modulos</Text>
              </View>
              <Text style={styles.percentageText}>70%</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.courseItem}>
              <Image
                source={{ uri: "https://via.placeholder.com/60" }}
                style={styles.courseImage}
              />
              <View style={styles.courseInfo}>
                <Text style={styles.courseCategory}>Programação</Text>
                <Text style={styles.courseItemTitle}>
                  HTML & CSS: Building...
                </Text>
                <Text style={styles.moduleCount}>4/14 Modulos</Text>
              </View>
              <Text style={styles.percentageText}>70%</Text>
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.popularCoursesSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Cursos mais populares</Text>
            <TouchableOpacity>
              <Text style={styles.verTodos}>VER TODOS</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.popularCoursesList}
          >
            <TouchableOpacity style={styles.popularCourseCard}>
              <Image
                source={{ uri: "https://via.placeholder.com/160x120" }}
                style={styles.popularCourseImage}
              />
              <View style={styles.courseLevelBadge}>
                <Text style={styles.courseLevelText}>Intermediário</Text>
              </View>
              <View style={styles.courseRatingBadge}>
                <Text style={styles.starIcon}>★</Text>
                <Text style={styles.ratingText}>4.5</Text>
              </View>
              <View style={styles.popularCourseInfo}>
                <Text style={styles.courseCategory}>Negócios</Text>
                <Text style={styles.popularCourseTitle}>
                  Entrepreneurship and New Venture Creation
                </Text>
                <View style={styles.instructorInfo}>
                  <Image
                    source={{ uri: "https://via.placeholder.com/24" }}
                    style={styles.instructorAvatar}
                  />
                  <Text style={styles.instructorName}>Lívia...</Text>
                  <View style={styles.courseStats}>
                    <Feather name="book" size={12} color="#FFF" />
                    <Text style={styles.statsText}>12 módulos</Text>
                    <Feather name="users" size={12} color="#FFF" />
                    <Text style={styles.statsText}>3.8K inscritos</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={styles.popularCourseCard}>
              <Image
                source={{ uri: "https://via.placeholder.com/160x120" }}
                style={styles.popularCourseImage}
              />
              <View style={styles.courseLevelBadge}>
                <Text style={styles.courseLevelText}>Iniciante</Text>
              </View>
              <View style={styles.courseRatingBadge}>
                <Text style={styles.starIcon}>★</Text>
                <Text style={styles.ratingText}>4.8</Text>
              </View>
              <View style={styles.popularCourseInfo}>
                <Text style={styles.courseCategory}>Marketing</Text>
                <Text style={styles.popularCourseTitle}>
                  Introduction to Digital Marketing
                </Text>
                <View style={styles.instructorInfo}>
                  <Image
                    source={{ uri: "https://via.placeholder.com/24" }}
                    style={styles.instructorAvatar}
                  />
                  <Text style={styles.instructorName}>Sara...</Text>
                  <View style={styles.courseStats}>
                    <Feather name="book" size={12} color="#FFF" />
                    <Text style={styles.statsText}>8 módulos</Text>
                    <Feather name="users" size={12} color="#FFF" />
                    <Text style={styles.statsText}>2.5K inscritos</Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
        {/* Mentores Section */}
        <View style={styles.mentoresSection}>
          <View style={styles.mentoresHeader}>
            <Text style={styles.sectionTitle}>Mentores</Text>
            <TouchableOpacity>
              <Text style={styles.verTodos}>VER TODOS</Text>
            </TouchableOpacity>
          </View>

          {/* Mentor Cards */}
          <View style={styles.mentorCard}>
            <View style={styles.mentorInfo}>
              <Image
                source={{ uri: "https://via.placeholder.com/48" }}
                style={styles.mentorImage}
              />
              <View style={styles.mentorDetails}>
                <Text style={styles.mentorName}>Alex Johnson</Text>
                <Text style={styles.mentorArea}>Liderança</Text>
                <View style={styles.mentorStats}>
                  <View style={styles.statContainer}>
                    <Text style={styles.starIcon}>★</Text>
                    <Text style={styles.statText}>4,8</Text>
                    <Text style={styles.statSubtext}>(1.8K reviews)</Text>
                  </View>
                  <View style={styles.statContainer}>
                    <Feather name="users" size={14} color="#FFF" />
                    <Text style={styles.statText}>3.8K seg.</Text>
                  </View>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.seguirButton}>
              <Text style={styles.seguirButtonText}>Seguir</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mentorCard}>
            <View style={styles.mentorInfo}>
              <Image
                source={{ uri: "https://via.placeholder.com/48" }}
                style={styles.mentorImage}
              />
              <View style={styles.mentorDetails}>
                <Text style={styles.mentorName}>Emily Johnson</Text>
                <Text style={styles.mentorArea}>Marketing Digital</Text>
                <View style={styles.mentorStats}>
                  <View style={styles.statContainer}>
                    <Text style={styles.starIcon}>★</Text>
                    <Text style={styles.statText}>4,6</Text>
                    <Text style={styles.statSubtext}>(2.7K reviews)</Text>
                  </View>
                  <View style={styles.statContainer}>
                    <Feather name="users" size={14} color="#FFF" />
                    <Text style={styles.statText}>4K seg.</Text>
                  </View>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.seguirButton}>
              <Text style={styles.seguirButtonText}>Seguir</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.mentorCard}>
            <View style={styles.mentorInfo}>
              <Image
                source={{ uri: "https://via.placeholder.com/48" }}
                style={styles.mentorImage}
              />
              <View style={styles.mentorDetails}>
                <Text style={styles.mentorName}>Michael Chen</Text>
                <Text style={styles.mentorArea}>Data Science</Text>
                <View style={styles.mentorStats}>
                  <View style={styles.statContainer}>
                    <Text style={styles.starIcon}>★</Text>
                    <Text style={styles.statText}>4,3</Text>
                    <Text style={styles.statSubtext}>(800 reviews)</Text>
                  </View>
                  <View style={styles.statContainer}>
                    <Feather name="users" size={14} color="#FFF" />
                    <Text style={styles.statText}>6.4K seg.</Text>
                  </View>
                </View>
              </View>
            </View>
            <TouchableOpacity style={styles.seguirButton}>
              <Text style={styles.seguirButtonText}>Seguir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121214",
    padding: 25,
  },
  popularCoursesSection: {
    marginVertical: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  popularCoursesList: {
    marginHorizontal: -25, // Compensate for container padding
    paddingHorizontal: 25,
  },
  popularCourseCard: {
    width: 280,
    backgroundColor: "#29292E",
    borderRadius: 12,
    marginRight: 16,
    overflow: "hidden",
  },
  popularCourseImage: {
    width: "100%",
    height: 140,
  },
  courseLevelBadge: {
    position: "absolute",
    top: 12,
    left: 12,
    backgroundColor: "rgba(41, 41, 46, 0.9)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  courseLevelText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  courseRatingBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(41, 41, 46, 0.9)",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
  },
  popularCourseInfo: {
    padding: 16,
  },
  popularCourseTitle: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
    marginVertical: 8,
  },
  instructorInfo: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 8,
  },
  instructorAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
  },
  courseStats: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statsText: {
    color: "#FFF",
    fontSize: 12,
    opacity: 0.7,
    marginRight: 8,
  },
  courseCategory: {
    color: "#00B37E",
    fontSize: 14,
    fontWeight: "500",
  },
  instructorName: {
    color: "#FFF",
    fontSize: 14,
    opacity: 0.7,
  },
  starIcon: {
    color: "#00B37E",
    marginRight: 4,
  },
  ratingText: {
    color: "#FFF",
    fontSize: 12,
    fontWeight: "500",
  },
  coursesInProgress: {
    marginVertical: 24,
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
    padding: 12,
    alignItems: "center",
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
  mentoresSection: {
    marginTop: 24,
  },
  mentoresHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#FFF",
    marginBottom: 0,
  },
  verTodos: {
    color: "#00B37E",
    fontSize: 14,
    fontWeight: "500",
  },
  mentorCard: {
    backgroundColor: "#29292E",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  mentorInfo: {
    flexDirection: "row",
    marginBottom: 16,
  },
  mentorImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
  },
  mentorDetails: {
    flex: 1,
  },
  mentorName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 4,
  },
  mentorArea: {
    color: "#FFF",
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 8,
  },
  mentorStats: {
    flexDirection: "row",
    gap: 16,
  },
  statContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  statText: {
    color: "#FFF",
    fontSize: 14,
  },
  statSubtext: {
    color: "#FFF",
    fontSize: 14,
    opacity: 0.7,
  },
  seguirButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 8,
    borderRadius: 20,
    alignItems: "center",
  },
  seguirButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  pointsCard: {
    backgroundColor: "#1C1C1E",
    borderRadius: 12,
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 20,
  },
  pointsLabel: {
    color: "#FFF",
    fontSize: 14,
    opacity: 0.7,
  },
  pointsValue: {
    color: "#FFF",
    fontSize: 24,
    fontWeight: "600",
  },
  pointsButton: {
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  pointsButtonText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "600",
    color: "#FFF",
    width: 200,
  },
  searchContainer: {
    backgroundColor: "#202024",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
    marginBottom: 24,
  },
  searchInput: {
    flex: 1,
    height: "100%",
    color: "#fff",
    fontSize: 16,
    marginLeft: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  categoryContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  categoryItem: {
    alignItems: "center",
  },
  iconContainer: {
    backgroundColor: "#29292E",
    padding: 12,
    borderRadius: 12,
    marginBottom: 8,
  },
  categoryText: {
    color: "#FFF",
    fontSize: 12,
  },
  courseSection: {
    flex: 1,
  },
  courseCard: {
    backgroundColor: "#29292E",
    borderRadius: 12,
    padding: 16,
    marginTop: 20,
  },
  courseHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  profileImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
  },
  courseHeaderInfo: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  courseTitle: {
    color: "#FFF",
    fontSize: 18,
    fontWeight: "500",
    marginBottom: 16,
  },
  progressContainer: {
    gap: 8,
  },
  progressInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  progressText: {
    color: "#FFF",
    fontSize: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 4,
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#00B37E",
    borderRadius: 4,
  },
});
