import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Switch, Alert, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, MessageSquare, Award, BookOpen, BriefcaseBusiness, Target } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTheme } from '../context/ThemeContext';
import { actionShadow } from '../theme/shadows';

const NOTIF_ITEMS = [
  { id: 'lessons', label: 'Novas lições', sub: 'Quando um novo módulo for adicionado', icon: BookOpen, defaultOn: true },
  { id: 'achievements', label: 'Conquistas', sub: 'Quando ganhar um badge ou certificado', icon: Award, defaultOn: true },
  { id: 'messages', label: 'Mensagens', sub: 'Avisos e comunicados da plataforma', icon: MessageSquare, defaultOn: false },
  { id: 'jobs', label: 'Oportunidades recomendadas', sub: 'Vagas compatíveis com o seu perfil', icon: BriefcaseBusiness, defaultOn: true },
  { id: 'career', label: 'Resultados profissionais', sub: 'Acompanhamentos aos 30, 90 e 180 dias', icon: Target, defaultOn: true },
];

export default function NotificacoesScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();
  const [prefs, setPrefs] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(NOTIF_ITEMS.map(i => [i.id, i.defaultOn]))
  );

  React.useEffect(() => {
    const loadPrefs = async () => {
      try {
        const stored = await AsyncStorage.getItem('maza_notif_prefs');
        if (stored) {
          setPrefs(JSON.parse(stored));
        }
      } catch (e) {
        console.error('Failed to load notification preferences', e);
      }
    };
    loadPrefs();
  }, []);

  const toggle = (id: string) => setPrefs(p => ({ ...p, [id]: !p[id] }));

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const save = async () => {
    setLoading(true);
    setSuccessMsg(null);
    try {
      await AsyncStorage.setItem('maza_notif_prefs', JSON.stringify(prefs));
    } catch (e) {
      console.error('Failed to save notification preferences', e);
    }
    setTimeout(() => {
      setLoading(false);
      setSuccessMsg('Preferências guardadas com sucesso!');
      setTimeout(() => setSuccessMsg(null), 3000);
    }, 600);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Notificações</Text>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
        <Text style={[styles.sectionLabel, { color: colors.textMuted }]}>Preferências de notificação</Text>
        <View style={[styles.card, { backgroundColor: colors.card }]}>
          {NOTIF_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <View key={item.id} style={[styles.row, index < NOTIF_ITEMS.length - 1 && { borderBottomWidth: 1, borderBottomColor: colors.border }]}>
                <View style={[styles.iconBg, { backgroundColor: colors.primary + '15' }]}>
                  <Icon size={18} color={colors.primary} />
                </View>
                <View style={styles.rowBody}>
                  <Text style={[styles.rowLabel, { color: colors.text }]}>{item.label}</Text>
                  <Text style={[styles.rowSub, { color: colors.textMuted }]}>{item.sub}</Text>
                </View>
                <Switch
                  value={prefs[item.id]}
                  onValueChange={() => toggle(item.id)}
                  trackColor={{ false: colors.border, true: colors.primary + '80' }}
                  thumbColor={prefs[item.id] ? colors.primary : (isDark ? '#475569' : '#CBD5E1')}
                />
              </View>
            );
          })}
        </View>

        {successMsg ? (
          <Text style={{ color: '#10B981', marginTop: 16, textAlign: 'center', fontWeight: '500' }}>
            {successMsg}
          </Text>
        ) : null}

        <TouchableOpacity 
          style={[styles.saveBtn, { backgroundColor: colors.primary, shadowColor: colors.primary }]} 
          onPress={save} 
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Guardar Preferências</Text>}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { marginRight: 12, padding: 4 },
  title: { fontSize: 22, fontWeight: 'bold' },
  sectionLabel: { fontSize: 12, fontWeight: '700', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 12 },
  card: { borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 16 },
  iconBg: { width: 40, height: 40, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14, flexShrink: 0 },
  rowBody: { flex: 1, marginRight: 12 },
  rowLabel: { fontSize: 15, fontWeight: '600', marginBottom: 2 },
  rowSub: { fontSize: 12 },
  saveBtn: {
    marginTop: 24, borderRadius: 16,
    paddingVertical: 16, alignItems: 'center',
    ...actionShadow,
  },
  saveBtnText: { color: '#FFF', fontWeight: '800', fontSize: 16 },
});
