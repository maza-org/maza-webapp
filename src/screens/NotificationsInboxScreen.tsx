import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronLeft, Settings, BellOff } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';

export default function NotificationsInboxScreen({ navigation }: any) {
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Notificações</Text>
        
        <TouchableOpacity 
          onPress={() => navigation.navigate('Notificacoes')} 
          style={styles.settingsBtn} 
          activeOpacity={0.7}
        >
          <Settings size={22} color={colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.emptyState}>
        <View style={[styles.emptyIconBg, { backgroundColor: isDark ? '#1e293b' : '#F1F5F9' }]}>
          <BellOff size={40} color={colors.textMuted} />
        </View>
        <Text style={[styles.emptyTitle, { color: colors.text }]}>Sem notificações</Text>
        <Text style={[styles.emptyText, { color: colors.textMuted }]}>
          Quando tiver novidades sobre cursos, vagas ou conquistas, elas aparecerão aqui.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    justifyContent: 'space-between',
    padding: 20, 
    paddingBottom: 12, 
    borderBottomWidth: 1 
  },
  backBtn: { padding: 4 },
  title: { fontSize: 22, fontWeight: 'bold', flex: 1, marginLeft: 12 },
  settingsBtn: { padding: 4 },
  emptyState: { 
    flex: 1, 
    justifyContent: 'center', 
    alignItems: 'center', 
    paddingHorizontal: 40 
  },
  emptyIconBg: {
    width: 80, height: 80, borderRadius: 40,
    justifyContent: 'center', alignItems: 'center',
    marginBottom: 20
  },
  emptyTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 8 },
  emptyText: { fontSize: 14, textAlign: 'center', lineHeight: 22 },
});
