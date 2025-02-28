import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { Image } from 'expo-image';

const validateMozambiquePhone = (phoneNumber: string) => {
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

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [error, setError] = useState<string | undefined>(undefined);
  const [touched, setTouched] = useState(false);
  const [loading, setLoading] = useState(false);

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

    if (!phoneNumber) {
      setError('Por favor preencha o número de telefone');
      return;
    }

    const validation = validateMozambiquePhone(phoneNumber);
    if (!validation.isValid) {
      setError(validation.error);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`https://maza-strapi-backend.onrender.com/api/otps`, {
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
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      router.push({
        pathname: '/login/otp',
        params: {
          phone: validation.formattedNumber,
          otpId: data.otpID,
        },
      });
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível gerar o código OTP. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneNumberChange = (text: string) => {
    const sanitizedText = text.replace(/[^\d+]/g, '');
    setPhoneNumber(sanitizedText);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/maza-logo.png')}
          style={{ width: 129, height: 78 }}
          contentFit={'contain'}
        />
        <Text style={styles.headerText}>Faça login com a sua conta</Text>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Não possui uma conta? </Text>
          <TouchableOpacity onPress={() => router.push('/login/create')}>
            <Text style={styles.loginLink}>Registar</Text>
          </TouchableOpacity>
        </View>

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
        </View>

        <View>
          <Button
            text={loading ? 'A processar...' : 'Entrar'}
            handle={handleRegister}
            disabled={!!error || !phoneNumber || loading}
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
    backgroundColor: '#121212',
  },
  content: {
    flex: 1,
    padding: 24,
    gap: 24,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    width: 200,
  },
  loginContainer: {
    flexDirection: 'row',
    marginBottom: 32,
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
  registerButton: {
    height: 48,
    backgroundColor: '#2196F3',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});
