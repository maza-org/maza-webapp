import React, { useEffect, useState, useMemo } from 'react';
import { ScrollView, View, StyleSheet, Text } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { useCreateAccount } from '@/app/hooks/useAuthMutations';
import AuthContainer, { AuthTopSection, AuthContent } from '@/app/components/auth/AuthContainer';
import AuthHeader from '@/app/components/auth/AuthHeader';
import AuthTitle from '@/app/components/auth/AuthTitle';
import FormInput from '@/app/components/auth/FormInput';
import SearchablePicker from '@/app/components/auth/SearchablePicker';
import DatePicker from '@/app/components/auth/DatePicker';
import ConsentCheckbox from '@/app/components/auth/ConsentCheckbox';
import AuthFooter from '@/app/components/auth/AuthFooter';

import MOZAMBIQUE_PROVINCES from '@/data/mozambique/provinces.json';
import MOZAMBIQUE_DISTRICTS_DATA from '@/data/mozambique/districts.json';
import ACADEMIC_INSTITUTIONS from '@/data/mozambique/academic-institutions.json';
import ACADEMIC_LEVELS from '@/data/mozambique/academic-levels.json';
import OCCUPATIONS from '@/data/mozambique/occupations.json';
import GENDER_OPTIONS from '@/data/mozambique/gender-options.json';
import {
  validateEmail,
  validateFullName,
  validateMozambicanPhone,
  validateMozambicanID,
  splitFullName,
} from '@/utils/validation';

const MOZAMBIQUE_DISTRICTS = MOZAMBIQUE_DISTRICTS_DATA as { [key: string]: string[] };

export default function CreateEmail() {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [nationalID, setNationalID] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState<Date>(() => {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 16);
    return date;
  });
  const [gender, setGender] = useState('');
  const [province, setProvince] = useState('');
  const [district, setDistrict] = useState('');
  const [occupation, setOccupation] = useState('');
  const [academicInstitution, setAcademicInstitution] = useState('');
  const [academicLevel, setAcademicLevel] = useState('');
  const [underageConsent, setUnderageConsent] = useState(false);

  const [errors, setErrors] = useState<Record<string, string>>({});

  const createAccountMutation = useCreateAccount();

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

  const handleRegister = () => {
    const newErrors: Record<string, string> = {};

    if (!username.trim()) newErrors.username = 'Nome de utilizador é obrigatório';
    if (!validateEmail(email)) newErrors.email = 'Email inválido';
    if (password.length < 6) newErrors.password = 'A palavra-passe deve ter pelo menos 6 caracteres';
    if (!validateFullName(fullName)) newErrors.fullName = 'Insira pelo menos nome e apelido';
    if (!validateMozambicanID(nationalID)) newErrors.nationalID = 'BI inválido (12 números + 1 letra)';
    if (!gender) newErrors.gender = 'Selecione o género';
    if (!occupation) newErrors.occupation = 'Selecione a ocupação';
    if (isUnderage && !underageConsent)
      newErrors.consent = 'Para menores de 16 anos, é necessário confirmar o consentimento';

    let validatedPhone = phone;
    if (phone.trim()) {
      const phoneResult = validateMozambicanPhone(phone);
      if (!phoneResult) {
        newErrors.phone = 'Número inválido. Ex: 841231231';
      } else {
        validatedPhone = phoneResult;
      }
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) return;

    const { name, middlename, surname } = splitFullName(fullName);
    const formattedDate = `${dateOfBirth.getFullYear()}-${String(dateOfBirth.getMonth() + 1).padStart(2, '0')}-${String(dateOfBirth.getDate()).padStart(2, '0')}`;

    createAccountMutation.mutate(
      {
        username,
        password,
        name,
        middlename: middlename || '',
        surname,
        email,
        phone: validatedPhone || '',
        nationalID,
        dateOfBirth: formattedDate,
        gender,
        province: province || '',
        district: district || '',
        occupation,
        academicInstitution: academicInstitution || '',
        academicLevel: academicLevel || '',
      },
      {
        onError: (error) => {
          setErrors({ general: error.message });
        },
      }
    );
  };

  const clearError = (field: string) => {
    setErrors((prev) => ({ ...prev, [field]: '' }));
  };

  return (
    <AuthContainer>
      <AuthTopSection>
        <AuthHeader />
        <AuthTitle
          title="Registar"
          subtitle="Já tem uma conta?"
          linkText="Fazer Login"
          linkAction={() => router.push('/login/login-email')}
        />
      </AuthTopSection>

      <AuthContent>
        <ScrollView contentContainerStyle={styles.formContainer} showsVerticalScrollIndicator={false}>
          <FormInput
            label="Nome de Utilizador"
            value={username}
            onChangeText={(text) => {
              setUsername(text);
              clearError('username');
            }}
            autoCapitalize="none"
            error={errors.username}
          />

          <FormInput
            label="Email"
            keyboardType="email-address"
            value={email}
            onChangeText={(text) => {
              setEmail(text);
              clearError('email');
            }}
            autoCapitalize="none"
            error={errors.email}
          />

          <FormInput
            label="Palavra-passe"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              clearError('password');
            }}
            showPasswordToggle
            isPasswordVisible={showPassword}
            onPasswordToggle={() => setShowPassword(!showPassword)}
            error={errors.password}
          />

          <FormInput
            label="Nome Completo"
            value={fullName}
            onChangeText={(text) => {
              setFullName(text);
              clearError('fullName');
            }}
            autoCapitalize="words"
            error={errors.fullName}
          />

          <FormInput
            label="Número de Telemóvel (opcional)"
            keyboardType="phone-pad"
            value={phone}
            onChangeText={(text) => {
              setPhone(text);
              clearError('phone');
            }}
            error={errors.phone}
          />

          <FormInput
            label="Bilhete de Identidade"
            value={nationalID}
            onChangeText={(text) => {
              setNationalID(text);
              clearError('nationalID');
            }}
            autoCapitalize="characters"
            maxLength={13}
            error={errors.nationalID}
          />

          <DatePicker
            label="Data de Nascimento"
            value={dateOfBirth}
            onChange={(date) => {
              setDateOfBirth(date);
              clearError('dateOfBirth');
            }}
            maximumDate={maxDate}
            minimumDate={minDate}
            error={errors.dateOfBirth}
          />

          <SearchablePicker
            label="Género"
            value={gender}
            options={GENDER_OPTIONS}
            onSelect={(val) => {
              setGender(val);
              clearError('gender');
            }}
            error={errors.gender}
          />

          <SearchablePicker
            label="Província (opcional)"
            value={province}
            options={MOZAMBIQUE_PROVINCES}
            onSelect={(value) => {
              setProvince(value);
              setDistrict('');
            }}
          />

          {province && (
            <SearchablePicker
              label="Distrito (opcional)"
              value={district}
              options={availableDistricts}
              onSelect={setDistrict}
            />
          )}

          <SearchablePicker
            label="Ocupação"
            value={occupation}
            options={OCCUPATIONS}
            onSelect={(val) => {
              setOccupation(val);
              clearError('occupation');
            }}
            error={errors.occupation}
          />

          <SearchablePicker
            label="Instituição de Ensino (opcional)"
            value={academicInstitution}
            options={ACADEMIC_INSTITUTIONS}
            onSelect={setAcademicInstitution}
          />

          <SearchablePicker
            label="Nível Académico (opcional)"
            value={academicLevel}
            options={ACADEMIC_LEVELS}
            onSelect={setAcademicLevel}
          />

          {isUnderage && (
            <ConsentCheckbox
              isChecked={underageConsent}
              onToggle={() => {
                setUnderageConsent(!underageConsent);
                clearError('consent');
              }}
              error={errors.consent}
            />
          )}

          {errors.general && (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{errors.general}</Text>
            </View>
          )}
        </ScrollView>

        <Button
          text={createAccountMutation.isPending ? 'A processar...' : 'Registar'}
          handle={handleRegister}
          disabled={createAccountMutation.isPending}
          loading={createAccountMutation.isPending}
        />

        <AuthFooter linkText="Prefere usar número de telefone?" onLinkPress={() => router.push('/login')} />
      </AuthContent>
    </AuthContainer>
  );
}

const styles = StyleSheet.create({
  formContainer: {
    gap: 24,
    paddingBottom: 120,
  },
  errorContainer: {
    backgroundColor: '#3D1E1E',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FF6B6B',
    marginBottom: 16,
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
  },
});
