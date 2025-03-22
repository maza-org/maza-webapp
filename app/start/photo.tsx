import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  Image,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import useUser from '@/hooks/useUser';
import { router } from 'expo-router';

export default function Photo() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { data: user, refetch } = useUser();

  const handleSelectPhoto = async (): Promise<void> => {
    Alert.alert('Escolher Foto', 'Escolha uma opção', [
      {
        text: 'Tirar Foto',
        onPress: async () => {
          try {
            // Request camera permissions
            const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

            if (cameraPermission.status !== 'granted') {
              Alert.alert('Permissão necessária', 'É necessário permitir o acesso à câmera para tirar uma foto.');
              return;
            }

            // Launch camera
            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });

            if (!result.canceled) {
              setPhotoUri(result.assets[0].uri);
            }
          } catch (error) {
            console.error('Error taking photo:', error);
            Alert.alert('Erro', 'Não foi possível tirar a foto.');
          }
        },
      },
      {
        text: 'Escolher da Galeria',
        onPress: async () => {
          try {
            // Request media library permissions
            const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (galleryPermission.status !== 'granted') {
              Alert.alert('Permissão necessária', 'É necessário permitir o acesso à galeria para escolher uma foto.');
              return;
            }

            // Launch image library
            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });

            if (!result.canceled) {
              setPhotoUri(result.assets[0].uri);
            }
          } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Erro', 'Não foi possível selecionar a imagem.');
          }
        },
      },
      {
        text: 'Cancelar',
        style: 'cancel',
      },
    ]);
  };

  const handleConfirm = async (): Promise<void> => {
    if (!photoUri || isUploading) return;

    try {
      setIsUploading(true);

      if (!user?.token) {
        throw new Error('No authentication token found');
      }

      // Create form data
      const formData = new FormData();

      // Get file name from URI
      const fileName = photoUri.split('/').pop() || 'profile_image.jpg';

      // Convert URI to file object
      const fileType = fileName.split('.').pop() || 'jpg';

      // @ts-ignore - FormData accepts File or Blob but React Native's typing doesn't reflect this
      formData.append('files', {
        uri: photoUri,
        name: fileName,
        type: `image/${fileType}`,
      });

      formData.append('ref', 'plugin::users-permissions.user');
      formData.append('refId', user.id.toString());
      formData.append('field', 'profile_image');

      // Upload image
      const response = await fetch('https://maza-strapi-backend.onrender.com/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Error response body:', errorText);
        throw new Error(`Upload failed with status ${response.status}: ${errorText}`);
      }

      const responseData = await response.json();

      if (responseData && responseData.length > 0) {
        // Refresh user data to get updated profile
        await refetch();

        Alert.alert('Sucesso', 'Foto de perfil atualizada com sucesso', [
          {
            text: 'OK',
            onPress: () => router.back(), // Navigate back after successful upload
          },
        ]);
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Erro', 'Falha ao enviar a imagem');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = (): void => {
    router.back(); // Navigate back to previous screen
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.title}>Carregar{'\n'}Foto de Perfil</Text>
          <Text style={styles.subtitle}>Escolha uma foto de perfil</Text>
        </View>

        <TouchableOpacity
          style={styles.uploadArea}
          onPress={handleSelectPhoto}
          activeOpacity={0.7}
          disabled={isUploading}
        >
          {photoUri ? (
            <Image source={{ uri: photoUri }} style={styles.previewImage} />
          ) : (
            <>
              <Feather name="upload" size={24} color="#22ACE3" />
              <Text style={styles.uploadText}>Carregue as suas fotografias com {'\n'}um tamanho máximo de 5 MB</Text>
            </>
          )}
        </TouchableOpacity>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.confirmButton, (!photoUri || isUploading) && styles.confirmButtonDisabled]}
            onPress={handleConfirm}
            disabled={!photoUri || isUploading}
          >
            {isUploading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="small" color="#FFFFFF" />
                <Text style={styles.confirmButtonText}>A carregar...</Text>
              </View>
            ) : (
              <Text style={styles.confirmButtonText}>Confirmar</Text>
            )}
          </TouchableOpacity>

          <TouchableOpacity style={styles.skipButton} onPress={handleSkip} disabled={isUploading}>
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
    backgroundColor: '#121214',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  header: {
    marginBottom: 32,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 16,
  },
  subtitle: {
    fontSize: 16,
    color: '#A8A8B3',
    lineHeight: 24,
  },
  uploadArea: {
    flex: 1,
    maxHeight: 400,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: '#323238',
    borderRadius: 8,
    backgroundColor: 'rgba(32, 32, 36, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 32,
    overflow: 'hidden',
  },
  uploadText: {
    color: '#A8A8B3',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 12,
  },
  previewImage: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  footer: {
    marginTop: 'auto',
  },
  confirmButton: {
    backgroundColor: '#22ACE3',
    padding: 16,
    borderRadius: 50,
    alignItems: 'center',
    marginBottom: 12,
  },
  confirmButtonDisabled: {
    backgroundColor: 'rgba(34, 172, 227, 0.5)',
  },
  confirmButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    padding: 16,
    alignItems: 'center',
  },
  skipButtonText: {
    color: '#A8A8B3',
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
