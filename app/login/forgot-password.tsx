import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import Button from '@/components/Button';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier) {
      setError('Por favor, insira o seu email ou número de telefone');
      return;
    }

    // Basic validation - check if it looks like email or phone
    const isEmail = trimmedIdentifier.includes('@');
    const isPhone = /^[\d+]+$/.test(trimmedIdentifier.replace(/\s/g, ''));

    if (!isEmail && !isPhone) {
      setError('Por favor, insira um email ou número de telefone válido');
      return;
    }

    setError('');
    setLoading(true);

    // Mock API call - simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // TODO: Replace with actual API call
    // const response = await fetch(`${baseUrl}/auth/forgot-password`, {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify({ identifier: trimmedIdentifier }),
    // });

    setLoading(false);
    setSuccess(true);
  };

  const handleBackToLogin = () => {
    router.back();
  };

  if (success) {
    return (
      <SafeAreaView style={styles.container} edges={['top', 'bottom']}>
        <View style={styles.topSection}>
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBackToLogin} style={styles.backButton}>
              <Ionicons name="chevron-back" size={24} color="#fff" />
            </TouchableOpacity>
            <Image
              source={require('@/assets/images/maza-logo.png')}
              style={{ width: 129, height: 78, marginStart: 20 }}
              contentFit={'contain'}
            />
          </View>
          <View style={styles.titleSection}>
            <Text style={styles.headerText}>Código Enviado</Text>
          </View>
        </View>

        <View style={styles.content}>
          <View style={styles.successContainer}>
            <View style={styles.successIconContainer}>
              <Ionicons name="checkmark-circle" size={64} color="#4CAF50" />
            </View>
            <Text style={styles.successTitle}>PIN enviado com sucesso!</Text>
            <Text style={styles.successMessage}>
              Enviámos um código de verificação para{'\n'}
              <Text style={styles.successIdentifier}>{identifier}</Text>
            </Text>
            <Text style={styles.successInstructions}>
              Por favor, verifique a sua caixa de entrada ou mensagens SMS e use o código para redefinir a sua
              palavra-passe.
            </Text>
          </View>

          <View style={styles.buttonContainer}>
            <Button
              text="Introduzir Código"
              handle={() => router.push({ pathname: '/login/reset-password', params: { identifier } })}
            />
          </View>

          <TouchableOpacity
            style={styles.resendContainer}
            onPress={() => {
              setSuccess(false);
              handleSubmit();
            }}
          >
            <Text style={styles.resendText}>Não recebeu o código? </Text>
            <Text style={styles.resendLink}>Reenviar</Text>
          </TouchableOpacity>

          <View style={styles.textButtonContainer}>
            <TouchableOpacity onPress={handleBackToLogin}>
              <Text style={styles.bottomLinkText}>Voltar ao Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

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
          <Text style={styles.headerText}>Recuperar Palavra-passe</Text>
          <Text style={styles.subtitleText}>
            Insira o seu email ou número de telefone para receber um código de verificação.
          </Text>
        </View>
      </View>

      <View style={styles.content}>
        <View style={styles.formContainer}>
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email ou Telefone</Text>
            <TextInput
              style={[styles.input, error ? styles.inputError : null]}
              keyboardType="email-address"
              value={identifier}
              onChangeText={(text) => {
                setIdentifier(text);
                if (error) setError('');
              }}
              autoCapitalize="none"
              editable={!loading}
            />
            {error ? <Text style={styles.errorText}>{error}</Text> : null}
          </View>
        </View>

        <View style={styles.buttonContainer}>
          <Button
            text={loading ? 'A enviar...' : 'Enviar Código'}
            handle={handleSubmit}
            disabled={!identifier.trim() || loading}
            loading={loading}
          />
        </View>

        <View style={styles.textButtonContainer}>
          <TouchableOpacity onPress={() => router.push('/login/reset-password')}>
            <Text style={styles.bottomLinkText}>Já tem um código?</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.textButtonContainer}>
          <TouchableOpacity onPress={handleBackToLogin}>
            <Text style={styles.secondaryLinkText}>Voltar ao Login</Text>
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
  buttonContainer: {
    marginTop: 8,
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
  secondaryLinkText: {
    color: '#999999',
    fontSize: 14,
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
  // Success screen styles
  successContainer: {
    alignItems: 'center',
    paddingVertical: 32,
  },
  successIconContainer: {
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 22,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 16,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 16,
  },
  successIdentifier: {
    color: '#2196F3',
    fontWeight: '500',
  },
  successInstructions: {
    fontSize: 14,
    color: '#999999',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 16,
  },
  resendContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
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
