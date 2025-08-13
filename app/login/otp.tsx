import React, { useRef, useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '@/components/Button';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@/services/api';

export default function Otp() {
  const { phone, otpId, name, surname } = useLocalSearchParams();
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRefs = useRef<Array<TextInput | null>>([]);

  const fetchUserData = async (token: string) => {
    try {
      const response = await api.get('/users/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      return response.data;
    } catch (error) {
      console.error('Erro ao buscar dados do utilizador', error);
      throw error;
    }
  };

  const saveUser = async (loginData: any) => {
    try {
      // Get the token from login response
      const token = loginData.jwt || loginData.data?.jwt;

      if (!token) {
        throw new Error('Nenhum token recebido no login');
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
      Alert.alert('Erro', 'Falha ao guardar dados do utilizador. Por favor, tente novamente.');
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
      const endpoint = name && surname ? '/users' : '/auth/login';

      const body =
        name && surname
          ? {
              data: {
                phone: phone,
                otpID: otpId,
                code: otpCode,
                name: name,
                surname: surname,
              },
            }
          : {
              identifier: phone,
              otpID: otpId,
              password: otpCode,
            };

      const response = await api.post(endpoint, body);
      const data = response.data;

      console.log(`OTP`, JSON.stringify(data, null, 2));

      if (data.success || (name && surname && data.data)) {
        const userData = await saveUser(data);

        // Check if user has interests before navigating
        if (userData.interests && userData.interests.length > 0) {
          router.push('/');
        } else {
          router.push('/start/customize');
        }
      } else {
        Alert.alert('Erro de Verificação', 'Código OTP incorrecto. Por favor, verifique e tente novamente.', [
          { text: 'OK' },
        ]);
      }
    } catch (error: any) {
      // Handle axios error responses
      if (error.response?.status === 401) {
        // Account doesn't exist, show alert and redirect to registration
        Alert.alert(
          'Conta não encontrada',
          'Não existe uma conta associada a este número de telefone. Deseja criar uma nova conta?',
          [
            {
              text: 'Cancelar',
              style: 'cancel',
            },
            {
              text: 'Criar conta',
              onPress: () => {
                router.push({
                  pathname: '/login/create',
                  params: { phone: phone },
                });
              },
            },
          ]
        );
        return;
      }

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

  async function handleResendOtp() {
    try {
      setLoading(true);
      setResending(true);

      const response = await api.post('/otps', {
        data: {
          phone: phone,
        },
      });

      const data = response.data;

      if (data && data.otpID) {
        // Update the otpId with the new one
        router.setParams({ otpId: data.otpID });

        // Reset OTP input fields
        setOtp(['', '', '', '', '', '']);

        Alert.alert('Sucesso', 'Um novo código foi enviado para o seu telefone.', [{ text: 'OK' }]);
      } else {
        Alert.alert('Erro', 'Não foi possível enviar um novo código. Tente novamente mais tarde.', [{ text: 'OK' }]);
      }
    } catch (error: any) {
      console.error('Error resending OTP:', error);

      // Handle different axios error response status codes
      if (error.response) {
        const status = error.response.status;

        switch (status) {
          case 400:
            Alert.alert('Erro', 'Número de telefone inválido ou não registado');
            break;
          case 401:
            Alert.alert('Erro', 'Não autorizado. Por favor, verifique suas credenciais.');
            break;
          case 403:
            Alert.alert('Erro', 'Acesso proibido a este recurso.');
            break;
          case 404:
            Alert.alert('Erro', 'Serviço não encontrado. Por favor, tente mais tarde.');
            break;
          case 429:
            Alert.alert('Erro', 'Muitas tentativas. Por favor, aguarde alguns minutos e tente novamente.');
            break;
          default:
            if (status >= 500) {
              Alert.alert('Erro', 'Erro no servidor. Por favor, tente novamente mais tarde.');
            } else {
              Alert.alert('Erro', 'Ocorreu um erro. Por favor, tente novamente.');
            }
        }
      } else {
        Alert.alert(
          'Erro de conexão',
          'Não foi possível conectar ao servidor. Verifique sua conexão de internet e tente novamente.'
        );
      }
    } finally {
      setLoading(false);
      setResending(false);
    }
  }

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

        <Button text={resending ? 'A reenviar código...' : 'Confirmar'} handle={handleConfirm} loading={loading} />

        <View style={styles.resendContainer}>
          <Text style={styles.resendText}>Não recebeu o código? </Text>
          <TouchableOpacity onPress={handleResendOtp} disabled={loading}>
            <Text style={[styles.resendLink, loading && styles.disabledLink]}>Reenviar Código</Text>
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
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  content: {
    flex: 1,
    padding: 24,
    backgroundColor: '#121212',
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
  disabledLink: {
    opacity: 0.5,
  },
});
