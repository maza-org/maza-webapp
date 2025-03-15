import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function Otp() {
  const { phone, otpId, fullName } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const fetchUserData = async (token: string) => {
    try {
      const response = await fetch('https://maza-strapi-backend.onrender.com/api/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching user data:', error);
      throw error;
    }
  };

  const saveUser = async (loginData: any) => {
    try {
      // Get the token from login response
      const token = loginData.jwt || loginData.data?.jwt;

      if (!token) {
        throw new Error('No token received from login');
      }

      // Fetch additional user data
      const userData = await fetchUserData(token);

      // Combine login data with user data
      const user = {
        ...userData,
        token,
      };

      console.log(`user in otp`, JSON.stringify(user, null, 2));

      await AsyncStorage.setItem('@user', JSON.stringify(user));
      return user;
    } catch (error) {
      console.error('Error saving user data:', error);
      Alert.alert('Erro', 'Falha ao salvar dados do usuário');
      throw error;
    }
  };

  const handleConfirm = async () => {
    if (!otpId) {
      Alert.alert('Erro', 'Por favor, solicite o código OTP primeiro');
      return;
    }

    const otpCode = otp.join('');
    if (otpCode.length !== 6) {
      Alert.alert('Erro', 'Por favor, insira o código OTP completo');
      return;
    }

    setLoading(true);
    try {
      const endpoint = fullName
        ? `https://maza-strapi-backend.onrender.com/api/users`
        : `https://maza-strapi-backend.onrender.com/api/auth/login`;

      const body = fullName
        ? {
            data: {
              phone: phone,
              otpID: otpId,
              code: otpCode,
              fullname: fullName,
            },
          }
        : {
            identifier: phone,
            otpID: otpId,
            password: otpCode,
          };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (data.success || (fullName && data.data)) {
        const userData = await saveUser(data);

        // Check if user has interests before navigating
        if (userData.interests && userData.interests.length > 0) {
          router.push('/');
        } else {
          router.push('/start/customize');
        }
      } else {
        Alert.alert('Erro de Verificação', 'Código OTP incorreto. Por favor, verifique e tente novamente.', [
          { text: 'OK' },
        ]);
      }
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Ocorreu um erro ao verificar o código. Por favor, tente novamente.', [{ text: 'OK' }]);
    } finally {
      setLoading(false);
    }
  };

  const handleOtpChange = (value: string, index: number) => {
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      // Fix: Add null check before accessing focus method
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace') {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = '';
        setOtp(newOtp);
        // Fix: Add null check before accessing focus method
        inputRefs.current[index - 1]?.focus();
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topSection}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back" size={24} color="#fff" />
          </TouchableOpacity>
        </View>

        <View style={styles.titleSection}>
          <Text style={styles.headerText}>Código OTP</Text>
          <Text style={styles.subText}>
            Enviamos uma SMS com o código de autenticação{'\n'}
            para o número <Text style={styles.phoneNumber}>{phone}</Text>
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Código de Verificação</Text>
          <View style={styles.otpContainer}>
            {[0, 1, 2, 3, 4, 5].map((i) => (
              <TextInput
                key={i}
                ref={(ref) => (inputRefs.current[i] = ref)}
                style={styles.otpInput}
                maxLength={1}
                keyboardType="number-pad"
                value={otp[i]}
                onChangeText={(value) => handleOtpChange(value, i)}
                onKeyPress={(e) => handleKeyPress(e, i)}
              />
            ))}
          </View>
        </View>

        <Button text="Confirmar" handle={handleConfirm} loading={loading} />

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Não recebeu o código? </Text>
          <TouchableOpacity>
            <Text style={styles.resendLink}>Reenviar Código</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Changed to match the light dark color from other screens
  },
  topSection: {
    backgroundColor: '#1E1E1E', // Light dark background color for the top section
    paddingBottom: 20,
    marginBottom: 10,
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  content: {
    flex: 1,
    padding: 24,
    backgroundColor: '#121212', // Darker background for the content section
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  titleSection: {
    paddingTop: 8,
  },
  backButton: {
    padding: 8,
    borderStyle: 'solid',
    borderColor: '#b3b3b3',
    borderWidth: 0.5,
    borderRadius: 50,
  },
  headerText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
    width: 200,
  },
  subText: {
    color: '#999999',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
  },
  phoneNumber: {
    color: '#FFFFFF',
  },
  formContainer: {
    marginBottom: 32,
    marginTop: 16,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 16,
  },
  otpContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 32,
  },
  otpInput: {
    width: 48,
    height: 48,
    backgroundColor: '#252525',
    borderRadius: 24,
    textAlign: 'center',
    fontSize: 16,
    color: '#FFFFFF',
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  resendText: {
    color: '#999999',
    fontSize: 14,
  },
  resendLink: {
    color: '#2196F3',
    fontSize: 14,
  },
});
