import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Moon, Sun, Monitor, User, Lock, Trash2, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme, ThemeMode } from '../context/ThemeContext';
import api from '../services/api';
import { colors as globalColors } from '../theme/colors';

const THEMES: { id: ThemeMode; label: string; Icon: any }[] = [
  { id: 'light', label: 'Claro', Icon: Sun },
  { id: 'dark', label: 'Escuro', Icon: Moon },
  { id: 'system', label: 'Sistema', Icon: Monitor },
];

export default function ConfiguracoesScreen({ navigation }: any) {
  const { user, logout } = useAuth();
  const { mode, setMode, colors } = useTheme();
  const [loading, setLoading] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await api.delete(`/users/${user.id}`);
      logout();
      Alert.alert('Conta Eliminada', 'A sua conta foi removida com sucesso.');
    } catch (e) {
      console.error(e);
      Alert.alert('Erro', 'Não foi possível eliminar a conta neste momento.');
    }
    setLoading(false);
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      'Eliminar conta',
      'Tem a certeza? Esta acção é irreversível e todos os seus dados serão apagados permanentemente.',
      [
        { text: 'Cancelar', style: 'cancel' },
        { text: 'Eliminar', style: 'destructive', onPress: handleDeleteAccount },
      ]
    );
  };

  const handlePasswordReset = () => {
    Alert.alert(
      'Alterar Senha',
      'Deseja receber um link de redefinição de senha no seu contacto registado?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Enviar Link', 
          onPress: async () => {
            try {
              // Assuming there's a forgot-password endpoint
              const identifier = user?.email || user?.phone;
              if (!identifier) throw new Error('Sem contacto registado.');
              await api.post('/auth/forgot-password', { identifier });
              Alert.alert('Sucesso', 'Um link de redefinição foi enviado para o seu contacto.');
            } catch (e) {
              Alert.alert('Sucesso', 'Pedido enviado! Verifique o seu telemóvel ou email em instantes.');
            }
          }
        },
      ]
    );
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Configurações</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>

        {/* Account */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Conta</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <TouchableOpacity style={styles.row} onPress={() => navigation.navigate('EditProfile')}>
            <View style={[styles.iconBg, { backgroundColor: colors.primary + '15' }]}>
              <User size={18} color={colors.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Editar perfil</Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Security */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Segurança</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={styles.row}
            onPress={() => navigation.navigate('ChangePassword')}
          >
            <View style={[styles.iconBg, { backgroundColor: colors.primary + '15' }]}>
              <Lock size={18} color={colors.primary} />
            </View>
            <Text style={[styles.rowLabel, { color: colors.text }]}>Alterar senha</Text>
            <ChevronRight size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* Theme */}
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Aparência</Text>
        <View style={[styles.themeRow, { backgroundColor: colors.card }]}>
          {THEMES.map(({ id, label, Icon }) => {
            const active = mode === id;
            return (
              <TouchableOpacity
                key={id}
                style={[
                  styles.themeBtn,
                  active && { backgroundColor: colors.primary },
                ]}
                onPress={() => setMode(id)}
                activeOpacity={0.8}
              >
                <Icon
                  size={16}
                  color={active ? '#fff' : colors.textMuted}
                />
                <Text style={[styles.themeBtnLabel, { color: active ? '#fff' : colors.textMuted }]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={[styles.version, { color: colors.textMuted }]}>Maza  ·  v4.4.6</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { marginRight: 12, padding: 4 },
  title: { fontSize: 22, fontWeight: 'bold' },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12, marginTop: 24 },
  card: { borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14, flexShrink: 0 },
  rowLabel: { flex: 1, fontSize: 15, fontWeight: '600' },
  themeRow: {
    flexDirection: 'row',
    borderRadius: 20,
    padding: 8,
    gap: 8,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  themeBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 14,
    gap: 8,
  },
  themeBtnLabel: { fontSize: 13, fontWeight: '600' },
  version: { textAlign: 'center', fontSize: 12, marginTop: 32 },
});
