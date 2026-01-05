import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Feather, Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import useUser from '@/hooks/useUser';
import { baseUrl } from '@/services/api';
import { useTheme } from '@/contexts/ThemeContext';
import Colors from '@/constants/Colors';
import Toast from '@/components/Toast';
import { useToast } from '@/hooks/useToast';
import {
  validateEmail,
  validateFullName,
  validateMozambicanPhone,
  validateMozambicanID,
  splitFullName,
} from '@/utils/validation';
import CustomDatePicker, { MONTHS } from '@/app/components/CustomDatePicker';

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
    username: string; // Added username
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
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((option) => option.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchQuery]);

  const themedPickerStyles = useMemo(
    () =>
      StyleSheet.create({
        inputGroup: {
          gap: 12,
        },
        inputLabel: {
          color: colors.text,
          fontSize: 14,
          fontWeight: '500',
        },
        pickerButton: {
          height: 48,
          backgroundColor: colors.inputBackground,
          borderRadius: 24,
          paddingHorizontal: 16,
          fontSize: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        pickerButtonText: {
          fontSize: 16,
          color: colors.text,
        },
        placeholderText: {
          color: colors.textMuted,
        },
        modalOverlay: {
          flex: 1,
          backgroundColor: 'rgba(0, 0, 0, 0.7)',
          justifyContent: 'flex-end',
        },
        modalContent: {
          backgroundColor: colors.cardBackground,
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
          borderBottomColor: colors.border,
        },
        modalTitle: {
          fontSize: 18,
          fontWeight: '600',
          color: colors.text,
        },
        searchInput: {
          height: 48,
          backgroundColor: colors.inputBackground,
          borderRadius: 12,
          paddingHorizontal: 16,
          fontSize: 16,
          color: colors.text,
          margin: 16,
        },
        optionItem: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
          paddingVertical: 16,
          paddingHorizontal: 20,
          borderBottomWidth: 1,
          borderBottomColor: colors.border,
        },
        optionText: {
          fontSize: 16,
          color: colors.text,
        },
      }),
    [colors]
  );

  return (
    <View style={themedPickerStyles.inputGroup}>
      <Text style={themedPickerStyles.inputLabel}>{label}</Text>
      <TouchableOpacity style={themedPickerStyles.pickerButton} onPress={() => setModalVisible(true)}>
        <Text style={[themedPickerStyles.pickerButtonText, !value && themedPickerStyles.placeholderText]}>
          {value || placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.textMuted} />
      </TouchableOpacity>

      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={themedPickerStyles.modalOverlay}>
          <View style={themedPickerStyles.modalContent}>
            <View style={themedPickerStyles.modalHeader}>
              <Text style={themedPickerStyles.modalTitle}>{label}</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <TextInput
              style={themedPickerStyles.searchInput}
              placeholder="Pesquisar..."
              placeholderTextColor={colors.textMuted}
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCapitalize="none"
            />

            <FlatList
              data={filteredOptions}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={themedPickerStyles.optionItem}
                  onPress={() => {
                    onSelect(item);
                    setModalVisible(false);
                    setSearchQuery('');
                  }}
                >
                  <Text style={themedPickerStyles.optionText}>{item}</Text>
                  {value === item && <Ionicons name="checkmark" size={20} color={colors.primary} />}
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
  const { isDark } = useTheme();
  const colors = isDark ? Colors.dark : Colors.light;
  const { toast, config, showSuccess, showError, hideToast } = useToast();

  // Form states
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState(''); // Added username state
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
  const [usernameError, setUsernameError] = useState(''); // Added username error
  const [phoneError, setPhoneError] = useState('');
  const [nationalIDError, setNationalIDError] = useState('');
  const [formError, setFormError] = useState<string | undefined>(undefined);

  // Load user data into form
  useEffect(() => {
    if (user) {
      setFullName(`${user.name || ''} ${user.middlename || ''} ${user.surname || ''}`.trim());
      setUsername(user.username || '');
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

  // Calculate max date (6 years ago from today)
  const maxDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 6);
    return date;
  }, []);

  // Calculate min date (150 years ago)
  const minDate = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 150);
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
    onSuccess: async () => {
      // Refresh user data
      await refetch();

      // Show success toast and navigate back
      showSuccess('Perfil actualizado com sucesso');

      // Navigate back after a short delay to let the toast show
      setTimeout(() => {
        router.back();
      }, 1500);
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
            showError('Dados inválidos. Verifique os campos e tente novamente.');
            break;
          case 401:
            setFormError('Sessão expirada. Por favor, faça login novamente.');
            showError('Sessão expirada. Por favor, faça login novamente.');
            setTimeout(() => router.replace('/login'), 2000);
            break;
          case 403:
            setFormError('Acesso negado.');
            showError('Você não tem permissão para actualizar este perfil.');
            break;
          case 404:
            setFormError('Utilizador não encontrado.');
            showError('Utilizador não encontrado.');
            break;
          case 409:
            // Check if it's specifically a username conflict based on message, otherwise generic
            setFormError(errorData?.error?.message || 'Email, telefone ou nome de utilizador já em uso.');
            showError('Email, telefone ou nome de utilizador já está em uso.');
            break;
          case 429:
            setFormError('Demasiadas tentativas. Por favor, aguarde alguns minutos.');
            showError('Demasiadas tentativas. Por favor, aguarde alguns minutos.');
            break;
          case 500:
            setFormError('Erro interno do servidor. Por favor, tente novamente mais tarde.');
            showError('Servidor temporariamente indisponível. Tente novamente.');
            break;
          case 502:
          case 503:
          case 504:
            setFormError('Servidor temporariamente indisponível. Tente novamente em alguns instantes.');
            showError('Servidor temporariamente indisponível. Tente novamente.');
            break;
          default:
            setFormError('Ocorreu um erro ao actualizar o perfil. Por favor, tente novamente.');
            showError('Falha ao actualizar perfil. Tente novamente.');
        }
      } else if (error.request) {
        // Network error
        setFormError('Erro de conexão. Verifique sua internet.');
        showError('Erro de conexão. Verifique sua internet.');
      } else {
        setFormError('Não foi possível actualizar o perfil. Por favor, tente novamente.');
        showError('Falha ao actualizar perfil.');
      }
    },
  });

  const handleSubmit = async () => {
    // Clear previous errors
    setEmailError('');
    setFullNameError('');
    setUsernameError('');
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

    // Validate Username
    if (!username || username.trim().length < 3) {
      setUsernameError('Nome de utilizador deve ter pelo menos 3 caracteres');
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
    if (!fullName || !gender || !occupation || !username) {
      showError('Por favor, preencha todos os campos obrigatórios');
      return;
    }

    const { name, middlename, surname } = splitFullName(fullName);

    // Format date to YYYY-MM-DD
    const formattedDate = dateOfBirth
      ? `${dateOfBirth.getFullYear()}-${String(dateOfBirth.getMonth() + 1).padStart(2, '0')}-${String(dateOfBirth.getDate()).padStart(2, '0')}`
      : '';

    // Execute update mutation
    updateProfileMutation.mutate({
      username: username.trim(),
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

  const themedStyles = useMemo(
    () =>
      StyleSheet.create({
        container: {
          flex: 1,
          backgroundColor: colors.background,
        },
        loadingContainer: {
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
        },
        errorContainer: {
          flex: 1,
          backgroundColor: colors.background,
          justifyContent: 'center',
          alignItems: 'center',
          padding: 24,
        },
        errorContent: {
          width: '100%',
          maxWidth: 320,
          alignItems: 'center',
          backgroundColor: colors.cardBackground,
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
          color: colors.text,
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
        errorDescriptionText: {
          color: colors.textSecondary,
          fontSize: 16,
          textAlign: 'center',
          marginBottom: 24,
          lineHeight: 24,
        },
        loginButton: {
          backgroundColor: colors.primary,
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
          backgroundColor: colors.cardBackground,
        },
        headerActions: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        },
        headerTitle: {
          color: colors.text,
          fontSize: 20,
          fontWeight: '600',
        },
        iconButton: {
          width: 40,
          height: 40,
          borderRadius: 20,
          backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
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
          color: colors.text,
          fontSize: 14,
          fontWeight: '500',
        },
        input: {
          height: 48,
          backgroundColor: colors.inputBackground,
          borderRadius: 24,
          paddingHorizontal: 16,
          fontSize: 16,
          color: colors.text,
        },
        inputError: {
          borderWidth: 1,
          borderColor: '#FF6B6B',
        },
        pickerButton: {
          height: 48,
          backgroundColor: colors.inputBackground,
          borderRadius: 24,
          paddingHorizontal: 16,
          fontSize: 16,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
        pickerButtonText: {
          fontSize: 16,
          color: colors.text,
        },
        placeholderText: {
          color: colors.textMuted,
        },
        footer: {
          padding: 24,
          borderTopWidth: 1,
          borderTopColor: colors.border,
        },
        saveButton: {
          backgroundColor: colors.primary,
          padding: 16,
          borderRadius: 50,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
        },
        saveButtonDisabled: {
          backgroundColor: isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.1)',
        },
        saveButtonText: {
          color: '#FFF',
          fontSize: 16,
          fontWeight: '600',
        },
        saveButtonTextDisabled: {
          color: isDark ? '#FFF' : colors.text,
        },
        formErrorContainer: {
          padding: 12,
          backgroundColor: 'rgba(255, 107, 107, 0.1)',
          borderRadius: 8,
        },
      }),
    [colors, isDark]
  );

  if (isLoading) {
    return (
      <View style={themedStyles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  if (error || !user) {
    return (
      <View style={themedStyles.errorContainer}>
        <View style={themedStyles.errorContent}>
          <View style={themedStyles.errorIconContainer}>
            <Feather name="user-x" size={48} color={colors.primary} />
          </View>
          <Text style={themedStyles.errorTitle}>Sessão Expirada</Text>
          <Text style={themedStyles.errorDescriptionText}>
            A sua sessão expirou ou não está autenticado. Por favor, inicie sessão novamente.
          </Text>
          <TouchableOpacity style={themedStyles.loginButton} onPress={() => router.push('/login')}>
            <Feather name="log-in" size={20} color="#FFF" style={themedStyles.loginButtonIcon} />
            <Text style={themedStyles.loginButtonText}>Iniciar Sessão</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={themedStyles.container} edges={['top', 'bottom']}>
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
        duration={config.duration}
        position={config.position}
        showIcon={config.showIcon}
      />
      <View style={themedStyles.header}>
        <View style={themedStyles.headerActions}>
          <TouchableOpacity style={themedStyles.iconButton} onPress={() => router.back()}>
            <Feather name="chevron-left" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={themedStyles.headerTitle}>Editar Perfil</Text>
          <View style={themedStyles.iconButton} />
        </View>
      </View>

      <ScrollView style={themedStyles.scrollView} contentContainerStyle={themedStyles.formContainer}>
        <View style={themedStyles.inputGroup}>
          <Text style={themedStyles.inputLabel}>Nome Completo</Text>
          <TextInput
            style={[themedStyles.input, fullNameError ? themedStyles.inputError : null]}
            placeholder="João Manuel António"
            placeholderTextColor={colors.textMuted}
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              if (fullNameError) setFullNameError('');
            }}
            autoCapitalize="words"
            editable={!isSubmitting}
          />
          {fullNameError ? <Text style={themedStyles.errorText}>{fullNameError}</Text> : null}
        </View>

        {/* Username Field */}
        <View style={themedStyles.inputGroup}>
          <Text style={themedStyles.inputLabel}>Nome de Utilizador</Text>
          <TextInput
            style={[themedStyles.input, usernameError ? themedStyles.inputError : null]}
            placeholder="joao.antonio"
            placeholderTextColor={colors.textMuted}
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              if (usernameError) setUsernameError('');
            }}
            autoCapitalize="none"
            editable={!isSubmitting}
          />
          {usernameError ? <Text style={themedStyles.errorText}>{usernameError}</Text> : null}
        </View>

        <View style={themedStyles.inputGroup}>
          <Text style={themedStyles.inputLabel}>Número de Telemóvel</Text>
          <TextInput
            style={[themedStyles.input, phoneError ? themedStyles.inputError : null]}
            placeholder="+258821231231"
            placeholderTextColor={colors.textMuted}
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              if (phoneError) setPhoneError('');
            }}
            autoCapitalize="none"
            editable={!isSubmitting}
          />
          {phoneError ? <Text style={themedStyles.errorText}>{phoneError}</Text> : null}
        </View>

        <View style={themedStyles.inputGroup}>
          <Text style={themedStyles.inputLabel}>Email</Text>
          <TextInput
            style={[themedStyles.input, emailError ? themedStyles.inputError : null]}
            placeholder="email@exemplo.com"
            placeholderTextColor={colors.textMuted}
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              if (emailError) setEmailError('');
            }}
            autoCapitalize="none"
            editable={!isSubmitting}
          />
          {emailError ? <Text style={themedStyles.errorText}>{emailError}</Text> : null}
        </View>

        <View style={themedStyles.inputGroup}>
          <Text style={themedStyles.inputLabel}>Bilhete de Identidade</Text>
          <TextInput
            style={[themedStyles.input, nationalIDError ? themedStyles.inputError : null]}
            placeholder="110100987331S"
            placeholderTextColor={colors.textMuted}
            value={nationalID}
            onChangeText={(text) => {
              setNationalID(text);
              if (nationalIDError) setNationalIDError('');
            }}
            autoCapitalize="characters"
            maxLength={13}
            editable={!isSubmitting}
          />
          {nationalIDError ? <Text style={themedStyles.errorText}>{nationalIDError}</Text> : null}
        </View>

        <View style={themedStyles.inputGroup}>
          <Text style={themedStyles.inputLabel}>Data de Nascimento</Text>
          {Platform.OS === 'web' ? (
            <input
              type="date"
              style={{
                height: 48,
                backgroundColor: colors.inputBackground,
                borderRadius: 24,
                paddingLeft: 16,
                paddingRight: 16,
                fontSize: 16,
                color: colors.text,
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
            <TouchableOpacity
              style={themedStyles.pickerButton}
              onPress={() => setShowDatePicker(true)}
              disabled={isSubmitting}
            >
              <Text style={[themedStyles.pickerButtonText, !dateOfBirth && themedStyles.placeholderText]}>
                {dateOfBirth
                  ? `${String(dateOfBirth.getDate()).padStart(2, '0')} de ${MONTHS[dateOfBirth.getMonth()]} de ${dateOfBirth.getFullYear()}`
                  : 'Selecionar data'}
              </Text>
              <Ionicons name="calendar-outline" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        {/* Custom Date Picker */}
        <CustomDatePicker
          value={dateOfBirth}
          onChange={setDateOfBirth}
          minDate={minDate}
          maxDate={maxDate}
          visible={showDatePicker}
          onClose={() => setShowDatePicker(false)}
        />

        <SearchablePicker
          label="Género"
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
          label="Ocupação"
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

        {formError ? (
          <View style={themedStyles.formErrorContainer}>
            <Text style={themedStyles.errorText}>{formError}</Text>
          </View>
        ) : null}
      </ScrollView>

      <View style={themedStyles.footer}>
        <TouchableOpacity
          style={[themedStyles.saveButton, isSubmitting && themedStyles.saveButtonDisabled]}
          onPress={handleSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <ActivityIndicator color={isDark ? '#FFF' : colors.text} size="small" />
              <Text style={[themedStyles.saveButtonText, themedStyles.saveButtonTextDisabled]}>A actualizar...</Text>
            </>
          ) : (
            <Text style={themedStyles.saveButtonText}>Actualizar Perfil</Text>
          )}
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
