import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  ImageBackground,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface Module {
  id: number;
  title: string;
  videoCount: number;
  isLocked: boolean;
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
  const [activeTab, setActiveTab] = useState<"lessons" | "opinions">(
    "opinions",
  );

  const ratings = [
    { label: "Qualidade dos videos", value: 4.5 },
    { label: "Linguagem Clara", value: 4.8 },
    { label: "Material acessível", value: 4.2 },
  ];

  const reviews = [
    {
      id: "1",
      name: "Carlos Alberto",
      rating: 5,
      date: "24 Oct 2024",
      comment:
        "Eu simplesmente adorei esse curso! O mentor consegue dividir conceitos complexos de negócios digitais em partes fáceis de entender.",
    },
    {
      id: "2",
      name: "Joana Candido",
      rating: 4,
      date: "15 Oct 2024",
      comment: "As lições eram claras e metódicas, facilitando a aprendizagem.",
    },
  ];

  const modules: Module[] = [
    {
      id: 1,
      title: "Introduction to Industrial D...",
      videoCount: 3,
      isLocked: false,
    },
    {
      id: 2,
      title: "Design Thinking and Proble...",
      videoCount: 3,
      isLocked: true,
    },
    {
      id: 3,
      title: "User Experience (UX) in Ind...",
      videoCount: 3,
      isLocked: true,
    },
    {
      id: 4,
      title: "Introduction to Industrial D...",
      videoCount: 3,
      isLocked: false,
    },
    {
      id: 5,
      title: "Design Thinking and Proble...",
      videoCount: 3,
      isLocked: true,
    },
    {
      id: 6,
      title: "User Experience (UX) in Ind...",
      videoCount: 3,
      isLocked: true,
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView} stickyHeaderIndices={[1]}>
        <ImageBackground
          source={{ uri: "https://via.placeholder.com/400x200" }}
          style={styles.header}
        >
          <View style={styles.headerOverlay}>
            <View style={styles.headerActions}>
              <TouchableOpacity style={styles.iconButton}>
                <Feather name="arrow-left" size={24} color="#FFF" />
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
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>Intermédio 🎯</Text>
            </View>
          </View>
        </ImageBackground>

        <View style={styles.courseInfo}>
          <Text style={styles.courseTitle}>
            Entrepreneurship and New Venture Creation
          </Text>
          <View style={styles.instructor}>
            <Image
              source={{ uri: "https://via.placeholder.com/40" }}
              style={styles.instructorImage}
            />
            <Text style={styles.instructorName}>Lívia Donin</Text>
            <Text style={styles.categoryTag}>• Negócios</Text>
          </View>
          <Text style={styles.description}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Cras congue
            arcu purus, vitae vehiculo tortor iaculis vel. Nulla facilisi. Morbi
            eu elit odio. Fusce vestibulum porttitor mauris quis viverra.{" "}
            <Text style={styles.seeMore}>Ver mais</Text>
          </Text>

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
            {modules.map((module) => (
              <TouchableOpacity
                key={module.id}
                style={styles.moduleItem}
                disabled={module.isLocked}
              >
                <View style={styles.moduleInfo}>
                  <Text style={styles.moduleNumber}>{module.id}.</Text>
                  <Text style={styles.moduleTitle}>{module.title}</Text>
                </View>
                <View style={styles.moduleDetails}>
                  <View style={styles.videoCount}>
                    <Feather name="film" size={14} color="#A8A8B3" />
                    <Text style={styles.videoCountText}>
                      {module.videoCount} videos
                    </Text>
                  </View>
                  {module.isLocked ? (
                    <Feather name="lock" size={20} color="#A8A8B3" />
                  ) : (
                    <Feather name="chevron-right" size={20} color="#00B37E" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ) : (
          <View style={styles.opinionsContainer}>
            <View style={styles.ratingOverview}>
              <View style={styles.overallRating}>
                <Text style={styles.ratingNumber}>4,5</Text>
                <View style={styles.starsContainer}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Feather
                      key={star}
                      name="star"
                      size={20}
                      color={star <= 4 ? "#FFB800" : "#A8A8B3"}
                      style={styles.starIcon}
                    />
                  ))}
                </View>
                <Text style={styles.totalReviews}>1.200 opiniões</Text>
              </View>

              <View style={styles.ratingCategories}>
                {ratings.map((rating) => (
                  <View key={rating.label} style={styles.ratingItem}>
                    <Text style={styles.ratingLabel}>{rating.label}</Text>
                    <View style={styles.ratingBar}>
                      <View
                        style={[
                          styles.ratingFill,
                          { width: `${(rating.value / 5) * 100}%` },
                        ]}
                      />
                    </View>
                  </View>
                ))}
              </View>
            </View>

            <View style={styles.reviewFilters}>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <TouchableOpacity
                  style={[styles.filterButton, styles.filterButtonActive]}
                >
                  <Text style={[styles.filterText, styles.filterTextActive]}>
                    Todos
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton}>
                  <Text style={styles.filterText}>Maior Pontuação</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.filterButton}>
                  <Text style={styles.filterText}>Mais Recentes</Text>
                </TouchableOpacity>
              </ScrollView>
            </View>

            <View style={styles.reviewsList}>
              {reviews.map((review) => (
                <View key={review.id} style={styles.reviewItem}>
                  <View style={styles.reviewHeader}>
                    <Text style={styles.reviewerName}>{review.name}</Text>
                    <Text style={styles.reviewDate}>{review.date}</Text>
                  </View>
                  <View style={styles.starsContainer}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Feather
                        key={star}
                        name="star"
                        size={16}
                        color={star <= review.rating ? "#FFB800" : "#A8A8B3"}
                        style={styles.starIcon}
                      />
                    ))}
                  </View>
                  <Text style={styles.reviewText}>{review.comment}</Text>
                </View>
              ))}
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
  levelBadge: {
    alignSelf: "flex-start",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  levelText: {
    color: "#FFF",
    fontSize: 14,
    fontWeight: "500",
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
  instructorImage: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
  },
  instructorName: {
    color: "#FFF",
    fontSize: 14,
  },
  categoryTag: {
    color: "#00B37E",
    fontSize: 14,
    marginLeft: 8,
  },
  description: {
    color: "#A8A8B3",
    fontSize: 14,
    lineHeight: 22,
    marginBottom: 24,
  },
  seeMore: {
    color: "#00B37E",
    fontWeight: "500",
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
    borderBottomColor: "#00B37E",
  },
  tabText: {
    color: "#A8A8B3",
    fontSize: 16,
    fontWeight: "500",
  },
  activeTabText: {
    color: "#00B37E",
  },
  modulesList: {
    padding: 24,
  },
  moduleItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#202024",
    borderRadius: 15,
    marginBottom: 12,
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
    gap: 16,
  },
  videoCount: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
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
    backgroundColor: "#00B37E",
    padding: 16,
    borderRadius: 50,
    alignItems: "center",
  },
  startButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  opinionsContainer: {
    padding: 24,
  },
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
  totalReviews: {
    color: "#A8A8B3",
    fontSize: 14,
  },
  ratingCategories: {
    gap: 16,
  },
  ratingItem: {
    gap: 8,
  },
  ratingLabel: {
    color: "#FFF",
    fontSize: 14,
  },
  ratingBar: {
    height: 8,
    backgroundColor: "#323238",
    borderRadius: 4,
    overflow: "hidden",
  },
  ratingFill: {
    height: "100%",
    backgroundColor: "#FFB800",
    borderRadius: 4,
  },
  reviewFilters: {
    marginBottom: 24,
  },
  filterButton: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    backgroundColor: "#202024",
  },
  filterButtonActive: {
    backgroundColor: "#00B37E",
  },
  filterText: {
    color: "#A8A8B3",
    fontSize: 14,
  },
  filterTextActive: {
    color: "#FFF",
  },
  reviewsList: {
    gap: 24,
  },
  reviewItem: {
    gap: 8,
  },
  reviewHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  reviewerName: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  reviewDate: {
    color: "#A8A8B3",
    fontSize: 14,
  },
  reviewText: {
    color: "#A8A8B3",
    fontSize: 14,
    lineHeight: 20,
  },
});
