import {
  StyleSheet,
  TextInput,
  Pressable,
  Animated,
  Modal,
  TouchableOpacity,
  useColorScheme,
} from "react-native";
import { Feather, Ionicons } from "@expo/vector-icons";
import { Text, View, useThemeColor } from "@/components/Themed";
import { useState, useRef, useEffect } from "react";
import DailyScoreChart from "@/components/Daybar";
import Search from "@/components/Search";
import CourseItem from "@/components/CourseItem";

// RadioButton Component
const RadioButton = ({
  label,
  selected,
  onPress,
  animatedBg,
  animatedText,
}) => (
  <Pressable
    style={[styles.radioButton, selected && { backgroundColor: animatedBg }]}
    onPress={onPress}
  >
    <Animated.Text
      style={[
        styles.radioButtonText,
        {
          color: animatedText,
        },
      ]}
    >
      {label}
    </Animated.Text>
  </Pressable>
);

// Floating Filter Button Component
const FloatingFilterButton = ({ onPress }) => (
  <Pressable style={styles.floatingButton} onPress={onPress}>
    <Feather name="filter" size={16} color="#fff" style={styles.filterIcon} />
    <Text style={styles.filterText}>Filtrar</Text>
  </Pressable>
);

// Filter Option Component
const FilterOption = ({ label, selected, onPress }) => {
  const backgroundColor = useThemeColor(
    { light: "#f5f5f5", dark: "#29292E" },
    "background",
  );
  const textColor = useThemeColor({ light: "#666", dark: "#8F8F8F" }, "text");

  return (
    <TouchableOpacity
      style={[
        styles.filterOption,
        {
          backgroundColor: selected
            ? "rgba(130, 87, 229, 0.2)"
            : backgroundColor,
        },
      ]}
      onPress={onPress}
    >
      <Text
        style={[
          styles.filterOptionText,
          { color: selected ? "#8257E5" : textColor },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

// Rating Option Component
const RatingOption = ({ rating, selected, onPress }) => {
  const backgroundColor = useThemeColor(
    { light: "#f5f5f5", dark: "#29292E" },
    "background",
  );
  const textColor = useThemeColor({ light: "#666", dark: "#8F8F8F" }, "text");

  return (
    <TouchableOpacity
      style={[
        styles.filterOption,
        {
          backgroundColor: selected
            ? "rgba(130, 87, 229, 0.2)"
            : backgroundColor,
        },
      ]}
      onPress={onPress}
    >
      <Ionicons
        name="star"
        size={16}
        color={selected ? "#8257E5" : textColor}
      />
      <Text
        style={[
          styles.filterOptionText,
          { color: selected ? "#8257E5" : textColor },
        ]}
      >
        {rating}
      </Text>
    </TouchableOpacity>
  );
};

// Filter Modal Component
const FilterModal = ({ visible, onClose, onApply }) => {
  const [selectedLevel, setSelectedLevel] = useState("Intermédio");
  const [selectedRating, setSelectedRating] = useState("4-5");

  const backgroundColor = useThemeColor(
    { light: "#ffffff", dark: "#202024" },
    "background",
  );
  const textColor = useThemeColor(
    { light: "#000000", dark: "#ffffff" },
    "text",
  );
  const secondaryTextColor = useThemeColor(
    { light: "#666666", dark: "#8F8F8F" },
    "text",
  );

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={[styles.modalContent, { backgroundColor }]}>
          <View style={[styles.modalHeader, { backgroundColor }]}>
            <Text style={[styles.modalTitle, { color: textColor }]}>
              Filtrar Cursos
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={secondaryTextColor} />
            </TouchableOpacity>
          </View>

          <View style={[styles.filterSection, { backgroundColor }]}>
            <Text
              style={[styles.filterSectionTitle, { color: secondaryTextColor }]}
            >
              Nivel
            </Text>
            <View style={styles.filterOptionsRow}>
              <FilterOption
                label="Iniciante"
                selected={selectedLevel === "Iniciante"}
                onPress={() => setSelectedLevel("Iniciante")}
              />
              <FilterOption
                label="Intermédio"
                selected={selectedLevel === "Intermédio"}
                onPress={() => setSelectedLevel("Intermédio")}
              />
              <FilterOption
                label="Avançado"
                selected={selectedLevel === "Avançado"}
                onPress={() => setSelectedLevel("Avançado")}
              />
            </View>
            <View style={styles.filterOptionsRow}>
              <FilterOption
                label="MAZA"
                selected={selectedLevel === "MAZA"}
                onPress={() => setSelectedLevel("MAZA")}
              />
            </View>
          </View>

          <View style={[styles.filterSection, { backgroundColor }]}>
            <Text
              style={[styles.filterSectionTitle, { color: secondaryTextColor }]}
            >
              Avaliação
            </Text>
            <View style={styles.filterOptionsRow}>
              <RatingOption
                rating="0-1"
                selected={selectedRating === "0-1"}
                onPress={() => setSelectedRating("0-1")}
              />
              <RatingOption
                rating="1-2"
                selected={selectedRating === "1-2"}
                onPress={() => setSelectedRating("1-2")}
              />
              <RatingOption
                rating="2-3"
                selected={selectedRating === "2-3"}
                onPress={() => setSelectedRating("2-3")}
              />
            </View>
            <View style={styles.filterOptionsRow}>
              <RatingOption
                rating="3-4"
                selected={selectedRating === "3-4"}
                onPress={() => setSelectedRating("3-4")}
              />
              <RatingOption
                rating="4-5"
                selected={selectedRating === "4-5"}
                onPress={() => setSelectedRating("4-5")}
              />
            </View>
          </View>

          <TouchableOpacity
            style={styles.applyButton}
            onPress={() => {
              onApply({ level: selectedLevel, rating: selectedRating });
              onClose();
            }}
          >
            <Text style={styles.applyButtonText}>Aplicar Filtro</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

// Main Screen Component
export default function MeusCursosScreen() {
  const [selectedFilter, setSelectedFilter] = useState("inProgress");
  const [filterModalVisible, setFilterModalVisible] = useState(false);
  const animationValue = useRef(new Animated.Value(0)).current;

  const buttonWidth = 100; // Approximate width of each button

  const getAnimatedPosition = () => {
    switch (selectedFilter) {
      case "inProgress":
        return 0;
      case "favorites":
        return buttonWidth;
      case "completed":
        return buttonWidth * 2;
      default:
        return 0;
    }
  };

  useEffect(() => {
    Animated.spring(animationValue, {
      toValue: getAnimatedPosition(),
      useNativeDriver: false,
      friction: 20,
      tension: 150,
    }).start();
  }, [selectedFilter]);

  const animatedBg = animationValue.interpolate({
    inputRange: [0, buttonWidth, buttonWidth * 2],
    outputRange: ["#29292E", "#29292E", "#29292E"],
  });

  const animatedText = (buttonIndex) => {
    return animationValue.interpolate({
      inputRange: [
        buttonWidth * (buttonIndex - 0.5),
        buttonWidth * buttonIndex,
        buttonWidth * (buttonIndex + 0.5),
      ],
      outputRange: ["#666", "#fff", "#666"],
      extrapolate: "clamp",
    });
  };

  const handleFilterApply = (filters) => {
    console.log("Applied filters:", filters);
    // Implement your filter logic here
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Meus Cursos</Text>
        <View style={styles.headerButtons}>
          <Pressable style={styles.iconButton}>
            <View style={styles.maximizeButton}>
              <Ionicons name="grid-outline" size={20} color="#fff" />
            </View>
          </Pressable>
          <Pressable style={styles.iconButton}>
            <View style={styles.menuButton}>
              <Ionicons name="menu-outline" size={20} color="#fff" />
            </View>
          </Pressable>
        </View>
      </View>

      <Search />

      <View style={styles.radioGroup}>
        <Animated.View
          style={[
            styles.animatedSelection,
            {
              transform: [
                {
                  translateX: animationValue,
                },
              ],
            },
          ]}
        />
        <RadioButton
          label="Em andam..."
          selected={selectedFilter === "inProgress"}
          onPress={() => setSelectedFilter("inProgress")}
          animatedText={animatedText(0)}
        />
        <RadioButton
          label="Favoritos"
          selected={selectedFilter === "favorites"}
          onPress={() => setSelectedFilter("favorites")}
          animatedText={animatedText(1)}
        />
        <RadioButton
          label="Terminados"
          selected={selectedFilter === "completed"}
          onPress={() => setSelectedFilter("completed")}
          animatedText={animatedText(2)}
        />
      </View>

      <DailyScoreChart />
      <CourseItem />
      <CourseItem />

      <FloatingFilterButton onPress={() => setFilterModalVisible(true)} />

      <FilterModal
        visible={filterModalVisible}
        onClose={() => setFilterModalVisible(false)}
        onApply={handleFilterApply}
      />
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
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: "#121214",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  headerButtons: {
    flexDirection: "row",
    gap: 8,
  },
  iconButton: {
    padding: 0,
  },
  maximizeButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#29292E",
    borderRadius: 6,
  },
  menuButton: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#29292E",
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.1)",
  },
  searchContainer: {
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: "#202024",
    borderRadius: 8,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    height: 44,
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
  radioGroup: {
    flexDirection: "row",
    marginHorizontal: 16,
    marginTop: 16,
    backgroundColor: "#202024",
    borderRadius: 999,
    padding: 4,
    position: "relative",
  },
  radioButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 999,
    alignItems: "center",
    zIndex: 1,
  },
  animatedSelection: {
    position: "absolute",
    top: 4,
    left: 4,
    right: 4,
    bottom: 4,
    width: "33%",
    backgroundColor: "#29292E",
    borderRadius: 999,
    zIndex: 0,
  },
  radioButtonText: {
    fontSize: 14,
    fontWeight: "500",
  },
  floatingButton: {
    position: "absolute",
    bottom: 20,
    alignSelf: "center",
    backgroundColor: "#29292E",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    flexDirection: "row",
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  filterIcon: {
    marginRight: 8,
  },
  filterText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#202024",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    padding: 24,
    minHeight: "50%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  filterSection: {
    marginBottom: 24,
  },
  filterSectionTitle: {
    fontSize: 16,
    color: "#8F8F8F",
    marginBottom: 16,
  },
  filterOptionsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 8,
  },
  filterOption: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 999,
    backgroundColor: "#29292E",
    gap: 4,
  },
  filterOptionSelected: {
    backgroundColor: "rgba(130, 87, 229, 0.1)",
  },
  filterOptionText: {
    color: "#666",
    fontSize: 14,
  },
  filterOptionTextSelected: {
    color: "#8257E5",
  },
  applyButton: {
    backgroundColor: "#2EA8FF",
    padding: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  applyButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "500",
  },
});
