import React from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
} from "react-native";
import { router } from "expo-router";
import Button from "@/components/Button";

export default function Login() {
  const handleRegister = () => {
    // Handle registration logic
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.headerText}>Cadastrar</Text>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => router.push("/login")}>
            <Text style={styles.loginLink}>Faça Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Número de Telemóvel</Text>
            <TextInput
              style={styles.input}
              placeholder="821231231"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              placeholder="João Carlos António"
              placeholderTextColor="#666"
            />
          </View>
        </View>

        <View>
          <Button text={"Registar"} handle={handleRegister} />
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  loginContainer: {
    flexDirection: "row",
    marginBottom: 32,
  },
  loginText: {
    color: "#999999",
    fontSize: 14,
  },
  loginLink: {
    color: "#2196F3",
    fontSize: 14,
  },
  formContainer: {
    gap: 20,
  },
  inputGroup: {
    gap: 8,
  },
  inputLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
  },
  input: {
    height: 48,
    backgroundColor: "#252525",
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 16,
    color: "#FFFFFF",
  },
  registerButton: {
    height: 48,
    backgroundColor: "#2196F3",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 32,
  },
  registerButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
});
