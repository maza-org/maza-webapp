import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
} from "react-native";
import { Feather } from "@expo/vector-icons";

interface PhotoScreenProps {}

export default function Photo({}: PhotoScreenProps): JSX.Element {
  const [photoUri, setPhotoUri] = useState<string | null>(null);

  const handleSelectPhoto = (): void => {
    // Implementation for photo selection
    console.log("Select photo");
  };

  const handleConfirm = (): void => {
    // Implementation for confirmation
    console.log("Confirm photo");
  };

  const handleSkip = (): void => {
    // Implementation for skip
    console.log("Skip photo upload");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Carregar{"\n"}Foto de Perfil</Text>
          <Text style={styles.subtitle}>Escolha uma a foto de perfil</Text>
        </View>

        <TouchableOpacity
          style={styles.uploadArea}
          onPress={handleSelectPhoto}
          activeOpacity={0.7}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
          ) : (
            <>
              <Feather name="upload" size={24} color="#22ACE3" />
              <Text style={styles.uploadText}>
                Upload your photos with a{"\n"}maximum size of 5 MB
              </Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <TouchableOpacity
            style={styles.confirmButton}
            onPress={handleConfirm}
          >
            <Text style={styles.confirmButtonText}>Confirmar</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
            <Text style={styles.skipButtonText}>Deixar para depois</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121214",
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: "#A8A8B3",
    lineHeight: 24,
  },
  uploadArea: {
    flex: 1,
    maxHeight: 400,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#323238",
    borderRadius: 8,
    backgroundColor: "rgba(32, 32, 36, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    marginVertical: 32,
  },
  uploadText: {
    color: "#A8A8B3",
    fontSize: 14,
    textAlign: "center",
    marginTop: 12,
  },
  previewImage: {
    width: "100%",
    height: "100%",
    borderRadius: 8,
  },
  footer: {
    marginTop: "auto",
  },
  confirmButton: {
    backgroundColor: "#22ACE3",
    padding: 16,
    borderRadius: 50,
    alignItems: "center",
    marginBottom: 12,
  },
  confirmButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: {
    padding: 16,
    alignItems: "center",
  },
  skipButtonText: {
    color: "#A8A8B3",
    fontSize: 16,
  },
});
