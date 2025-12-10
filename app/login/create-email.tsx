import React, { useEffect, useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  Modal,
  FlatList,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSetUserData } from '@/hooks/useAuth';
import DateTimePicker from '@react-native-community/datetimepicker';
import { baseUrl } from '@/services/api';

// Import data from JSON files
import MOZAMBIQUE_PROVINCES from '@/data/mozambique/provinces.json';
import MOZAMBIQUE_DISTRICTS_DATA from '@/data/mozambique/districts.json';
import ACADEMIC_INSTITUTIONS from '@/data/mozambique/academic-institutions.json';
import ACADEMIC_LEVELS from '@/data/mozambique/academic-levels.json';
import OCCUPATIONS from '@/data/mozambique/occupations.json';
import GENDER_OPTIONS from '@/data/mozambique/gender-options.json';

// Import validation utilities
import {
  validateEmail,
  validateFullName,
  validateMozambicanPhone,
  validateMozambicanID,
  splitFullName,
} from '@/utils/validation';
import { User } from '@/types/user';
import { navigateAfterLogin } from '@/util/onboarding';

// Type-safe districts object
const MOZAMBIQUE_DISTRICTS = MOZAMBIQUE_DISTRICTS_DATA as { [key: string]: string[] };

// Searchable Picker Component
interface SearchablePickerProps {
  label: string;
  value: string;
  options: string[];
  onSelect: (value: string) => void;
  placeholder: string;
  error?: string; // Added error prop
}

function SearchablePicker({ label, value, options, onSelect, placeholder, error }: SearchablePickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const filteredOptions = useMemo(() => {
    if (!searchQuery) return options;
    return options.filter((option) => option.toLowerCase().includes(searchQuery.toLowerCase()));
  }, [options, searchQuery]);

  return (
    <View style={styles.inputGroup}>
      <Text style={styles.inputLabel}>{label}</Text>
      <TouchableOpacity
        style={[styles.pickerButton, error ? styles.inputError : null]}
        onPress={() => setModalVisible(true)}
      >
        <Text style={[styles.pickerButtonText, !value && styles.placeholderText]}>{value || placeholder}</Text>
        <Ionicons name="chevron-down" size={20} color={error ? '#FF6B6B' : '#999'} />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

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
                  {value === item && <Ionicons name="checkmark" size={20} color="#2196F3" />}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
}

export default function CreateEmail() {
  // Account basics
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Profile fields
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalID, setNationalID] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [gender, setGender] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [occupation, setOccupation] = useState('');
  const [academicInstitution, setAcademicInstitution] = useState('');
  const [academicLevel, setAcademicLevel] = useState('');
  const [underageConsent, setUnderageConsent] = useState(false);

  const [loading, setLoading] = useState(false);
  const [globalError, setGlobalError] = useState<string | undefined>(undefined);

  // Field errors
  const [usernameError, setUsernameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [fullNameError, setFullNameError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [nationalIDError, setNationalIDError] = useState('');
  const [dobError, setDobError] = useState('');
  const [genderError, setGenderError] = useState('');
  const [occupationError, setOccupationError] = useState('');
  const [consentError, setConsentError] = useState('');

  const setUserData = useSetUserData();

  // Calculate max date (today)
  const maxDate = useMemo(() => new Date(), []);

  // Calculate the date 16 years ago (for underage check)
  const sixteenYearsAgo = useMemo(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 16);
    return date;
  }, []);

  // Check if user is under 16
  const isUnderage = useMemo(() => {
    if (!dateOfBirth) return false;
    const birthDate = new Date(dateOfBirth.getFullYear(), dateOfBirth.getMonth(), dateOfBirth.getDate());
    const cutoffDate = new Date(sixteenYearsAgo.getFullYear(), sixteenYearsAgo.getMonth(), sixteenYearsAgo.getDate());
    return birthDate > cutoffDate;
  }, [dateOfBirth, sixteenYearsAgo]);

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

  const handleRegister = async () => {
    setUsernameError('');
    setEmailError('');
    setPasswordError('');
    setFullNameError('');
    setPhoneError('');
    setNationalIDError('');
    setDobError('');
    setGenderError('');
    setOccupationError('');
    setConsentError('');
    setGlobalError(undefined);

    let isValid = true;

    // 2. Validate Fields
    if (!username.trim()) {
      setUsernameError('Nome de utilizador é obrigatório');
      isValid = false;
    }

    if (!validateEmail(email)) {
      setEmailError('Email inválido');
      isValid = false;
    }

    if (password.length < 6) {
      setPasswordError('A palavra-passe deve ter pelo menos 6 caracteres');
      isValid = false;
    }

    if (!validateFullName(fullName)) {
      setFullNameError('Insira pelo menos nome e apelido');
      isValid = false;
    }

    // Phone is optional, but if entered, must be valid
    let validatedPhone = phone;
    if (phone.trim()) {
      const phoneResult = validateMozambicanPhone(phone);
      if (!phoneResult) {
        setPhoneError('Número inválido. Ex: 841231231');
        isValid = false;
      } else {
        validatedPhone = phoneResult;
      }
    }

    if (!validateMozambicanID(nationalID)) {
      setNationalIDError('BI inválido (12 números + 1 letra)');
      isValid = false;
    }

    if (!dateOfBirth) {
      setDobError('Data de nascimento é obrigatória');
      isValid = false;
    }

    if (!gender) {
      setGenderError('Selecione o género');
      isValid = false;
    }

    if (!occupation) {
      setOccupationError('Selecione a ocupação');
      isValid = false;
    }

    if (isUnderage && !underageConsent) {
      setConsentError('Para menores de 16 anos, é necessário confirmar o consentimento');
      isValid = false;
    }

    if (!isValid) {
      // Stop here if validation fails. The UI will update with red borders/text.
      return;
    }

    // 3. Proceed with API call
    setLoading(true);
    try {
      const { name, middlename, surname } = splitFullName(fullName);

      // Format date to YYYY-MM-DD
      const formattedDate = dateOfBirth
        ? `${dateOfBirth.getFullYear()}-${String(dateOfBirth.getMonth() + 1).padStart(2, '0')}-${String(dateOfBirth.getDate()).padStart(2, '0')}`
        : '';

      const response = await fetch(`${baseUrl}/users`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            username,
            password,
            name,
            middlename: middlename || undefined,
            surname,
            email: email || undefined,
            phone: validatedPhone || undefined,
            nationalID,
            dateOfBirth: formattedDate,
            gender,
            province: province || undefined,
            district: district || undefined,
            occupation,
            academicInstitution: academicInstitution || undefined,
            academicLevel: academicLevel || undefined,
          },
        }),
      });

      if (response.status === 409) {
        setGlobalError('Já existe um utilizador registado com este email, telefone, BI ou nome de utilizador.');
        return;
      }

      if (response.status === 400) {
        const err = await response.json();
        setGlobalError(err?.error?.details?.message || 'Dados inválidos. Verifique os campos.');
        return;
      }

      if (!response.ok) {
        setGlobalError('Erro de conexão. Tente novamente.');
        return;
      }

      const data = await response.json();
      const { user, jwt } = data;

      const authUser: User = {
        ...user,
        token: jwt,
      };

      await setUserData.mutateAsync(authUser);
      await navigateAfterLogin(authUser.interests);
    } catch (e) {
      setGlobalError('Não foi possível processar o registo. Verifique a sua internet.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
      <View style={styles.topSection}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Image
            source={require('@/assets/images/maza-logo.png')}
            style={{ width: 129, height: 78, marginStart: 20 }}
            contentFit={'contain'}
          />
        </View>
        <View style={styles.titleSection}>
          <Text style={styles.headerText}>Registar</Text>
          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.push('/login/login-email')}>
              <Text style={styles.loginLink}>Fazer Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          {/* Username */}
          <View style={styles.inputGroup}>
            <Text style={[styles.inputLabel, { marginTop: 15 }]}>Nome de Utilizador</Text>
            <TextInput
              style={[styles.input, usernameError ? styles.inputError : null]}
              placeholder="username"
              placeholderTextColor="#666"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (usernameError) setUsernameError('');
              }}
              autoCapitalize="none"
            />
            {usernameError ? <Text style={styles.errorText}>{usernameError}</Text> : null}
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={[styles.input, emailError ? styles.inputError : null]}
              placeholderTextColor="#666"
              keyboardType="email-address"
              value={email}
              onChangeText={(text) => {
                setEmail(text);
                if (emailError) setEmailError('');
              }}
              autoCapitalize="none"
            />
            {emailError ? <Text style={styles.errorText}>{emailError}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Palavra-passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, passwordError ? styles.inputError : null]}
                placeholder="********"
                placeholderTextColor="#666"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome Completo</Text>
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
            />
            {fullNameError ? <Text style={styles.errorText}>{fullNameError}</Text> : null}
          </View>

          {/* Phone */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Número de Telemóvel (opcional)</Text>
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
            />
            {phoneError ? <Text style={styles.errorText}>{phoneError}</Text> : null}
          </View>

          {/* National ID */}
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
            />
            {nationalIDError ? <Text style={styles.errorText}>{nationalIDError}</Text> : null}
          </View>

          {/* Date of Birth */}
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
                  border: dobError ? '1px solid #FF6B6B' : 'none',
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
                    setDobError('');
                  }
                }}
              />
            ) : (
              <>
                <TouchableOpacity
                  style={[styles.pickerButton, dobError ? styles.inputError : null]}
                  onPress={() => setShowDatePicker(true)}
                >
                  <Text style={[styles.pickerButtonText, !dateOfBirth && styles.placeholderText]}>
                    {dateOfBirth
                      ? `${dateOfBirth.getDate()}/${dateOfBirth.getMonth() + 1}/${dateOfBirth.getFullYear()}`
                      : 'Selecionar data de nascimento'}
                  </Text>
                  <Ionicons name="calendar-outline" size={20} color={dobError ? '#FF6B6B' : '#999'} />
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
                        setDobError('');
                      }
                    }}
                    maximumDate={maxDate}
                    minimumDate={minDate}
                  />
                )}
              </>
            )}
            {dobError ? <Text style={styles.errorText}>{dobError}</Text> : null}
          </View>

          <SearchablePicker
            label="Género"
            value={gender}
            options={GENDER_OPTIONS}
            onSelect={(val) => {
              setGender(val);
              setGenderError('');
            }}
            placeholder="Selecionar género"
            error={genderError}
          />

          <SearchablePicker
            label="Província (opcional)"
            value={province}
            options={MOZAMBIQUE_PROVINCES}
            onSelect={(value) => {
              setProvince(value);
              setDistrict('');
            }}
            placeholder="Selecionar província"
          />

          {province && (
            <SearchablePicker
              label="Distrito (opcional)"
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
            onSelect={(val) => {
              setOccupation(val);
              setOccupationError('');
            }}
            placeholder="Selecionar ocupação"
            error={occupationError}
          />

          <SearchablePicker
            label="Instituição de Ensino (opcional)"
            value={academicInstitution}
            options={ACADEMIC_INSTITUTIONS}
            onSelect={setAcademicInstitution}
            placeholder="Selecionar instituição"
          />

          <SearchablePicker
            label="Nível Académico (opcional)"
            value={academicLevel}
            options={ACADEMIC_LEVELS}
            onSelect={setAcademicLevel}
            placeholder="Selecionar nível académico"
          />

          {isUnderage && (
            <View style={[styles.consentContainer, consentError ? styles.consentContainerError : null]}>
              <TouchableOpacity
                style={styles.consentRow}
                onPress={() => {
                  setUnderageConsent(!underageConsent);
                  if (consentError) setConsentError('');
                }}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.checkbox,
                    underageConsent && styles.checkboxChecked,
                    consentError && !underageConsent ? styles.checkboxError : null,
                  ]}
                >
                  {underageConsent && <Ionicons name="checkmark" size={16} color="#fff" />}
                </View>
                <Text style={styles.consentText}>
                  Estou a criar uma conta para um utilizador menor de 16 anos e confirmo que tenho autorização do
                  responsável legal para o fazer.
                </Text>
              </TouchableOpacity>
              {consentError ? <Text style={styles.consentErrorText}>{consentError}</Text> : null}
            </View>
          )}

          {globalError && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{globalError}</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.buttonContainer}>
          <Button
            text={loading ? 'A processar...' : 'Registar'}
            handle={handleRegister}
            disabled={loading}
            loading={loading}
          />
        </View>

        <View style={styles.textButtonContainer}>
          <TouchableOpacity onPress={() => router.push('/login/create-email')}>
            <Text style={styles.bottomLinkText}>Prefere usar número de telefone?</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E',
  },
  topSection: {
    backgroundColor: '#1E1E1E',
    paddingBottom: 20,
    marginBottom: 10,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  content: {
    flex: 1,
    gap: 24,
    backgroundColor: '#121212',
  },
  headerText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    width: 260,
  },
  loginContainer: {
    flexDirection: 'row',
    marginTop: 12,
  },
  loginText: {
    color: '#999999',
    fontSize: 14,
  },
  loginLink: {
    color: '#2196F3',
    fontSize: 14,
  },
  formContainer: {
    gap: 24,
    paddingHorizontal: 24,
    paddingBottom: 120,
  },
  inputGroup: {
    gap: 12,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  input: {
    height: 48,
    backgroundColor: '#252525',
    borderRadius: 24,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#FFFFFF',
    borderWidth: 1,
    borderColor: 'transparent',
  },
  inputError: {
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  errorContainer: {
    backgroundColor: '#3D1E1E',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  consentContainer: {
    backgroundColor: '#1E3A5F',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#2196F3',
  },
  consentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#2196F3',
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#2196F3',
  },
  consentText: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 20,
  },
  consentContainerError: {
    borderColor: '#FF6B6B',
    backgroundColor: '#3D1E2A',
  },
  checkboxError: {
    borderColor: '#FF6B6B',
  },
  consentErrorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 12,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 48,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 14,
    padding: 4,
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
    borderWidth: 1,
    borderColor: 'transparent',
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
  buttonContainer: {
    paddingHorizontal: 24,
  },
  textButtonContainer: {
    alignItems: 'center',
    marginTop: 16,
    paddingHorizontal: 24,
  },
  bottomLinkText: {
    color: '#999999',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 8,
  },
  backButton: {
    padding: 8,
    borderStyle: 'solid',
    borderColor: '#b3b3b3',
    borderWidth: 0.5,
    borderRadius: 50,
  },
});
