import React, { useRef, useState } from "react";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import Button from "@/components/Button";
import { Ionicons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { mapLoginResponseToUser, User } from "@/types/user";

export default function Otp() {
  const { phone, otpId, fullName } = useLocalSearchParams();
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  const saveUser = async (user: User) => {
    try {
      await AsyncStorage.setItem("@user", JSON.stringify(user));
    } catch (error) {
      console.error("Error saving user data:", error);
      Alert.alert("Erro", "Falha ao salvar dados do usuário");
    }
  };

  const handleConfirm = async () => {
    if (!otpId) {
      Alert.alert("Erro", "Por favor, solicite o código OTP primeiro");
      return;
    }

    const otpCode = otp.join("");
    if (otpCode.length !== 6) {
      Alert.alert("Erro", "Por favor, insira o código OTP completo");
      return;
    }

    setLoading(true);
    try {
      // Determine if we should create an account or login based on fullName presence
      const endpoint = fullName
        ? `${process.env.EXPO_PUBLIC_BASE_URL}/api/users`
        : `${process.env.EXPO_PUBLIC_BASE_URL}/api/auth/login`;

      const body = fullName
        ? {
            data: {
              phone: phone,
              otpID: otpId,
              code: otpCode,
              fullname: fullName,
            },
          }
        : {
            identifier: phone,
            otpID: otpId,
            password: otpCode,
          };

      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success || (fullName && data.data)) {
        // Check for success in both login and registration cases
        await saveUser(mapLoginResponseToUser(data));
        router.push("/start/customize");
      } else {
        Alert.alert(
          "Erro de Verificação",
          "Código OTP incorreto. Por favor, verifique e tente novamente.",
          [{ text: "OK" }],
        );
      }
    } catch (error) {
      console.log(error);
      Alert.alert(
        "Erro",
        "Ocorreu um erro ao verificar o código. Por favor, tente novamente.",
        [{ text: "OK" }],
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyPress = (e, index: number) => {
    if (e.nativeEvent.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <Text style={styles.headerText}>Código OTP</Text>
        <Text style={styles.subText}>
          Enviamos uma SMS com o código de autenticação{"\n"}
          para o número <Text style={styles.phoneNumber}>{phone}</Text>
        </Text>

        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Código de Verificação</Text>
          <View style={styles.otpContainer}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <TextInput
                key={i}
                ref={(ref) => (inputRefs.current[i] = ref)}
                style={styles.otpInput}
                maxLength={1}
                keyboardType="number-pad"
                value={otp[i]}
                onChangeText={(value) => handleOtpChange(value, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
              />
            ))}
          </View>
        </View>

        <Button text="Confirmar" handle={handleConfirm} loading={loading} />

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Não recebeu o código? </Text>
          <TouchableOpacity>
            <Text style={styles.resendLink}>Reenviar Código</Text>
          </TouchableOpacity>
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
  backButton: {
    marginBottom: 16,
    padding: 8,
    borderStyle: "solid",
    borderColor: "#b3b3b3",
    borderWidth: 0.5,
    borderRadius: 50,
  },
  backButtonText: {
    color: "#FFFFFF",
    fontSize: 24,
  },
  headerText: {
    fontSize: 28,
    fontWeight: "600",
    color: "#FFFFFF",
    marginBottom: 8,
  },
  subText: {
    color: "#999999",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 32,
  },
  phoneNumber: {
    color: "#FFFFFF",
  },
  formContainer: {
    marginBottom: 32,
  },
  inputLabel: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 16,
  },
  otpContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 48,
    backgroundColor: "#252525",
    borderRadius: 24,
    textAlign: "center",
    fontSize: 16,
    color: "#FFFFFF",
  },
  resendContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 16,
  },
  resendText: {
    color: "#999999",
    fontSize: 14,
  },
  resendLink: {
    color: "#2196F3",
    fontSize: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
    color: "#FFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
  },
});
