import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { router } from 'expo-router';
import Button from '@/components/Button';

export default function Create() {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    // Basic validation
    if (!phoneNumber || !fullName) {
      Alert.alert('Erro', 'Por favor preencha todos os campos');
      return;
    }

    // Format phone number to include country code if not present
    const formattedPhone = phoneNumber.startsWith('+258') ? phoneNumber : `+258${phoneNumber}`;

    setLoading(true);
    try {
      const response = await fetch(`https://maza-strapi-backend.onrender.com/api/otps`, {
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
        throw new Error('Erro ao obter OTP');
      }

      const data = await response.json();
      console.log(data);
      // Navigate to OTP verification screen
      router.push({
        pathname: '/login/otp',
        params: {
          phone: formattedPhone,
          otpId: data.otpID,
          fullName: fullName,
        },
      });
    } catch (error) {
      console.log(error);
      Alert.alert('Erro', 'Não foi possível processar o cadastro. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Cadastrar</Text>

        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>Já tem uma conta? </Text>
          <TouchableOpacity onPress={() => router.push('/login')}>
            <Text style={styles.loginLink}>Faça Login</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Número de Telemóvel</Text>
            <TextInput
              style={styles.input}
              placeholder="821231231"
              placeholderTextColor="#666"
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Nome Completo</Text>
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
            disabled={!phoneNumber || !fullName || loading}
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
  title: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
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
  label: {
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
});
