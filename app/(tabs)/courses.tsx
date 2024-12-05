import { StyleSheet, TextInput, Pressable, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";
import { Text, View } from "@/components/Themed";
import { useState, useRef, useEffect } from "react";
import Ionicons from "@expo/vector-icons/Ionicons";
import DailyScoreChart from "@/components/Daybar";
import Search from "@/components/Search";

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

export default function MeusCursosScreen() {
  const [selectedFilter, setSelectedFilter] = useState("inProgress");
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

  return (
    <View style={styles.container}>
      {/* Header */}
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

      {/* Search Bar */}
      <Search />
      {/* Radio Button Group */}
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
});
