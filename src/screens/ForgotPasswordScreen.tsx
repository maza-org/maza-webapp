import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import api, { mapAuthError } from '../services/api';
import { colors } from '../theme/colors';
import { useIsWideWeb } from '../utils/webViewport';

export default function ForgotPasswordScreen() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [identifier, setIdentifier] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigation = useNavigation<any>();
  const { isDark } = useTheme();
  const isWideWeb = useIsWideWeb(760);

  const sanitizeIdentifier = (value: string) => value
    .replace(/\s+/g, '')
    .replace(/[^A-Za-z0-9._@+-]/g, '');

  const updateIdentifier = (value: string) => {
    setIdentifier(sanitizeIdentifier(value));
  };

  const handleForgotPassword = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    const trimmedIdentifier = identifier.trim();
    if (!trimmedIdentifier) {
      setErrorMsg('Introduza o seu email, username ou telefone.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/forgot-password', {
        identifier: trimmedIdentifier.toLowerCase(),
      });
      
      setSuccessMsg(response.data.message || 'Instruções enviadas com sucesso.');
      navigation.replace('ResetPassword', { identifier: trimmedIdentifier });
    } catch (error: any) {
      setErrorMsg(mapAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[{ flex: 1, backgroundColor: isDark ? colors.background : '#FAFAFA' }, isWideWeb && styles.webPage]}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.container, isWideWeb && styles.webContainer]}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
            <TouchableOpacity style={[styles.back, isWideWeb && styles.webBack]} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <Image
              source={isDark ? require('../../assets/maza-logo-branco.png') : require('../../assets/maza-logo-azul.png')}
              style={[styles.logo, isWideWeb && styles.webLogo]}
              resizeMode="contain"
            />

            <Text style={[styles.title, { color: isDark ? colors.white : colors.text }]}>Recuperar Senha</Text>
            <Text style={[styles.subtitle, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              Introduza o seu email ou número de telefone registado para receber um código de recuperação.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDark ? colors.white : colors.text }]}>EMAIL OU TELEFONE</Text>
              <TextInput
                style={[styles.input, isWideWeb && styles.webInput, { backgroundColor: isDark ? '#1e293b' : colors.white, color: isDark ? colors.white : colors.text }]}
                placeholder=""
                placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                value={identifier}
                onChangeText={updateIdentifier}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
              />
            </View>

            {errorMsg ? (
              <Text style={{ color: '#EF4444', marginBottom: 12, textAlign: 'center', fontWeight: '500' }}>
                {errorMsg}
              </Text>
            ) : null}
            
            {successMsg ? (
              <Text style={{ color: '#10B981', marginBottom: 12, textAlign: 'center', fontWeight: '500' }}>
                {successMsg}
              </Text>
            ) : null}

            <TouchableOpacity 
              style={[styles.button, isWideWeb && styles.webButton, { opacity: isLoading ? 0.7 : 1 }]}
              onPress={handleForgotPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Enviar Código</Text>
              )}
            </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 24, paddingTop: 40 },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  logo: { width: 160, height: 70, marginBottom: 32, alignSelf: 'flex-start' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 32, lineHeight: 22 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 13, marginBottom: 8, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderRadius: 12, padding: 16, fontSize: 16 },
  button: {
    backgroundColor: colors.primary,
    paddingVertical: 17,
    borderRadius: 16,
    alignItems: 'center',
    marginTop: 10,
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8,
  },
  buttonText: { color: colors.white, fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  webPage: { backgroundColor: '#F3F8FB' },
  webContainer: {
    flexGrow: 0,
    width: '100%',
    maxWidth: 560,
    alignSelf: 'center',
    justifyContent: 'center',
    marginVertical: 32,
    padding: 40,
    borderWidth: 1,
    borderColor: '#DCEAF2',
    borderRadius: 24,
    backgroundColor: '#FFFFFF',
    shadowColor: '#0F3550',
    shadowOffset: { width: 0, height: 18 },
    shadowOpacity: 0.1,
    shadowRadius: 36,
  },
  webBack: { backgroundColor: '#EDF7FC' },
  webLogo: { width: 140, height: 58, marginBottom: 24 },
  webInput: { borderWidth: 1, borderColor: '#CFE0EA' },
  webButton: { borderRadius: 12, shadowOpacity: 0.2, shadowRadius: 12 },
});
