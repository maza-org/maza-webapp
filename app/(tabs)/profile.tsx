import React, { useState } from 'react';
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
import { router } from 'expo-router';
import useUser from '@/hooks/useUser';

export interface Subject {
  id: number;
  documentId: string;
  name: string;
}

export default function ProfileScreen() {
  const { data: user, isLoading, error } = useUser();
  const [isEditing, setIsEditing] = useState(false);
  const [deletingInterestId, setDeletingInterestId] = useState<number | null>(null);

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

              const response = await fetch(
                `https://maza-strapi-backend.onrender.com/api/users-permissions/interests/${subject.documentId}`,
                {
                  method: 'DELETE',
                  headers: {
                    Authorization: `Bearer ${user?.token}`,
                  },
                }
              );

              if (!response.ok) {
                throw new Error('Failed to delete interest');
              }

              Alert.alert('Sucesso', 'Interesse removido com sucesso');
              user.interests = user.interests.filter((interest) => interest.id !== subject.id);
              await AsyncStorage.setItem('@user', JSON.stringify(user));
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

  if (isLoading) {
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
          <View style={styles.profileImageContainer}>
            <View style={styles.profileImagePlaceholder}>
              <Text style={styles.profileImagePlaceholderText}>{user.fullname.charAt(0)}</Text>
            </View>
          </View>
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

          <View style={styles.infoItem}>
            <View style={styles.headerContainer}>
              <View style={styles.infoHeader}>
                <Feather name="star" size={20} color="#1fa2df" />
                <Text style={styles.infoLabel}>Interesses</Text>
              </View>
              <TouchableOpacity onPress={() => setIsEditing(!isEditing)} style={styles.editButton}>
                <Feather name={isEditing ? 'check' : 'edit-2'} size={16} color="#1fa2df" />
              </TouchableOpacity>
            </View>

            <View style={styles.interestsContainer}>
              {user.interests && user.interests.length > 0 ? (
                <View style={styles.interestsList}>
                  {user.interests.map((subject: Subject) => (
                    <View key={subject.id} style={styles.interestTag}>
                      <View style={styles.interestIconContainer}>
                        <Feather name="hash" size={14} color="#1fa2df" />
                      </View>
                      <Text style={styles.interestText}>{subject.name}</Text>
                      {isEditing &&
                        (deletingInterestId === subject.id ? (
                          <ActivityIndicator size="small" color="#1fa2df" style={styles.deleteInterestLoading} />
                        ) : (
                          <TouchableOpacity
                            onPress={() => handleDeleteInterest(subject)}
                            style={styles.deleteInterestButton}
                          >
                            <Feather name="x" size={14} color="#1fa2df" />
                          </TouchableOpacity>
                        ))}
                    </View>
                  ))}
                </View>
              ) : (
                <View style={styles.emptyState}>
                  <Feather name="star" size={24} color="#A8A8B3" style={styles.emptyStateIcon} />
                  <Text style={styles.emptyStateText}>Nenhum interesse adicionado</Text>
                  <TouchableOpacity style={styles.addInterestButton}>
                    <Feather name="plus" size={16} color="#FFF" />
                    <Text style={styles.addInterestText}>Adicionar Interesses</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          </View>
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
  profileImageContainer: {
    marginBottom: 16,
  },
  profileImagePlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#1fa2df',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#121214',
  },
  profileImagePlaceholderText: {
    color: '#FFF',
    fontSize: 36,
    fontWeight: 'bold',
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
  headerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  editButton: {
    padding: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(31, 162, 223, 0.1)',
  },
  infoValue: {
    color: '#A8A8B3',
    fontSize: 14,
    marginLeft: 28,
  },
  interestsContainer: {
    marginLeft: 28,
  },
  interestsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  interestTag: {
    backgroundColor: 'rgba(31, 162, 223, 0.08)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: 'rgba(31, 162, 223, 0.2)',
  },
  interestIconContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(31, 162, 223, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  interestText: {
    color: '#1fa2df',
    fontSize: 14,
    fontWeight: '500',
  },
  emptyState: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  emptyStateIcon: {
    opacity: 0.5,
  },
  emptyStateText: {
    color: '#A8A8B3',
    fontSize: 14,
    textAlign: 'center',
  },
  addInterestButton: {
    marginTop: 8,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1fa2df',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    gap: 8,
  },
  addInterestText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '500',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#323238',
    gap: 12,
    alignItems: 'center',
  },
  versionLabel: {
    color: '#A8A8B3',
    fontSize: 12,
    textAlign: 'center',
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
