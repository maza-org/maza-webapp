import React, { useRef, useState } from 'react';
import {
  View, Text, StyleSheet, TextInput, TouchableOpacity,
  ActivityIndicator, Alert, Keyboard, Image,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { colors } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../services/api';
import { Ionicons } from '@expo/vector-icons';
import { useIsWideWeb } from '../utils/webViewport';

function getOtpErrorMessage(err: any, fallback: string) {
  const message = String(err?.message ?? '');
  if (/network request failed|failed to fetch|networkerror/i.test(message)) {
    return 'Não foi possível contactar o servidor. Verifique a sua ligação à internet e tente novamente.';
  }
  return message || fallback;
}

export default function OtpVerificationScreen({ route, navigation }: any) {
  const { phone } = route.params;
  const { verifyOtp } = useAuth();
  const isWideWeb = useIsWideWeb(760);

  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const inputRef = useRef<TextInput | null>(null);

  const handleChange = (text: string) => {
    setCode(text.replace(/\D/g, '').slice(0, 6));
  };

  const handleVerify = async () => {
    const otpCode = code.trim();
    if (otpCode.length < 6) {
      Alert.alert('Código incompleto', 'Por favor introduza os 6 dígitos do código.');
      return;
    }
    setLoading(true);
    Keyboard.dismiss();
    try {
      await verifyOtp(phone, otpCode);
    } catch (err: any) {
      Alert.alert('Erro', getOtpErrorMessage(err, 'Código inválido. Tente novamente.'));
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    setResending(true);
    try {
      const response = await fetch(`${API_BASE}/auth/login/otp/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data?.error || 'Erro ao reenviar');
      setCode('');
      inputRef.current?.focus();
      Alert.alert('Código enviado', 'Um novo código foi enviado para o seu número.');
    } catch (err: any) {
      Alert.alert('Erro', getOtpErrorMessage(err, 'Não foi possível reenviar o código.'));
    } finally {
      setResending(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, isWideWeb && styles.webPage]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={[styles.content, isWideWeb && styles.webContent]}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >
          <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.backBtn, isWideWeb && styles.webBackBtn]}>
            <Ionicons name="arrow-back" size={24} color="#1A1A2E" />
          </TouchableOpacity>

          <Image
            source={require('../../assets/maza-logo-azul.png')}
            style={[styles.logo, isWideWeb && styles.webLogo]}
            resizeMode="contain"
          />

          <Text style={styles.title}>Código SMS</Text>
          <Text style={styles.subtitle}>
            Enviámos um código de 6 dígitos para{'\n'}
            <Text style={styles.phoneHighlight}>{phone}</Text>
          </Text>

          <Text style={styles.codeLabel}>Código de verificação</Text>

          <TextInput
            ref={inputRef}
            style={[styles.otpInput, isWideWeb && styles.webInput, code && styles.otpInputFilled]}
            keyboardType="number-pad"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChangeText={handleChange}
            selectionColor={colors.primary}
            textContentType="oneTimeCode"
            autoComplete={Platform.OS === 'android' ? 'sms-otp' : 'one-time-code'}
            importantForAutofill="yes"
            autoCapitalize="none"
            autoCorrect={false}
            autoFocus
            placeholder=""
            placeholderTextColor="#C9D2DF"
          />

          <TouchableOpacity
            style={[styles.confirmBtn, isWideWeb && styles.webButton, (loading || code.length < 6) && { opacity: 0.55 }]}
            onPress={handleVerify}
            disabled={loading || code.length < 6}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.confirmBtnText}>Confirmar</Text>
            }
          </TouchableOpacity>

          <TouchableOpacity style={styles.resendLink} onPress={handleResend} disabled={resending}>
            <Text style={styles.resendText}>
              {resending ? 'A reenviar...' : 'Não recebeu o código? '}
              {!resending && <Text style={styles.resendHighlight}>Reenviar</Text>}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { flexGrow: 1, paddingHorizontal: 24, paddingTop: 40 },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  logo: { width: 160, height: 70, marginBottom: 32, alignSelf: 'flex-start' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#1A1A2E', marginBottom: 8 },
  subtitle: { fontSize: 14, color: '#8A8A9A', lineHeight: 22, marginBottom: 32 },
  phoneHighlight: { fontWeight: '700', color: '#1A1A2E' },
  codeLabel: { fontSize: 13, fontWeight: '600', color: '#3A3A5C', marginBottom: 14 },
  otpInput: {
    height: 58,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
    textAlign: 'center',
    fontSize: 22,
    fontWeight: '700',
    color: colors.text,
    letterSpacing: 5,
    marginBottom: 40,
    paddingHorizontal: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  otpInputFilled: { borderColor: colors.primary, backgroundColor: '#FFFFFF' },
  confirmBtn: {
    backgroundColor: colors.primary, paddingVertical: 17, borderRadius: 16, alignItems: 'center',
    shadowColor: colors.primary, shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.35, shadowRadius: 16, elevation: 8,
  },
  confirmBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '700', letterSpacing: 0.3 },
  resendLink: { alignItems: 'center', marginTop: 24 },
  resendText: { color: '#8A8A9A', fontSize: 14 },
  resendHighlight: { color: colors.primary, fontWeight: '700' },
  webPage: { backgroundColor: '#F3F8FB' },
  webContent: {
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
  webBackBtn: { backgroundColor: '#EDF7FC' },
  webLogo: { width: 140, height: 58, marginBottom: 24 },
  webInput: { borderColor: '#CFE0EA', shadowOpacity: 0 },
  webButton: { borderRadius: 12, shadowOpacity: 0.2, shadowRadius: 12 },
});
