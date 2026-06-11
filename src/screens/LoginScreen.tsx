import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ActivityIndicator, Alert, Image, Keyboard, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { colors } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { API_BASE } from '../services/api';
import PhoneInput from '../components/PhoneInput';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen({ navigation }: any) {
  const { login } = useAuth();
  const [mode, setMode] = useState<'otp' | 'email'>('email');
  const [phone, setPhone] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const sanitizeIdentifier = (value: string) => value
    .replace(/\s+/g, '')
    .replace(/[^A-Za-z0-9._@+-]/g, '');

  const updateIdentifier = (value: string) => {
    setIdentifier(sanitizeIdentifier(value));
  };

  const handleLogin = async () => {
    setErrorMsg(null);
    if (mode === 'email') {
      if (!identifier || !password) { setErrorMsg('Preencha todos os campos'); return; }
      setLoading(true);
      try {
        await login(identifier, password);
      } catch (err: any) {
        const msg = err?.response?.data?.error ?? err?.message ?? 'Erro ao iniciar sessão. Tente novamente.';
        setErrorMsg(msg);
        Alert.alert('Erro ao entrar', msg);
      } finally {
        setLoading(false);
      }
    } else {
      if (!phone) { setErrorMsg('Introduza o seu número de telemóvel'); return; }
      
      const cleanPhone = phone.replace(/\s/g, '');
      if (!/^\d{9}$/.test(cleanPhone)) {
        setErrorMsg('O número de telemóvel deve ter exatamente 9 dígitos (ex: 841234567).');
        return;
      }

      setLoading(true);
      try {
        const fullPhone = `+258${phone.replace(/\s/g, '')}`;

        const response = await fetch(`${API_BASE}/auth/login/otp/send`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ phone: fullPhone })
        });

        const data = await response.json();

        if (!response.ok) {
          const msg = response.status === 417
            ? 'Número não encontrado. Por favor registe-se primeiro.'
            : data?.error?.message || data?.error || 'Não foi possível enviar o código.';
          setErrorMsg(msg);
          Alert.alert('Erro', msg);
          return;
        }

        navigation.navigate('OtpVerification', { phone: fullPhone });
      } catch (err: any) {
        setErrorMsg('Não foi possível contactar o servidor. Verifique a sua ligação à internet.');
        Alert.alert('Erro de ligação', 'Não foi possível contactar o servidor. Verifique a sua ligação à internet.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
          showsVerticalScrollIndicator={false}
        >

      <Image
        source={require('../../assets/maza-logo-azul.png')}
        style={styles.logo}
        resizeMode="contain"
      />

      <Text style={styles.title}>Entre com{'\n'}a sua conta</Text>

      <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.registerLink}>
        <Text style={styles.registerText}>Não possui uma conta? <Text style={{ color: colors.primary }}>Registar</Text></Text>
      </TouchableOpacity>

      <View style={{ marginTop: 40 }}>
        {mode === 'otp' ? (
          <View style={styles.inputContainer}>
            <PhoneInput
              label="Número de Telemóvel"
              value={phone}
              onChangeText={setPhone}
            />
          </View>
        ) : (
          <>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email ou nome de utilizador</Text>
              <TextInput
                style={styles.input}
                value={identifier}
                onChangeText={updateIdentifier}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Palavra-passe</Text>
              <View style={styles.passwordInputWrap}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                  autoCorrect={false}
                  textContentType="password"
                  accessibilityLabel="Palavra-passe"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword((visible) => !visible)}
                  style={styles.passwordToggle}
                  accessibilityRole="button"
                  accessibilityLabel={showPassword ? 'Ocultar palavra-passe' : 'Mostrar palavra-passe'}
                  accessibilityHint={showPassword ? 'Esconde os caracteres da palavra-passe' : 'Mostra os caracteres da palavra-passe'}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={22}
                    color={colors.textMuted}
                  />
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity 
              style={{ alignItems: 'flex-end', marginBottom: 20 }}
              onPress={() => navigation.navigate('ForgotPassword')}
            >
               <Text style={{ color: colors.primary, fontSize: 13 }}>Esqueceu a palavra-passe?</Text>
            </TouchableOpacity>
          </>
        )}

        {errorMsg ? (
          <Text style={{ color: '#EF4444', marginBottom: 12, textAlign: 'center', fontWeight: '500' }}>
            {errorMsg}
          </Text>
        ) : null}

        <TouchableOpacity style={[styles.button, loading && { opacity: 0.7 }]} onPress={handleLogin} disabled={loading}>
          {loading ? <ActivityIndicator color={colors.white} /> : <Text style={styles.buttonText}>Entrar</Text>}
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => {
            Keyboard.dismiss();
            setMode(mode === 'otp' ? 'email' : 'otp');
          }}
          hitSlop={{ top: 14, bottom: 14, left: 24, right: 24 }}
          pressRetentionOffset={{ top: 24, bottom: 24, left: 32, right: 32 }}
          activeOpacity={0.65}
          style={styles.switchModeLink}
        >
          <Text style={styles.switchModeText}>
            {mode === 'otp' ? 'Prefere usar email e palavra-passe?' : 'Prefere usar número de telefone?'}
          </Text>
        </TouchableOpacity>
      </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FAFAFA' },
  content: { flexGrow: 1, padding: 24, paddingTop: 40 },
  logo: { width: 160, height: 70, marginBottom: 32, alignSelf: 'flex-start' },
  back: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F0F0F0', alignItems: 'center', justifyContent: 'center', marginBottom: 24 },
  backText: { color: colors.text, fontSize: 20, fontWeight: 'bold' },
  title: { maxWidth: 340, fontSize: 28, lineHeight: 36, fontWeight: 'bold', color: colors.text, marginBottom: 8 },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 13, color: colors.text, marginBottom: 8, fontWeight: '500' },
  input: { backgroundColor: colors.white, borderRadius: 12, padding: 16, fontSize: 16 },
  passwordInputWrap: { position: 'relative', justifyContent: 'center' },
  passwordInput: { paddingRight: 54 },
  passwordToggle: {
    position: 'absolute',
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
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
  registerLink: { alignItems: 'flex-start' },
  registerText: { color: '#8A8A8E', fontSize: 14 },
  switchModeLink: { alignItems: 'center', justifyContent: 'center', marginTop: 18, minHeight: 52, paddingHorizontal: 16, paddingVertical: 12 },
  switchModeText: { color: '#8A8A8E', fontSize: 14, fontWeight: '600', textAlign: 'center' },
});
