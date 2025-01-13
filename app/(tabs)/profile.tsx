import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";

interface User {
  id: string;
  documentId: string;
  email: string;
  fullname: string;
  phone: string;
  yoma_id: string;
  token: string;
}

export default function ProfileScreen() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const userData = await AsyncStorage.getItem("@user");
      if (userData) {
        setUser(JSON.parse(userData));
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      Alert.alert("Error", "Failed to load user data");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem("@user");
      router.replace("/");
    } catch (error) {
      console.error("Error during logout:", error);
      Alert.alert("Error", "Failed to logout");
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1fa2df" />
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>No user data found</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => router.replace("/")}
        >
          <Text style={styles.loginButtonText}>Go to Login</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerActions}>
            <TouchableOpacity
              style={styles.iconButton}
              onPress={() => router.back()}
            >
              <Feather name="chevron-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton}>
              <Feather name="edit-2" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileSection}>
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>
                {user.fullname.charAt(0)}
              </Text>
            </View>
          </View>
          <Text style={styles.fullname}>{user.fullname}</Text>
          <Text style={styles.documentId}>ID: {user.documentId}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <Feather name="phone" size={20} color="#1fa2df" />
              <Text style={styles.infoLabel}>Phone Number</Text>
            </View>
            <Text style={styles.infoValue}>{user.phone}</Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <Feather name="mail" size={20} color="#1fa2df" />
              <Text style={styles.infoLabel}>Email</Text>
            </View>
            <Text style={styles.infoValue}>{user.email || "Not provided"}</Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <Feather name="tag" size={20} color="#1fa2df" />
              <Text style={styles.infoLabel}>Yoma ID</Text>
            </View>
            <Text style={styles.infoValue}>
              {user.yoma_id || "Not connected"}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color="#FFF" />
          <Text style={styles.logoutButtonText}>Logout</Text>
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
  loadingContainer: {
    flex: 1,
    backgroundColor: "#121214",
    justifyContent: "center",
    alignItems: "center",
  },
  errorContainer: {
    flex: 1,
    backgroundColor: "#121214",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  errorText: {
    color: "#FFF",
    fontSize: 16,
    marginBottom: 16,
  },
  loginButton: {
    backgroundColor: "#1fa2df",
    padding: 16,
    borderRadius: 50,
    width: "100%",
    alignItems: "center",
  },
  loginButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    height: 100,
    padding: 24,
    backgroundColor: "#202024",
  },
  headerActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  profileSection: {
    alignItems: "center",
    padding: 24,
    marginTop: -50,
  },
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#1fa2df",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#121214",
  },
  profileImagePlaceholderText: {
    color: "#FFF",
    fontSize: 36,
    fontWeight: "bold",
  },
  fullname: {
    fontSize: 24,
    fontWeight: "700",
    color: "#FFF",
    marginBottom: 8,
  },
  documentId: {
    color: "#A8A8B3",
    fontSize: 14,
  },
  infoSection: {
    padding: 24,
    gap: 24,
  },
  infoItem: {
    gap: 8,
  },
  infoHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  infoLabel: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "500",
  },
  infoValue: {
    color: "#A8A8B3",
    fontSize: 14,
    marginLeft: 28,
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: "#323238",
  },
  logoutButton: {
    backgroundColor: "#202024",
    padding: 16,
    borderRadius: 50,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
  },
  logoutButtonText: {
    color: "#FFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
