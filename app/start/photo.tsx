import React, { useState } from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity, Image, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import useUser from '@/hooks/useUser';

export default function Photo() {
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { data: user } = useUser();

  const handleSelectPhoto = async (): Promise<void> => {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (status !== 'granted') {
      alert('Sorry, we need camera roll permissions to make this work!');
      return;
    }

    // Launch image picker
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleConfirm = async (): Promise<void> => {
    if (!photoUri || isUploading) return;

    try {
      setIsUploading(true);

      // Create form data
      const formData = new FormData();

      // Append the image file first (Strapi expects 'files' to be the first field)
      const filename = photoUri.split('/').pop() || 'profile-image.jpg';
      formData.append('files', {
        uri: Platform.OS === 'android' ? photoUri : photoUri.replace('file://', ''),
        name: filename,
        type: 'image/jpeg',
      } as any);

      // Append other fields after the file
      formData.append('ref', 'plugin::users-permissions.user');
      formData.append('refId', user.id.toString());
      formData.append('field', 'profile_image');

      // Make the upload request
      const response = await fetch('https://maza-strapi-backend.onrender.com/api/upload', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${user?.token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed with status ${response.status}`);
      }

      const data = await response.json();
      console.log('Upload successful:', data);
      // Handle success (e.g., navigation, showing success message)
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleSkip = (): void => {
    // Implementation for skip
    console.log('Skip photo upload');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.title}>Carregar{'\n'}Foto de Perfil</Text>
          <Text style={styles.subtitle}>Escolha uma a foto de perfil</Text>
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
            <Text style={styles.confirmButtonText}>{isUploading ? 'Uploading...' : 'Confirmar'}</Text>
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
});
