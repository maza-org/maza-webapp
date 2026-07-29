import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import { FileText, Bell, Settings, ChevronRight, User, Award, Bot, CircleHelp, LogOut, BriefcaseBusiness } from 'lucide-react-native';
import api from '../services/api';
import { useIsWideWeb } from '../utils/webViewport';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, updateUser } = useAuth();
  const { colors: themeColors, isDark } = useTheme();
  const isWideWeb = useIsWideWeb(900);
  const [resetting, setResetting] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showRedoModal, setShowRedoModal] = useState(false);

  const MENU_ITEMS = [
    { id: 1, title: 'Perfil', icon: <Settings size={20} color={themeColors.text} />, screen: 'Configuracoes' },
    { id: 2, title: 'Certificados', icon: <FileText size={20} color={themeColors.text} />, screen: 'MyCertificates' },
    { id: 3, title: 'Resultados profissionais', icon: <BriefcaseBusiness size={20} color={themeColors.text} />, screen: 'CareerOutcomes' },
    { id: 4, title: 'Notificações', icon: <Bell size={20} color={themeColors.text} />, screen: 'Notificacoes' },
    { id: 5, title: 'Como funciona o MAZA?', icon: <CircleHelp size={20} color={themeColors.text} />, screen: 'HowItWorksStory' },
  ];

  const handleRedoAssessment = async () => {
    setShowRedoModal(false);
    setResetting(true);
    try {
      const res = await api.post('/bot/reset');
      if (res.data.user) await updateUser(res.data.user);
      navigation.navigate('BotAssessment');
    } catch (e) {
      console.error('Reset failed:', e);
    }
    setResetting(false);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false} bounces={false} contentContainerStyle={styles.scrollContent}>
        <View style={isWideWeb ? styles.webPage : undefined}>
        <View style={styles.header}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: themeColors.primary }]}><User size={32} color="#fff" /></View>
            <View style={[styles.badge, { backgroundColor: themeColors.secondary, borderColor: themeColors.background }]}><Award size={12} color="#fff" /></View>
          </View>
          <Text style={[styles.name, { color: themeColors.text }]}>{user?.name ?? 'Utilizador'}</Text>
          <Text style={[styles.phone, { color: themeColors.textMuted }]}>{user?.phone}</Text>
        </View>

        <View style={[styles.menuContainer, { backgroundColor: themeColors.card }]}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[styles.menuItem, { borderBottomColor: themeColors.border }]}
              onPress={async () => {
                if (item.screen === 'HowItWorksStory' && user?.id) {
                  await AsyncStorage.setItem(`maza_how_it_works_seen:${user.id}`, 'true');
                }
                navigation.navigate(item.screen);
              }}
            >
              <View style={styles.menuItemLeft}>
                <View style={[styles.iconBg, { backgroundColor: isDark ? '#1e293b' : '#F8FAFC' }]}>{item.icon}</View>
                <Text style={[styles.menuItemTitle, { color: themeColors.text }]}>{item.title}</Text>
              </View>
              <ChevronRight size={20} color={themeColors.textMuted} />
            </TouchableOpacity>
          ))}
          <TouchableOpacity style={[styles.menuItem, styles.logoutMenuItem]} onPress={() => setShowLogoutModal(true)}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.iconBg, { backgroundColor: isDark ? '#3F1D1D' : '#FEF2F2' }]}>
                <LogOut size={20} color={isDark ? '#FCA5A5' : '#EF4444'} />
              </View>
              <Text style={[styles.menuItemTitle, { color: isDark ? '#FCA5A5' : '#EF4444' }]}>Sair da conta</Text>
            </View>
            <ChevronRight size={20} color={isDark ? '#FCA5A5' : '#EF4444'} />
          </TouchableOpacity>
        </View>

        {/* Bot Assessment Card */}
        <View style={[styles.botCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.botCardContent}>
            <Text style={[styles.botCardTitle, { color: themeColors.text }]}>Personalizar Experiência</Text>
            <Text style={[styles.botCardDesc, { color: themeColors.textMuted }]}>
              Atualize as suas respostas para melhorar as recomendações.
            </Text>
            <TouchableOpacity 
              style={[styles.botCardBtn, { backgroundColor: themeColors.primary }]}
              onPress={() => setShowRedoModal(true)}
              disabled={resetting}
            >
              {resetting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.botCardBtnText}>Personalizar</Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={[styles.botCardIconContainer, { backgroundColor: themeColors.primary + '10' }]}>
            <View style={[styles.botIconWrapper, { backgroundColor: themeColors.card }]}>
              <Bot size={28} color={themeColors.primary} />
            </View>
          </View>
        </View>

        <View style={{ height: 8 }} />
        </View>
      </ScrollView>

      {/* Logout Confirm */}
      <ConfirmModal
        visible={showLogoutModal}
        title="Sair da conta"
        message="Tem a certeza que quer sair da conta?"
        confirmText="Sair"
        cancelText="Cancelar"
        confirmColor="#EF4444"
        onConfirm={() => { 
          setShowLogoutModal(false); 
          setTimeout(() => logout(), 300); // Allow modal to close before unmounting stack
        }}
        onCancel={() => setShowLogoutModal(false)}
      />

      {/* Redo Assessment Confirm */}
      <ConfirmModal
        visible={showRedoModal}
        title="Refazer Avaliação"
        message="Tem a certeza? A sua jornada atual será removida e terá de fazer a avaliação novamente."
        confirmText="Refazer"
        cancelText="Cancelar"
        confirmColor={themeColors.primary}
        onConfirm={handleRedoAssessment}
        onCancel={() => setShowRedoModal(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { flexGrow: 1, paddingBottom: 10 },
  webPage: { width: '100%', maxWidth: 1040, alignSelf: 'center', paddingTop: 20, paddingBottom: 24 },
  header: { alignItems: 'center', paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14 },
  avatarContainer: { position: 'relative', marginBottom: 10, overflow: 'visible' },
  avatar: { width: 76, height: 76, borderRadius: 38, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.25, shadowRadius: 10, elevation: 5 },
  badge: { position: 'absolute', bottom: -1, right: -1, width: 24, height: 24, borderRadius: 12, justifyContent: 'center', alignItems: 'center', borderWidth: 2, zIndex: 10, elevation: 8 },
  name: { alignSelf: 'stretch', fontSize: 21, fontWeight: '700', marginBottom: 2, paddingHorizontal: 8, textAlign: 'center' },
  phone: { alignSelf: 'stretch', fontSize: 13, textAlign: 'center' },
  menuContainer: { marginHorizontal: 20, borderRadius: 16, padding: 4, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 1, marginBottom: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 7, borderBottomWidth: 1 },
  logoutMenuItem: { borderBottomWidth: 0, marginTop: 2 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBg: { width: 34, height: 34, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  menuItemTitle: { fontSize: 15, fontWeight: '500' },
  botCard: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderRadius: 18,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
    marginBottom: 8,
    borderWidth: 1,
  },
  botCardContent: {
    flex: 1,
    padding: 14,
  },
  botCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 4,
  },
  botCardDesc: {
    fontSize: 12,
    lineHeight: 16,
    marginBottom: 10,
  },
  botCardBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  botCardBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 13,
  },
  botCardIconContainer: {
    width: 78,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botIconWrapper: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
});
