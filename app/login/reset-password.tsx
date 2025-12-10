import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import Button from '@/components/Button';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

export default function ResetPassword() {
  const { identifier } = useLocalSearchParams<{ identifier: string }>();

  const [pin, setPin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [pinError, setPinError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');

  const handleSubmit = async () => {
    let isValid = true;
    setPinError('');
    setPasswordError('');
    setConfirmPasswordError('');

    // Validate PIN
    if (!pin.trim()) {
      setPinError('Por favor, insira o código de verificação');
      isValid = false;
    }

    // Validate password
    if (password.length < 6) {
      setPasswordError('A palavra-passe deve ter pelo menos 6 caracteres');
      isValid = false;
    }

    // Validate confirm password
    if (password !== confirmPassword) {
      setConfirmPasswordError('As palavras-passe não coincidem');
      isValid = false;
    }

    if (!isValid) return;

    setLoading(true);

    // Mock API call - simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // TODO: Replace with actual API call
    // const response = await fetch(`${baseUrl}/auth/reset-password`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({
    //     identifier,
    //     pin: pin.trim(),
    //     newPassword: password,
    //   }),
    // });

    setLoading(false);

    // Mock success
    Alert.alert('Sucesso', 'A sua palavra-passe foi alterada com sucesso!', [
      {
        text: 'Fazer Login',
        onPress: () => router.replace('/login/login-email'),
      },
    ]);
  };

  const isFormValid = pin.trim().length > 0 && password.length >= 6 && confirmPassword.length >= 6;

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
          <Text style={styles.headerText}>Redefinir Palavra-passe</Text>
          <Text style={styles.subtitleText}>
            Insira o código enviado para {identifier || 'o seu email/telefone'} e crie uma nova palavra-passe.
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.formContainer}>
          {/* PIN Input */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Código de Verificação</Text>
            <TextInput
              style={[styles.input, pinError ? styles.inputError : null]}
              placeholder="Insira o código recebido"
              placeholderTextColor="#666"
              value={pin}
              onChangeText={(text) => {
                setPin(text);
                if (pinError) setPinError('');
              }}
              autoCapitalize="none"
              editable={!loading}
            />
            {pinError ? <Text style={styles.errorText}>{pinError}</Text> : null}
          </View>

          {/* New Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Nova Palavra-passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, passwordError ? styles.inputError : null]}
                placeholder="Mínimo 6 caracteres"
                placeholderTextColor="#666"
                value={password}
                onChangeText={(text) => {
                  setPassword(text);
                  if (passwordError) setPasswordError('');
                }}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowPassword(!showPassword)}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
              </TouchableOpacity>
            </View>
            {passwordError ? <Text style={styles.errorText}>{passwordError}</Text> : null}
          </View>

          {/* Confirm Password */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Confirmar Palavra-passe</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={[styles.input, styles.passwordInput, confirmPasswordError ? styles.inputError : null]}
                placeholder="Repita a palavra-passe"
                placeholderTextColor="#666"
                value={confirmPassword}
                onChangeText={(text) => {
                  setConfirmPassword(text);
                  if (confirmPasswordError) setConfirmPasswordError('');
                }}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                editable={!loading}
              />
              <TouchableOpacity style={styles.eyeButton} onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
                <Ionicons name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#999" />
              </TouchableOpacity>
            </View>
            {confirmPasswordError ? <Text style={styles.errorText}>{confirmPasswordError}</Text> : null}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            text={loading ? 'A processar...' : 'Redefinir Palavra-passe'}
            handle={handleSubmit}
            disabled={!isFormValid || loading}
            loading={loading}
          />
        </View>

        <View style={styles.textButtonContainer}>
          <TouchableOpacity onPress={() => router.replace('/login/login-email')}>
            <Text style={styles.bottomLinkText}>Voltar ao Login</Text>
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
    padding: 24,
    gap: 24,
    backgroundColor: '#121212',
  },
  headerText: {
    fontSize: 28,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  subtitleText: {
    fontSize: 14,
    color: '#999999',
    marginTop: 12,
    lineHeight: 20,
  },
  formContainer: {
    gap: 24,
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
  // Password styles
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
  buttonContainer: {
    marginTop: 16,
  },
  textButtonContainer: {
    alignItems: 'center',
    marginTop: 16,
  },
  bottomLinkText: {
    color: '#2196F3',
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
