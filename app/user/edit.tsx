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
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';
import useUser from '@/hooks/useUser';
import { baseUrl } from '@/services/api';
import {
  validateEmail,
  validateFullName,
  validateMozambicanPhone,
  validateMozambicanID,
  splitFullName,
} from '@/utils/validation';

// Import data from JSON files
import MOZAMBIQUE_PROVINCES from '@/data/mozambique/provinces.json';
import MOZAMBIQUE_DISTRICTS_DATA from '@/data/mozambique/districts.json';
import ACADEMIC_INSTITUTIONS from '@/data/mozambique/academic-institutions.json';
import ACADEMIC_LEVELS from '@/data/mozambique/academic-levels.json';
import OCCUPATIONS from '@/data/mozambique/occupations.json';
import GENDER_OPTIONS from '@/data/mozambique/gender-options.json';

// Type-safe districts object
const MOZAMBIQUE_DISTRICTS = MOZAMBIQUE_DISTRICTS_DATA as { [key: string]: string[] };

// Types
interface UpdateUserResponse {
  success: boolean;
  message: string;
  user: {
    id: number;
    documentId: string;
    email: string;
    phone: string;
    name: string;
    surname: string;
    fullname: string;
    yoma_id: string | null;
  };
}

interface ErrorResponse {
  error?: {
    message?: string;
    details?: {
      message?: string;
    };
  };
}

// Searchable Picker Component
interface SearchablePickerProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  placeholder: string;
}

function SearchablePicker({ label, value, options, onSelect, placeholder }: SearchablePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((option) => option.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchQuery]);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity style={styles.pickerButton} onPress={() => setModalVisible(true)}>
        <Text style={[styles.pickerButtonText, !value && styles.placeholderText]}>{value || placeholder}</Text>
        <Ionicons name="chevron-down" size={20} color="#999" />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            <TextInput
              style={styles.searchInput}
              placeholder="Pesquisar..."
              placeholderTextColor="#666"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.optionItem}
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <Text style={styles.optionText}>{item}</Text>
                  {value === item && <Ionicons name="checkmark" size={20} color="#1fa2df" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function EditProfileScreen() {
  const { data: user, isLoading, error, refetch } = useUser();

  // Form states
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [nationalID, setNationalID] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [occupation, setOccupation] = useState('');
  const [academicInstitution, setAcademicInstitution] = useState('');
  const [academicLevel, setAcademicLevel] = useState('');

  // Field errors
  const [emailError, setEmailError] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [nationalIDError, setNationalIDError] = useState('');
  const [formError, setFormError] = useState<string | undefined>(undefined);

  // Load user data into form
  useEffect(() => {
    if (user) {
      setFullName(`${user.name || ''} ${user.middlename || ''} ${user.surname || ''}`.trim());
      setPhone(user.phone || '');
      setEmail(user.email || '');
      setNationalID(user.nationalID || '');
      setGender(user.gender || '');
      setProvince(user.province || '');
      setDistrict(user.district || '');
      setOccupation(user.occupation || '');
      setAcademicInstitution(user.academicInstitution || '');
      setAcademicLevel(user.academicLevel || '');

      // Parse date of birth
      if (user.dateOfBirth) {
        const [year, month, day] = user.dateOfBirth.split('-').map(Number);
        setDateOfBirth(new Date(year, month - 1, day));
      }
    }
  }, [user]);

  // Calculate max date (16 years ago from today)
  const maxDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 16);
    return date;
  }, []);

  // Calculate min date (100 years ago)
  const minDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 100);
    return date;
  }, []);

  // Get available districts based on selected province
  const availableDistricts = useMemo(() => {
    return province ? MOZAMBIQUE_DISTRICTS[province] || [] : [];
  }, [province]);

  // Update district when province changes
  useEffect(() => {
    if (province && district) {
      const districts = MOZAMBIQUE_DISTRICTS[province] || [];
      if (!districts.includes(district)) {
        setDistrict('');
      }
    }
  }, [province, district]);

  // Update user profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await axios.put<UpdateUserResponse>(
        `${baseUrl}/users/me`,
        { data },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${user?.token}`,
          },
        }
      );
      return response.data;
    },
    onSuccess: async (data) => {
      // Refresh user data
      await refetch();

      // Show success message and navigate back
      Alert.alert('Sucesso', 'Perfil actualizado com sucesso', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);

      // Automatically navigate back after showing the alert
      setTimeout(() => {
        router.back();
      }, 100);
    },
    onError: (error: AxiosError<ErrorResponse>) => {
      console.error('Update profile error:', error);

      // Handle specific HTTP status codes
      if (error.response) {
        const status = error.response.status;
        const errorData = error.response.data;

        switch (status) {
          case 400:
            setFormError(errorData?.error?.message || 'Pedido inválido. Verifique os dados inseridos.');
            Alert.alert('Erro', 'Dados inválidos. Verifique os campos e tente novamente.');
            break;
          case 401:
            setFormError('Sessão expirada. Por favor, faça login novamente.');
            Alert.alert('Sessão Expirada', 'Por favor, faça login novamente.', [
              { text: 'OK', onPress: () => router.replace('/login') },
            ]);
            break;
          case 403:
            setFormError('Acesso negado.');
            Alert.alert('Erro', 'Você não tem permissão para actualizar este perfil.');
            break;
          case 404:
            setFormError('Utilizador não encontrado.');
            Alert.alert('Erro', 'Utilizador não encontrado.');
            break;
          case 409:
            setFormError(errorData?.error?.message || 'Email ou telefone já em uso.');
            Alert.alert('Erro', 'Email ou telefone já está em uso por outra conta.');
            break;
          case 429:
            setFormError('Demasiadas tentativas. Por favor, aguarde alguns minutos.');
            Alert.alert('Erro', 'Demasiadas tentativas. Por favor, aguarde alguns minutos.');
            break;
          case 500:
            setFormError('Erro interno do servidor. Por favor, tente novamente mais tarde.');
            Alert.alert(
              'Erro do Servidor',
              'O servidor está temporariamente indisponível. Por favor, tente novamente em alguns instantes.'
            );
            break;
          case 502:
          case 503:
          case 504:
            setFormError('Servidor temporariamente indisponível. Tente novamente em alguns instantes.');
            Alert.alert('Erro', 'Servidor temporariamente indisponível. Tente novamente em alguns instantes.');
            break;
          default:
            setFormError('Ocorreu um erro ao actualizar o perfil. Por favor, tente novamente.');
            Alert.alert('Erro', 'Falha ao actualizar perfil. Tente novamente.');
        }
      } else if (error.request) {
        // Network error
        setFormError('Erro de conexão. Verifique sua internet.');
        Alert.alert(
          'Erro de Conexão',
          'Não foi possível conectar ao servidor. Verifique sua conexão de internet e tente novamente.'
        );
      } else {
        setFormError('Não foi possível actualizar o perfil. Por favor, tente novamente.');
        Alert.alert('Erro', 'Falha ao actualizar perfil.');
      }
    },
  });

  const handleSubmit = async () => {
    // Clear previous errors
    setEmailError('');
    setFullNameError('');
    setPhoneError('');
    setNationalIDError('');
    setFormError(undefined);

    // Validate email
    if (email && !validateEmail(email)) {
      setEmailError('Email inválido');
      return;
    }

    // Validate full name
    if (!validateFullName(fullName)) {
      setFullNameError('Nome completo deve ter pelo menos duas partes (nome e apelido)');
      return;
    }

    // Validate phone if provided
    let validatedPhone = phone;
    if (phone.trim()) {
      const phoneResult = validateMozambicanPhone(phone);
      if (!phoneResult) {
        setPhoneError('Número de telefone moçambicano inválido. Formato: +258821231231 ou 821231231');
        return;
      }
      validatedPhone = phoneResult;
    }

    // Validate national ID
    if (nationalID && !validateMozambicanID(nationalID)) {
      setNationalIDError('Bilhete de identidade inválido. Formato: 12 dígitos + 1 letra (ex: 110100987331S)');
      return;
    }

    // Basic validations for mandatory fields
    if (!fullName || !gender || !occupation) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const { name, middlename, surname } = splitFullName(fullName);

    // Format date to YYYY-MM-DD
    const formattedDate = dateOfBirth
      ? `${dateOfBirth.getFullYear()}-${String(dateOfBirth.getMonth() + 1).padStart(2, '0')}-${String(dateOfBirth.getDate()).padStart(2, '0')}`
      : '';

    // Execute update mutation
    updateProfileMutation.mutate({
      name,
      middlename: middlename || undefined,
      surname,
      email: email || undefined,
      phone: validatedPhone || undefined,
      nationalID: nationalID || undefined,
      dateOfBirth: formattedDate || undefined,
      gender,
      province: province || undefined,
      district: district || undefined,
      occupation,
      academicInstitution: academicInstitution || undefined,
      academicLevel: academicLevel || undefined,
    });
  };

  const isSubmitting = updateProfileMutation.isPending;

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
      <View style={styles.header}>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.iconButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={24} color="#FFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Editar Perfil</Text>
          <View style={styles.iconButton} />
        </View>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.formContainer}>
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>
            Nome Completo <Text style={styles.required}>*</Text>
          </Text>
          <TextInput
            style={[styles.input, fullNameError ? styles.inputError : null]}
            placeholder="João Manuel António"
            placeholderTextColor="#666"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (fullNameError) setFullNameError('');
            }}
            autoCapitalize="words"
            editable={!isSubmitting}
          />
          {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Número de Telemóvel</Text>
          <TextInput
            style={[styles.input, phoneError ? styles.inputError : null]}
            placeholder="+258821231231"
            placeholderTextColor="#666"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              if (phoneError) setPhoneError('');
            }}
            autoCapitalize="none"
            editable={!isSubmitting}
          />
          {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Email</Text>
          <TextInput
            style={[styles.input, emailError ? styles.inputError : null]}
            placeholder="email@exemplo.com"
            placeholderTextColor="#666"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            autoCapitalize="none"
            editable={!isSubmitting}
          />
          {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Bilhete de Identidade</Text>
          <TextInput
            style={[styles.input, nationalIDError ? styles.inputError : null]}
            placeholder="110100987331S"
            placeholderTextColor="#666"
            value={nationalID}
            onChangeText={(text) => {
              setNationalID(text);
              if (nationalIDError) setNationalIDError('');
            }}
            autoCapitalize="characters"
            maxLength={13}
            editable={!isSubmitting}
          />
          {nationalIDError ? <Text style={styles.errorText}>{nationalIDError}</Text> : null}
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Data de Nascimento</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              style={{
                height: 48,
                backgroundColor: '#252525',
                borderRadius: 24,
                paddingLeft: 16,
                paddingRight: 16,
                fontSize: 16,
                color: '#FFFFFF',
                border: 'none',
                outline: 'none',
                fontFamily: 'inherit',
              }}
              value={
                dateOfBirth
                  ? `${dateOfBirth.getFullYear()}-${String(dateOfBirth.getMonth() + 1).padStart(2, '0')}-${String(dateOfBirth.getDate()).padStart(2, '0')}`
                  : ''
              }
              max={`${maxDate.getFullYear()}-${String(maxDate.getMonth() + 1).padStart(2, '0')}-${String(maxDate.getDate()).padStart(2, '0')}`}
              min={`${minDate.getFullYear()}-${String(minDate.getMonth() + 1).padStart(2, '0')}-${String(minDate.getDate()).padStart(2, '0')}`}
              onChange={(e: any) => {
                const value = e.target.value;
                if (value) {
                  const [year, month, day] = value.split('-').map(Number);
                  setDateOfBirth(new Date(year, month - 1, day));
                }
              }}
            />
          ) : (
            <>
              <TouchableOpacity
                style={styles.pickerButton}
                onPress={() => setShowDatePicker(true)}
                disabled={isSubmitting}
              >
                <Text style={[styles.pickerButtonText, !dateOfBirth && styles.placeholderText]}>
                  {dateOfBirth
                    ? `${dateOfBirth.getDate()}/${dateOfBirth.getMonth() + 1}/${dateOfBirth.getFullYear()}`
                    : 'Selecionar data'}
                </Text>
                <Ionicons name="calendar-outline" size={20} color="#999" />
              </TouchableOpacity>
              {showDatePicker && (
                <DateTimePicker
                  value={dateOfBirth || maxDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event: any, selectedDate?: Date) => {
                    setShowDatePicker(Platform.OS === 'ios');
                    if (selectedDate) {
                      setDateOfBirth(selectedDate);
                    }
                  }}
                  maximumDate={maxDate}
                  minimumDate={minDate}
                />
              )}
            </>
          )}
        </View>

        <SearchablePicker
          label="Género *"
          value={gender}
          options={GENDER_OPTIONS}
          onSelect={setGender}
          placeholder="Selecionar género"
        />

        <SearchablePicker
          label="Província"
          value={province}
          options={MOZAMBIQUE_PROVINCES}
          onSelect={(value) => {
            setProvince(value);
            setDistrict(''); // Reset district when province changes
          }}
          placeholder="Selecionar província"
        />

        {province && (
          <SearchablePicker
            label="Distrito"
            value={district}
            options={availableDistricts}
            onSelect={setDistrict}
            placeholder="Selecionar distrito"
          />
        )}

        <SearchablePicker
          label="Ocupação *"
          value={occupation}
          options={OCCUPATIONS}
          onSelect={setOccupation}
          placeholder="Selecionar ocupação"
        />

        <SearchablePicker
          label="Instituição de Ensino"
          value={academicInstitution}
          options={ACADEMIC_INSTITUTIONS}
          onSelect={setAcademicInstitution}
          placeholder="Selecionar instituição"
        />

        <SearchablePicker
          label="Nível Académico"
          value={academicLevel}
          options={ACADEMIC_LEVELS}
          onSelect={setAcademicLevel}
          placeholder="Selecionar nível académico"
        />

        {formError && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{formError}</Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, isSubmitting && styles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator color="#FFF" size="small" />
              <Text style={styles.saveButtonText}>A actualizar...</Text>
            </>
          ) : (
            <Text style={styles.saveButtonText}>Actualizar Perfil</Text>
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
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
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
  formContainer: {
    padding: 24,
    gap: 24,
    paddingBottom: 32,
  },
  inputGroup: {
    gap: 12,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  required: {
    color: '#ff6b6b',
    fontSize: 14,
    fontWeight: '600',
  },
  input: {
    height: 48,
    backgroundColor: '#252525',
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  pickerButton: {
    height: 48,
    backgroundColor: '#252525',
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
  },
  placeholderText: {
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1E1E1E',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
    paddingBottom: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  searchInput: {
    height: 48,
    backgroundColor: '#252525',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
    margin: 16,
  },
  optionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#252525',
  },
  optionText: {
    fontSize: 16,
    color: '#FFFFFF',
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
