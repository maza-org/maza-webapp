import React, { useCallback, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BellOff, BookOpen, BriefcaseBusiness, ChevronLeft, Settings, Target } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { bottomSafeSpace } from '../utils/safeArea';

const ICONS: Record<string, any> = {
  CAREER_FOLLOW_UP: Target,
  JOB_RECOMMENDATION: BriefcaseBusiness,
  COURSE_REMINDER: BookOpen,
};

export default function NotificationsInboxScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [readIds, setReadIds] = useState<string[]>([]);

  const load = useCallback(async () => {
    try {
      const [response, stored, storedPrefs] = await Promise.all([
        api.get('/notifications'),
        AsyncStorage.getItem('maza_read_notifications'),
        AsyncStorage.getItem('maza_notif_prefs'),
      ]);
      const prefs = storedPrefs ? JSON.parse(storedPrefs) : {};
      const prefKey: Record<string, string> = { CAREER_FOLLOW_UP: 'career', JOB_RECOMMENDATION: 'jobs', COURSE_REMINDER: 'lessons' };
      setItems((response.data ?? []).filter((item: any) => prefs[prefKey[item.type]] !== false));
      setReadIds(stored ? JSON.parse(stored) : []);
    } finally { setLoading(false); }
  }, []);
  useFocusEffect(useCallback(() => { load(); }, [load]));

  const openItem = async (item: any) => {
    const next = [...new Set([...readIds, item.id])];
    setReadIds(next);
    await AsyncStorage.setItem('maza_read_notifications', JSON.stringify(next));
    if (item.route) navigation.navigate(item.route, item.params ?? {});
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.iconButton}><ChevronLeft size={24} color={colors.text} /></TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Notificações</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Notificacoes')} style={styles.iconButton}><Settings size={21} color={colors.textMuted} /></TouchableOpacity>
      </View>
      {loading ? <ActivityIndicator color={colors.primary} style={{ marginTop: 60 }} /> : items.length === 0 ? (
        <View style={styles.emptyState}><View style={[styles.emptyIconBg, { backgroundColor: isDark ? '#1e293b' : '#F1F5F9' }]}><BellOff size={36} color={colors.textMuted} /></View><Text style={[styles.emptyTitle, { color: colors.text }]}>Tudo em dia</Text><Text style={[styles.emptyText, { color: colors.textMuted }]}>Novos cursos, oportunidades e acompanhamentos aparecerão aqui.</Text></View>
      ) : (
        <ScrollView contentContainerStyle={{ padding: 18, paddingBottom: bottomSafeSpace(insets.bottom, 24) }}>
          {items.map((item) => {
            const Icon = ICONS[item.type] ?? BookOpen;
            const isRead = readIds.includes(item.id);
            return <TouchableOpacity key={item.id} style={[styles.card, { backgroundColor: colors.card, borderColor: isRead ? colors.border : colors.primary }]} onPress={() => openItem(item)} activeOpacity={0.8}><View style={[styles.cardIcon, { backgroundColor: colors.primary + '14' }]}><Icon size={21} color={colors.primary} /></View><View style={{ flex: 1 }}><Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text><Text style={[styles.cardText, { color: colors.textMuted }]}>{item.message}</Text></View>{!isRead ? <View style={[styles.dot, { backgroundColor: colors.primary }]} /> : null}</TouchableOpacity>;
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 }, header: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 12, paddingVertical: 10, borderBottomWidth: 1 }, iconButton: { width: 42, height: 42, alignItems: 'center', justifyContent: 'center' }, title: { flex: 1, fontSize: 21, fontWeight: '700', marginLeft: 4 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 40 }, emptyIconBg: { width: 72, height: 72, borderRadius: 36, justifyContent: 'center', alignItems: 'center', marginBottom: 16 }, emptyTitle: { fontSize: 19, fontWeight: '700', marginBottom: 7 }, emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 21 },
  card: { flexDirection: 'row', alignItems: 'center', gap: 12, borderWidth: 1, borderRadius: 14, padding: 14, marginBottom: 10 }, cardIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' }, cardTitle: { fontSize: 14, fontWeight: '700', marginBottom: 4 }, cardText: { fontSize: 12, lineHeight: 18 }, dot: { width: 8, height: 8, borderRadius: 4, alignSelf: 'flex-start', marginTop: 4 },
});
