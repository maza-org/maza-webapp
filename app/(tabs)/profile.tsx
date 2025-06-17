import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useFocusEffect } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import useUser from '../hooks/useUser';
import { ProfileImage } from '../components/ProfileImage';
import { InterestsSection } from '../components/InterestsSection';
import { CertificatesSection } from '../components/CertificatesSection';
import { Certificate, Subject } from '../types/profile';
import { baseUrl } from '@/services/api';

export default function ProfileScreen() {
  const { data: user, isLoading, error, refetch } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [deletingInterestId, setDeletingInterestId] = useState<number | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [isLoadingCertificates, setIsLoadingCertificates] = useState(false);
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  useFocusEffect(
    useCallback(() => {
      const refreshProfileData = async () => {
        setIsRefreshing(true);
        try {
          await refetch();
          await fetchCertificates();
          if (user?.profile_image?.formats?.thumbnail?.url) {
            setProfileImage(user?.profile_image?.formats?.thumbnail?.url);
          }
        } catch (error) {
          console.error('Error refreshing profile data:', error);
        } finally {
          setIsRefreshing(false);
        }
      };

      refreshProfileData();
    }, [refetch, user?.profile_image?.formats?.thumbnail?.url])
  );

  const fetchCertificates = async () => {
    setIsLoadingCertificates(true);
    try {
      if (!user?.token) {
        throw new Error('No authentication token found');
      }

      const response = await fetch(`${baseUrl}/certificates`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
      });
      if (response.ok) {
        const responseData = await response.json();
        setCertificates(responseData.data);
      }
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setIsLoadingCertificates(false);
    }
  };

  const handleLogout = async () => {
    try {
      await AsyncStorage.removeItem('@user');
      router.replace('/');
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Erro', 'Falha ao terminar sessão');
    }
  };

  const handleDeleteInterest = async (subject: Subject) => {
    try {
      Alert.alert('Confirmar', 'Tem certeza que deseja remover este interesse?', [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Remover',
          style: 'destructive',
          onPress: async () => {
            try {
              setDeletingInterestId(subject.id);

              if (!user?.token) {
                throw new Error('No authentication token found');
              }

              const response = await fetch(`${baseUrl}/users-permissions/interests/${subject.documentId}`, {
                method: 'DELETE',
                headers: {
                  Authorization: `Bearer ${user?.token}`,
                },
              });

              if (!response.ok) {
                throw new Error('Failed to delete interest');
              }

              Alert.alert('Sucesso', 'Interesse removido com sucesso');
              await refetch();
            } catch (error) {
              console.error('Error making DELETE request:', error);
              Alert.alert('Erro', 'Falha ao remover interesse');
            } finally {
              setDeletingInterestId(null);
            }
          },
        },
      ]);
    } catch (error) {
      console.error('Error in handleDeleteInterest:', error);
      Alert.alert('Erro', 'Falha ao remover interesse');
      setDeletingInterestId(null);
    }
  };

  const handleChangePhoto = async () => {
    Alert.alert('Alterar Foto', 'Escolha uma opção', [
      {
        text: 'Tirar Foto',
        onPress: async () => {
          try {
            const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();

            if (cameraPermission.status !== 'granted') {
              Alert.alert('Permissão necessária', 'É necessário permitir o acesso à câmera para tirar uma foto.');
              return;
            }

            const result = await ImagePicker.launchCameraAsync({
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });

            if (!result.canceled) {
              await uploadImage(result.assets[0].uri);
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
            const galleryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();

            if (galleryPermission.status !== 'granted') {
              Alert.alert('Permissão necessária', 'É necessário permitir o acesso à galeria para escolher uma foto.');
              return;
            }

            const result = await ImagePicker.launchImageLibraryAsync({
              mediaTypes: ImagePicker.MediaTypeOptions.Images,
              allowsEditing: true,
              aspect: [1, 1],
              quality: 0.5,
            });

            if (!result.canceled) {
              await uploadImage(result.assets[0].uri);
            }
          } catch (error) {
            console.error('Error picking image:', error);
            Alert.alert('Erro', 'Não foi possível seleccionar a imagem.');
          }
        },
      },
      {
        text: 'Cancelar',
        style: 'cancel',
      },
    ]);
  };

  const uploadImage = async (imageUri: string) => {
    try {
      setIsUploadingImage(true);

      if (!user?.token) {
        throw new Error('No authentication token found');
      }
      const formData = new FormData();
      const fileName = imageUri.split('/').pop() || 'profile_image.jpg';
      const fileType = fileName.split('.').pop() || 'jpg';

      // @ts-ignore - FormData accepts File or Blob but React Native's typing doesn't reflect this
      formData.append('files', {
        uri: imageUri,
        name: fileName,
        type: `image/${fileType}`,
      });

      formData.append('ref', 'plugin::users-permissions.user');
      formData.append('refId', user.id.toString());
      formData.append('field', 'profile_image');

      const response = await fetch(`${baseUrl}/upload`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${user.token}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Failed to upload image');
      }

      const responseData = await response.json();

      if (responseData && responseData.length > 0) {
        setProfileImage(responseData[0].url);
        await refetch();
        Alert.alert('Sucesso', 'Foto de perfil actualizada com sucesso');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      Alert.alert('Erro', 'Falha ao enviar a imagem');
    } finally {
      setIsUploadingImage(false);
    }
  };

  if (isLoading || isRefreshing) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#1fa2df" />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
          <View style={styles.errorIconContainer}>
            <Feather name="user-x" size={48} color="#1fa2df" />
          </View>
          <Text style={styles.errorTitle}>Sessão Expirada</Text>
          <Text style={styles.errorText}>
            A sua sessão expirou ou não está autenticado. Por favor, inicie sessão novamente para aceder ao seu perfil.
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.replace('/login')}>
            <Feather name="log-in" size={20} color="#FFF" style={styles.loginButtonIcon} />
            <Text style={styles.loginButtonText}>Iniciar Sessão</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <View style={styles.header}>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
              <Feather name="chevron-left" size={24} color="#FFF" />
            </TouchableOpacity>
            <TouchableOpacity style={styles.iconButton} onPress={() => router.push('/user/edit')}>
              <Feather name="edit-2" size={24} color="#FFF" />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.profileSection}>
          <ProfileImage
            profileImage={profileImage}
            isUploadingImage={isUploadingImage}
            userFullname={user.fullname}
            onPress={handleChangePhoto}
          />
          <Text style={styles.fullname}>{user.fullname}</Text>
          <Text style={styles.documentId}>ID: {user.documentId}</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <Feather name="phone" size={20} color="#1fa2df" />
              <Text style={styles.infoLabel}>Número de Telemóvel</Text>
            </View>
            <Text style={styles.infoValue}>{user.phone}</Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <Feather name="mail" size={20} color="#1fa2df" />
              <Text style={styles.infoLabel}>Email</Text>
            </View>
            <Text style={styles.infoValue}>{user.email || 'Não fornecido'}</Text>
          </View>

          <View style={styles.infoItem}>
            <View style={styles.infoHeader}>
              <Feather name="tag" size={20} color="#1fa2df" />
              <Text style={styles.infoLabel}>ID Yoma</Text>
            </View>
            <Text style={styles.infoValue}>{user.yomaId || 'Não conectado'}</Text>
          </View>

          <InterestsSection
            interests={user.interests || []}
            isEditing={isEditing}
            deletingInterestId={deletingInterestId}
            onDeleteInterest={handleDeleteInterest}
            onAddInterest={() => {
              router.push({
                pathname: '/start/customize',
                params: {
                  interests: user?.interests ? JSON.stringify(user?.interests) : undefined,
                },
              });
            }}
          />

          <CertificatesSection
            certificates={certificates}
            isLoadingCertificates={isLoadingCertificates}
            onViewCertificate={(certificate) => {
              router.push({
                pathname: '/user/certificate',
                params: {
                  certificateId: certificate.documentId,
                },
              });
            }}
            onViewAll={() => router.push('/user/certificates')}
          />

          <Text style={styles.versionLabel}>Versão 1.0.0</Text>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Feather name="log-out" size={20} color="#FFF" />
          <Text style={styles.logoutButtonText}>Terminar Sessão</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121214',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#121214',
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: '#121214',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorContent: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
    borderRadius: 16,
    padding: 24,
  },
  errorIconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(31, 162, 223, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  errorTitle: {
    color: '#FFF',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 12,
    textAlign: 'center',
  },
  errorText: {
    color: '#A8A8B3',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  loginButton: {
    backgroundColor: '#1fa2df',
    padding: 16,
    borderRadius: 50,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loginButtonIcon: {
    marginRight: 8,
  },
  loginButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  header: {
    height: 100,
    padding: 24,
    backgroundColor: '#202024',
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileSection: {
    alignItems: 'center',
    padding: 24,
    marginTop: -50,
  },
  fullname: {
    fontSize: 24,
    fontWeight: '700',
    color: '#FFF',
    marginBottom: 8,
  },
  documentId: {
    color: '#A8A8B3',
    fontSize: 14,
  },
  infoSection: {
    padding: 24,
    gap: 24,
  },
  infoItem: {
    gap: 12,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  infoValue: {
    color: '#A8A8B3',
    fontSize: 14,
    marginLeft: 28,
  },
  versionLabel: {
    color: '#A8A8B3',
    fontSize: 12,
    textAlign: 'center',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#323238',
    gap: 12,
    alignItems: 'center',
  },
  logoutButton: {
    backgroundColor: '#202024',
    padding: 16,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    width: '100%',
  },
  logoutButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
