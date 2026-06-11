import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Image, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import api, { mapAuthError } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { colors } from '../theme/colors';

export default function ResetPasswordScreen() {
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirmation, setPasswordConfirmation] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { isDark } = useTheme();
  const { setSession } = useAuth();

  const identifier = route.params?.identifier || '';

  const handleResetPassword = async () => {
    setErrorMsg(null);
    const trimmedCode = code.trim();
    
    if (!trimmedCode) {
      setErrorMsg('Introduza o código recebido.');
      return;
    }
    if (!password) {
      setErrorMsg('Introduza a nova senha.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (password !== passwordConfirmation) {
      setErrorMsg('As senhas não coincidem.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await api.post('/auth/reset-password', {
        code: trimmedCode,
        password,
        passwordConfirmation,
      });
      
      const { jwt, user } = response.data;
      
      await setSession(jwt, user);
    } catch (error: any) {
      setErrorMsg(mapAuthError(error));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: isDark ? colors.background : '#FAFAFA' }}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined} 
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          bounces={false}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
            <TouchableOpacity style={styles.back} onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color={colors.text} />
            </TouchableOpacity>

            <Image
              source={isDark ? require('../../assets/maza-logo-branco.png') : require('../../assets/maza-logo-azul.png')}
              style={styles.logo}
              resizeMode="contain"
            />

            <Text style={[styles.title, { color: isDark ? colors.white : colors.text }]}>Nova Senha</Text>
            <Text style={[styles.subtitle, { color: isDark ? '#9ca3af' : '#6b7280' }]}>
              Introduza o código de 6 dígitos enviado para o seu contacto e crie uma nova senha.
            </Text>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDark ? colors.white : colors.text }]}>CÓDIGO DE 6 DÍGITOS</Text>
              <TextInput
                style={[styles.input, { backgroundColor: isDark ? '#1e293b' : colors.white, color: isDark ? colors.white : colors.text, textAlign: 'center', letterSpacing: 8, fontSize: 24, fontWeight: 'bold' }]}
                placeholder=""
                placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                value={code}
                onChangeText={setCode}
                keyboardType="number-pad"
                maxLength={6}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDark ? colors.white : colors.text }]}>NOVA SENHA</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#1e293b' : colors.white }]}>
                <TextInput
                  style={[styles.inputInner, { color: isDark ? colors.white : colors.text }]}
                  placeholder=""
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={{ padding: 10 }}>
                  <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color={isDark ? '#94a3b8' : '#9ca3af'} />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputContainer}>
              <Text style={[styles.label, { color: isDark ? colors.white : colors.text }]}>CONFIRMAR SENHA</Text>
              <View style={[styles.inputWrapper, { backgroundColor: isDark ? '#1e293b' : colors.white }]}>
                <TextInput
                  style={[styles.inputInner, { color: isDark ? colors.white : colors.text }]}
                  placeholder=""
                  placeholderTextColor={isDark ? '#94a3b8' : '#9ca3af'}
                  secureTextEntry={!showPassword}
                  value={passwordConfirmation}
                  onChangeText={setPasswordConfirmation}
                />
              </View>
            </View>

            {errorMsg ? (
              <Text style={{ color: '#EF4444', marginBottom: 12, textAlign: 'center', fontWeight: '500' }}>
                {errorMsg}
              </Text>
            ) : null}

            <TouchableOpacity 
              style={[styles.button, { opacity: isLoading ? 0.7 : 1 }]} 
              onPress={handleResetPassword}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Redefinir Senha</Text>
              )}
            </TouchableOpacity>
            
            <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 24,
    paddingTop: 40,
    width: '100%',
    ...(Platform.OS === 'web'
      ? {
          maxWidth: 520,
          alignSelf: 'center',
          justifyContent: 'center',
          paddingVertical: 36,
        }
      : null),
  },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  logo: { width: 160, height: 70, marginBottom: 32, alignSelf: 'flex-start' },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 14, marginBottom: 32, lineHeight: 22 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 13, marginBottom: 8, fontWeight: '500', textTransform: 'uppercase', letterSpacing: 0.5 },
  input: { borderRadius: 12, padding: 16, fontSize: 16, borderWidth: 1, borderColor: '#E6EAF0' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, paddingRight: 5, borderWidth: 1, borderColor: '#E6EAF0' },
  inputInner: { flex: 1, padding: 16, fontSize: 16 },
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
});
