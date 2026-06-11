import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Platform
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { colors } from '../theme/colors';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import ConfirmModal from '../components/ConfirmModal';
import { FileText, Bell, Settings, ChevronRight, User, Award, Bot, LogOut } from 'lucide-react-native';
import api from '../services/api';
import { bottomSafeSpace } from '../utils/safeArea';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout, updateUser } = useAuth();
  const { colors: themeColors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const profile = user?.profile;
  const mazaImpact = user?.impact?.averageImpactPercent ?? 0;

  const [numCompleted, setNumCompleted] = useState(0);

  useFocusEffect(
    useCallback(() => {
      const fetchRankingData = async () => {
        try {
          const [myRes, completedRes] = await Promise.all([
            api.get('/pathways/my').catch(() => ({ data: { pathway: null } })),
            api.get('/pathways/completed').catch(() => ({ data: [] })),
          ]);
          const courses = myRes.data?.pathway?.courses ?? [];
          const isCurrentCompleted = courses.length > 0 && courses.every((pc: any) => pc.isCompleted && pc.progress >= 100);
          const count = (completedRes.data?.length || 0) + (isCurrentCompleted ? 1 : 0);
          setNumCompleted(count);
        } catch (e) {
          console.log('Error fetching ranking data:', e);
        }
      };
      fetchRankingData();
    }, [])
  );

  const ranking = numCompleted >= 2 ? 'Colosso' : numCompleted === 1 ? 'Maza' : 'Calouro';

  const [resetting, setResetting] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showRedoModal, setShowRedoModal] = useState(false);

  const MENU_ITEMS = [
    { id: 1, title: 'Perfil', icon: <Settings size={20} color={themeColors.text} />, screen: 'Configuracoes' },
    { id: 2, title: 'Certificados', icon: <FileText size={20} color={themeColors.text} />, screen: 'MyCertificates' },
    { id: 3, title: 'Notificações', icon: <Bell size={20} color={themeColors.text} />, screen: 'Notificacoes' },
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
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: isWeb ? 32 : bottomSafeSpace(insets.bottom, 96) }}>
        <View style={isWeb ? styles.webContent : undefined}>
        <View style={[styles.header, isWeb && styles.webHeader]}>
          <View style={styles.avatarContainer}>
            <View style={[styles.avatar, { backgroundColor: themeColors.primary }]}><User size={40} color="#fff" /></View>
            <View style={[styles.badge, { backgroundColor: themeColors.secondary, borderColor: themeColors.background }]}><Award size={16} color="#fff" /></View>
          </View>
          <Text style={[styles.name, { color: themeColors.text }]}>{user?.name ?? 'Utilizador'}</Text>
          <Text style={[styles.phone, { color: themeColors.textMuted }]}>{user?.phone}</Text>
          <View style={[styles.rankBadge, { 
            backgroundColor: ranking === 'Colosso' ? (isDark ? '#422006' : '#FEF3C7') : 
                             ranking === 'Maza' ? (isDark ? '#1E293B' : '#F8FAFC') : 
                             (isDark ? '#1E293B' : '#F1F5F9')
          }]}>
            <Text style={[styles.rankText, { 
              color: ranking === 'Colosso' ? (isDark ? '#F59E0B' : '#D97706') : 
                     ranking === 'Maza' ? (isDark ? '#CBD5E1' : '#64748B') : 
                     (isDark ? '#94A3B8' : '#64748B')
            }]}>{ranking}</Text>
          </View>
        </View>

        <View style={[styles.statsContainer, isWeb && styles.webStatsContainer, { backgroundColor: themeColors.card }]}>
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: themeColors.text }]}>{profile?.totalPoints ?? 0}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textMuted }]}>Pontos</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: themeColors.text }]}>{mazaImpact}%</Text>
            <Text style={[styles.statLabel, { color: themeColors.textMuted }]}>Impactado</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
          <View style={styles.statBox}>
            <Text style={[styles.statNumber, { color: themeColors.text }]}>{ranking}</Text>
            <Text style={[styles.statLabel, { color: themeColors.textMuted }]}>Nível</Text>
          </View>
        </View>

        <View style={[styles.menuContainer, isWeb && styles.webPanel, { backgroundColor: themeColors.card }]}>
          {MENU_ITEMS.map((item) => (
            <TouchableOpacity key={item.id} style={[styles.menuItem, { borderBottomColor: themeColors.border }]} onPress={() => navigation.navigate(item.screen)}>
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
        <View style={[styles.botCard, isWeb && styles.webPanel, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
          <View style={styles.botCardContent}>
            <Text style={[styles.botCardTitle, { color: themeColors.text }]}>Personalizar Experiência</Text>
            <Text style={[styles.botCardDesc, { color: themeColors.textMuted }]}>
              Descubra o que combina com você. Responda perguntas rápidas para melhorar suas recomendações.
            </Text>
            <TouchableOpacity 
              style={[styles.botCardBtn, { backgroundColor: themeColors.primary }]}
              onPress={() => setShowRedoModal(true)}
              disabled={resetting}
            >
              {resetting ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.botCardBtnText}>Começar Agora</Text>
              )}
            </TouchableOpacity>
          </View>
          <View style={[styles.botCardIconContainer, { backgroundColor: themeColors.primary + '10' }]}>
            <View style={[styles.botIconWrapper, { backgroundColor: themeColors.card }]}>
              <Bot size={40} color={themeColors.primary} />
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
  webContent: { width: '100%', maxWidth: 920, alignSelf: 'center', paddingVertical: 24 },
  header: { alignItems: 'center', padding: 24, paddingTop: 40 },
  webHeader: { paddingTop: 8, paddingBottom: 12 },
  avatarContainer: { position: 'relative', marginBottom: 16, overflow: 'visible' },
  avatar: { width: 100, height: 100, borderRadius: 50, justifyContent: 'center', alignItems: 'center', shadowOpacity: 0.4, shadowRadius: 15, elevation: 8 },
  badge: { position: 'absolute', bottom: -2, right: -2, width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center', borderWidth: 3, zIndex: 10, elevation: 12 },
  name: { alignSelf: 'stretch', fontSize: 24, fontWeight: 'bold', marginBottom: 4, paddingHorizontal: 8, textAlign: 'center' },
  phone: { alignSelf: 'stretch', fontSize: 15, marginBottom: 12, textAlign: 'center' },
  rankBadge: { paddingHorizontal: 16, paddingVertical: 6, borderRadius: 20 },
  rankText: { fontWeight: 'bold', fontSize: 13 },
  statsContainer: { flexDirection: 'row', marginHorizontal: 24, borderRadius: 20, padding: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2, marginBottom: 32, marginTop: 20 },
  webStatsContainer: { marginTop: 8, marginBottom: 20 },
  statBox: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  statLabel: { fontSize: 12 },
  divider: { width: 1 },
  menuContainer: { marginHorizontal: 24, borderRadius: 20, padding: 8, shadowColor: '#000', shadowOpacity: 0.02, shadowRadius: 5, elevation: 1, marginBottom: 24 },
  webPanel: { borderRadius: 12 },
  menuItem: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 12, borderBottomWidth: 1 },
  logoutMenuItem: { borderBottomWidth: 0, marginTop: 2 },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center' },
  iconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  menuItemTitle: { fontSize: 16, fontWeight: '500' },
  botCard: {
    flexDirection: 'row',
    marginHorizontal: 24,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 15,
    elevation: 3,
    marginBottom: 20,
    borderWidth: 1,
  },
  botCardContent: {
    flex: 1,
    padding: 20,
  },
  botCardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  botCardDesc: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  botCardBtn: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  botCardBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  botCardIconContainer: {
    width: 100,
    justifyContent: 'center',
    alignItems: 'center',
  },
  botIconWrapper: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 2,
  },
});
