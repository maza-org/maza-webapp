import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";

type Category = {
  id: number;
  name: string;
  courses: number;
  icon: keyof typeof Ionicons.glyphMap;
};

const categories: Category[] = [
  { id: 1, name: "Design", courses: 32, icon: "brush-outline" },
  { id: 2, name: "Tecnologia", courses: 27, icon: "desktop-outline" },
  { id: 3, name: "Saúde e bem-estar", courses: 19, icon: "fitness-outline" },
  { id: 4, name: "Finanças", courses: 10, icon: "cash-outline" },
  { id: 5, name: "Writing", courses: 29, icon: "create-outline" },
  { id: 6, name: "Marketing Digital", courses: 30, icon: "megaphone-outline" },
  { id: 7, name: "Personal Development", courses: 17, icon: "person-outline" },
];

export default function CategorySelection() {
  const handleBack = () => {
    router.back();
  };

  const handleCategoryPress = (category: Category) => {
    // Navigate to category detail page
    // router.push({
    //   pathname: "/category/[id]",
    //   params: { id: category.id },
    // });
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} style={styles.backButton}>
          <Ionicons name="chevron-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Escolha uma categoria</Text>
      </View>

      <View style={styles.categoriesList}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={styles.categoryItem}
            onPress={() => handleCategoryPress(category)}
          >
            <View style={styles.iconContainer}>
              <Ionicons name={category.icon} size={24} color="#FFF" />
            </View>
            <View style={styles.categoryInfo}>
              <Text style={styles.categoryName}>{category.name}</Text>
              <Text style={styles.coursesCount}>{category.courses} Cursos</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#666" />
          </TouchableOpacity>
        ))}
      </View>
    </View>
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
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#29292E",
  },
  backButton: {
    padding: 8,
    borderStyle: "solid",
    borderColor: "#b3b3b3",
    borderWidth: 0.5,
    borderRadius: 50,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    color: "#FFF",
  },
  categoriesList: {
    padding: 16,
  },
  categoryItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#29292E",
    borderRadius: 12,
    marginBottom: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#202024",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  categoryInfo: {
    flex: 1,
  },
  categoryName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#FFF",
  },
  coursesCount: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.7)",
    marginTop: 4,
  },
});
