import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Lock, Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function ChangePasswordScreen({ navigation }: any) {
  const { colors } = useTheme();
  const { user, setSession } = useAuth();
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleSave = async () => {
    setErrorMsg(null);
    setSuccessMsg(null);
    if (!form.oldPassword || !form.newPassword || !form.confirmPassword) {
      setErrorMsg('Por favor, preencha todos os campos.');
      return;
    }
    if (form.newPassword !== form.confirmPassword) {
      setErrorMsg('A nova palavra-passe e a confirmação não coincidem.');
      return;
    }
    if (form.newPassword.length < 8) {
      setErrorMsg('A nova palavra-passe deve ter pelo menos 8 caracteres.');
      return;
    }

    setLoading(true);
    try {
      const response = await api.post('/auth/change-password', {
        oldPassword: form.oldPassword,
        newPassword: form.newPassword,
      });
      if (response.data?.token && user) await setSession(response.data.token, user);
      setSuccessMsg('Palavra-passe alterada com sucesso!');
      setTimeout(() => {
        navigation.goBack();
      }, 1500);
    } catch (e: any) {
      setErrorMsg(e?.response?.data?.error || 'Não foi possível alterar a palavra-passe.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Alterar Senha</Text>
        <View style={{ width: 32 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.infoBox}>
          <Lock size={40} color={colors.primary} style={styles.infoIcon} />
          <Text style={[styles.infoTitle, { color: colors.text }]}>Segurança da Conta</Text>
          <Text style={[styles.infoDesc, { color: colors.textMuted }]}>
            Escolha uma palavra-passe forte para proteger a sua conta.
          </Text>
        </View>

        <View style={styles.form}>
          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Palavra-passe Atual</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: 'transparent' }]}
                secureTextEntry={!showCurrent}
                value={form.oldPassword}
                onChangeText={(value) => setForm({ ...form, oldPassword: value })}
                autoComplete="current-password"
                textContentType="password"
              />
              <TouchableOpacity onPress={() => setShowCurrent(!showCurrent)} style={styles.eye} activeOpacity={0.7}>
                {showCurrent ? <EyeOff size={20} color={colors.textMuted} /> : <Eye size={20} color={colors.textMuted} />}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Nova Palavra-passe</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: 'transparent' }]}
                secureTextEntry={!showNew}
                value={form.newPassword}
                onChangeText={(v) => setForm({ ...form, newPassword: v })}
                placeholder=""
                placeholderTextColor={colors.textMuted}
                autoComplete="off"
                textContentType="none"
              />
              <TouchableOpacity onPress={() => setShowNew(!showNew)} style={styles.eye} activeOpacity={0.7}>
                {showNew ? <EyeOff size={20} color={colors.textMuted} /> : <Eye size={20} color={colors.textMuted} />}
              </TouchableOpacity>
            </View>
          </View>

          <View style={styles.field}>
            <Text style={[styles.label, { color: colors.text }]}>Confirmar Nova Palavra-passe</Text>
            <View style={[styles.inputWrap, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <TextInput
                style={[styles.input, { color: colors.text, backgroundColor: 'transparent' }]}
                secureTextEntry={!showNew}
                value={form.confirmPassword}
                onChangeText={(v) => setForm({ ...form, confirmPassword: v })}
                placeholder=""
                placeholderTextColor={colors.textMuted}
                autoComplete="off"
                textContentType="none"
              />
            </View>
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
            style={[styles.submitBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
            onPress={handleSave}
            disabled={loading || !!successMsg}
            activeOpacity={0.8}
          >
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Atualizar Senha</Text>}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { padding: 4 },
  title: { fontSize: 20, fontWeight: 'bold' },
  scroll: { padding: 24 },
  infoBox: { alignItems: 'center', marginBottom: 32, marginTop: 10 },
  infoIcon: { marginBottom: 16 },
  infoTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 8 },
  infoDesc: { fontSize: 14, textAlign: 'center', lineHeight: 20, paddingHorizontal: 20 },
  form: { marginTop: 10 },
  field: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  inputWrap: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, borderWidth: 1, paddingHorizontal: 16, height: 56 },
  input: { flex: 1, fontSize: 16 },
  eye: { padding: 8 },
  submitBtn: { height: 56, borderRadius: 16, justifyContent: 'center', alignItems: 'center', marginTop: 12, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  submitBtnText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
