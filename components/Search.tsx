import { View } from "@/components/Themed";
import { TextInput, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function Search() {
  return (
    <View style={styles.searchContainer}>
      <TextInput
        style={styles.searchInput}
        placeholder="Pesquisar..."
        placeholderTextColor="#666"
        selectionColor="#fff"
      />
      <Feather name="search" size={20} color="#666" style={styles.searchIcon} />
    </View>
  );
}

const styles = StyleSheet.create({
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
});
