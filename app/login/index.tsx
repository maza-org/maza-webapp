import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { Image } from 'expo-image';

export default function Login() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Basic validation
    if (!phoneNumber) {
      Alert.alert('Erro', 'Por favor preencha o número de telefone');
      return;
    }

    // Format phone number to include country code if not present
    const formattedPhone = phoneNumber.startsWith('+258') ? phoneNumber : `+258${phoneNumber}`;

    setLoading(true);
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_BASE_URL}/api/otps`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: {
            phone: formattedPhone,
          },
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log(data);
      // Navigate to OTP verification screen
      router.push({
        pathname: '/login/otp',
        params: {
          phone: formattedPhone,
          otpId: data.otpID,
        },
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível gerar o código OTP. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Image
          source={require('@/assets/images/maza-logo.png')}
          style={{ width: 89, height: 38 }}
          contentFit={'contain'}
        />
        <Text style={styles.headerText}>Faça login com a sua conta</Text>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Não possui uma conta? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>Registar</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Número de Telemóvel</Text>
            <TextInput
              style={styles.input}
              placeholder="821231231"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>
        </View>

        <View>
          <Button
            text={loading ? 'A processar...' : 'Entrar'}
            handle={handleRegister}
            disabled={!phoneNumber || loading}
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
