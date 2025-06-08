import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { Image } from 'expo-image';

const validateMozambiquePhone = (phoneNumber) => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const number = cleaned.startsWith('258') ? cleaned.slice(3) : cleaned;
  if (number.length !== 9) {
    return {
      isValid: false,
      error: 'O número deve ter 9 dígitos',
    };
  }
  const validPrefixes = ['82', '83', '84', '85', '86', '87'];
  const prefix = number.slice(0, 2);

  if (!validPrefixes.includes(prefix)) {
    return {
      isValid: false,
      error: 'O número deve começar com 82, 83, 84, 85, 86 ou 87',
    };
  }

  return {
    isValid: true,
    formattedNumber: `+258${number}`,
  };
};

export default function Create() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(undefined);
  const [touched, setTouched] = useState(false);

  // Validate phone number when it changes
  useEffect(() => {
    if (touched && phoneNumber) {
      const validation = validateMozambiquePhone(phoneNumber);
      if (!validation.isValid) {
        setError(validation.error);
      } else {
        setError('');
      }
    } else if (touched && !phoneNumber) {
      setError('Por favor preencha o número de telefone');
    }
  }, [phoneNumber, touched]);

  const handleRegister = async () => {
    setTouched(true);

    if (!phoneNumber || !fullName) {
      Alert.alert('Erro', 'Por favor preencha todos os campos');
      return;
    }

    // Validate phone number
    const validation = validateMozambiquePhone(phoneNumber);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://api.mazas.org/api/otps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            phone: validation.formattedNumber,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao obter OTP');
      }

      const data = await response.json();
      // Navigate to OTP verification screen
      router.push({
        pathname: '/login/otp',
        params: {
          phone: validation.formattedNumber,
          otpId: data.otpID,
          fullName: fullName,
        },
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível processar o cadastro. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneNumberChange = (text) => {
    const sanitizedText = text.replace(/[^\d+]/g, '');
    setPhoneNumber(sanitizedText);
  };

  const handleSkip = () => {
    router.push('/');
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.header}>
          <Image
            source={require('@/assets/images/maza-logo.png')}
            style={{ width: 129, height: 78 }}
            contentFit={'contain'}
          />
        </View>
        <View style={styles.titleSection}>
          <Text style={styles.headerText}>Cadastrar</Text>

          <View style={styles.loginContainer}>
            <Text style={styles.loginText}>Já tem uma conta? </Text>
            <TouchableOpacity onPress={() => router.push('/login')}>
              <Text style={styles.loginLink}>Faça Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Número de Telemóvel</Text>
            <TextInput
              style={[styles.input, error && touched ? styles.inputError : null]}
              placeholder="821231231"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={handlePhoneNumberChange}
              onBlur={() => setTouched(true)}
              maxLength={13} // +258 + 9 digits
            />
            {error && touched && <Text style={styles.errorText}>{error}</Text>}
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nome Completo</Text>
            <TextInput
              style={styles.input}
              placeholder="João Carlos António"
              placeholderTextColor="#666"
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
        </View>

        <View>
          <Button
            text={loading ? 'A processar...' : 'Cadastrar'}
            handle={handleRegister}
            disabled={!phoneNumber || !fullName || loading || !!error}
            loading={loading}
          />
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
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  titleSection: {
    paddingHorizontal: 24,
    paddingTop: 24,
  },
  skipButtonContainer: {
    alignItems: 'center',
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 16,
    backgroundColor: '#252525',
  },
  skipButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 24,
    backgroundColor: '#121212',
  },
  headerText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    width: 200,
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
    marginBottom: 32,
    marginTop: 16,
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
  },
  inputError: {
    borderWidth: 1,
    borderColor: '#FF6B6B',
  },
  errorText: {
    color: '#FF6B6B',
    fontSize: 12,
    marginTop: 4,
    marginLeft: 8,
  },
  textButtonContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  bottomLinkText: {
    color: '#999999',
    fontSize: 16,
    textAlign: 'center',
    paddingVertical: 8,
  },
});
