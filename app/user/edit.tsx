import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import useUser from '@/hooks/useUser';
import { baseUrl } from '@/services/api';

export default function EditProfileScreen() {
  const { data: user, isLoading, error, refresh } = useUser();
  const [formData, setFormData] = useState({
    name: '',
    surname: '',
    email: user?.email || '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Split fullname into name and surname when user data loads
  useEffect(() => {
    if (user?.fullname) {
      console.log(user?.token);
      const nameParts = user.fullname.trim().split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      setFormData((prev) => ({
        ...prev,
        name: firstName,
        surname: lastName,
        email: user.email || '',
      }));
    }
  }, [user]);

  // Check if form data has changed
  const hasChanges = useMemo(() => {
    if (!user) return false;

    const currentFullname = `${formData.name} ${formData.surname}`.trim();
    const originalFullname = user.fullname?.trim() || '';

    return currentFullname !== originalFullname || formData.email !== user?.email;
  }, [formData, user]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (!formData.name.trim()) {
      Alert.alert('Erro', 'Nome é obrigatório');
      return;
    }

    if (!formData.surname.trim()) {
      Alert.alert('Erro', 'Apelido é obrigatório');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch(`${baseUrl}/users/me`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${user?.token}`,
        },
        body: JSON.stringify({
          data: {
            phone: user?.phone,
            name: formData.name.trim(),
            surname: formData.surname.trim(),
            email: formData.email,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao actualizar perfil');
      }

      console.log(response.status);
      console.log(response.body);

      // Refresh user data to get the latest information
      await refresh();

      Alert.alert('Sucesso', 'Perfil actualizado com sucesso', [{ text: 'OK', onPress: () => router.back() }]);
    } catch (error) {
      Alert.alert('Erro', 'Falha ao actualizar perfil');
      console.error('Error updating profile:', error);
    } finally {
      setIsSubmitting(false);
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
            A sua sessão expirou ou não está autenticado. Por favor, inicie sessão novamente.
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
            <Text style={styles.headerTitle}>Editar Perfil</Text>
            <View style={styles.iconButton} />
          </View>
        </View>

        <View style={styles.formSection}>
          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Feather name="user" size={20} color="#1fa2df" />
              <Text style={styles.inputLabel}>
                Nome <Text style={styles.required}>*</Text>
              </Text>
            </View>
            <TextInput
              style={styles.input}
              value={formData.name}
              onChangeText={(value) => handleChange('name', value)}
              placeholder="Digite seu nome"
              placeholderTextColor="#A8A8B3"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Feather name="user" size={20} color="#1fa2df" />
              <Text style={styles.inputLabel}>
                Apelido <Text style={styles.required}>*</Text>
              </Text>
            </View>
            <TextInput
              style={styles.input}
              value={formData.surname}
              onChangeText={(value) => handleChange('surname', value)}
              placeholder="Digite seu apelido"
              placeholderTextColor="#A8A8B3"
            />
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Feather name="phone" size={20} color="#1fa2df" />
              <Text style={styles.inputLabel}>Número de Telemóvel</Text>
            </View>
            <TextInput
              style={[styles.input, styles.inputDisabled]}
              value={user.phone}
              editable={false}
              placeholder="Número de telemóvel"
              placeholderTextColor="#A8A8B3"
            />
            <Text style={styles.inputHelper}>O número de telemóvel não pode ser alterado</Text>
          </View>

          <View style={styles.inputGroup}>
            <View style={styles.inputHeader}>
              <Feather name="mail" size={20} color="#1fa2df" />
              <Text style={styles.inputLabel}>Email</Text>
            </View>
            <TextInput
              style={styles.input}
              value={formData.email}
              onChangeText={(value) => handleChange('email', value)}
              placeholder="Digite seu email"
              placeholderTextColor="#A8A8B3"
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, (!hasChanges || isSubmitting) && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={!hasChanges || isSubmitting}
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFF" size="small" />
          ) : (
            <>
              <Text style={styles.saveButtonText}>Actualizar</Text>
            </>
          )}
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
    backgroundColor: '#202024',
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
  headerTitle: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
  },
  iconButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  formSection: {
    padding: 24,
    gap: 24,
  },
  inputGroup: {
    gap: 8,
  },
  inputHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  inputLabel: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '500',
  },
  required: {
    color: '#ff6b6b',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#202024',
    borderRadius: 8,
    padding: 16,
    color: '#FFF',
    fontSize: 14,
    marginLeft: 28,
  },
  inputDisabled: {
    opacity: 0.7,
    backgroundColor: '#1a1a1d',
  },
  inputHelper: {
    color: '#A8A8B3',
    fontSize: 12,
    marginLeft: 28,
    fontStyle: 'italic',
  },
  footer: {
    padding: 24,
    borderTopWidth: 1,
    borderTopColor: '#323238',
  },
  saveButton: {
    backgroundColor: '#1fa2df',
    padding: 16,
    borderRadius: 50,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  saveButtonDisabled: {
    backgroundColor: '#202024',
  },
  saveButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
