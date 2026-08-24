import React, { useMemo, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, ActivityIndicator, Modal, FlatList } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { Search, MapPin, Briefcase, ExternalLink, Clock, ChevronRight, SlidersHorizontal, X, Sparkles } from 'lucide-react-native';
import api from '../services/api';
import { colors } from '../theme/colors';
import { decodeHtmlEntities } from '../utils/text';
import { bottomSafeSpace } from '../utils/safeArea';
import { useIsWideWeb } from '../utils/webViewport';
import YouthPortalBanner from '../components/YouthPortalBanner';

const TABS = ['Todos', 'EMPLOYMENT', 'INTERNSHIP', 'CHALLENGE'];
const TAB_LABELS: Record<string, string> = { Todos: 'Todos', EMPLOYMENT: 'Vagas', INTERNSHIP: 'Estágios', CHALLENGE: 'Desafios' };
const PROVINCES = ['Todas as Províncias', 'Maputo Cidade', 'Maputo Província', 'Gaza', 'Inhambane', 'Sofala', 'Manica', 'Tete', 'Zambézia', 'Nampula', 'Niassa', 'Cabo Delgado'];

const PROVINCE_KEYWORDS: Record<string, string[]> = {
  'Maputo Cidade': ['maputo'],
  'Maputo Província': ['maputo', 'matola', 'manhiça', 'boane', 'namaacha', 'marracuene', 'moamba', 'magude'],
  'Gaza': ['gaza', 'xai-xai', 'xai xai', 'chókwè', 'chokwe', 'macia', 'bilene', 'mandlakazi'],
  'Inhambane': ['inhambane', 'maxixe', 'vilankulo', 'vilanculos', 'massinga', 'zavala', 'morrumbene'],
  'Sofala': ['sofala', 'beira', 'dondo', 'nhamatanda', 'gorongosa', 'búzi', 'buzi', 'caia'],
  'Manica': ['manica', 'chimoio', 'gondola', 'sussundenga', 'báruè', 'barue'],
  'Tete': ['tete', 'moatize', 'songo', 'cahora bassa', 'mutarara'],
  'Zambézia': ['zambézia', 'zambezia', 'quelimane', 'mocuba', 'gurúè', 'gurue', 'alto molócuè', 'alto molocue', 'milange'],
  'Nampula': ['nampula', 'nacala', 'ilha de moçambique', 'angoche', 'monapo', 'ribáuè', 'ribaue'],
  'Niassa': ['niassa', 'lichinga', 'cuamba', 'mandimba', 'marrupa', 'lago'],
  'Cabo Delgado': ['cabo delgado', 'pemba', 'montepuez', 'mocímboa', 'mocimboa', 'palma', 'macomia', 'mueda', 'afungi', 'balama'],
};

function normalizeJob(job: any) {
  return {
    ...job,
    title: decodeHtmlEntities(job.title),
    company: decodeHtmlEntities(job.company),
    location: decodeHtmlEntities(job.location),
    source: decodeHtmlEntities(job.source),
  };
}

export default function JobsScreen({ navigation }: any) {
  const { colors: themeColors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const isWideWeb = useIsWideWeb(900);
  const [jobs, setJobs] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState('Todos');
  const [search, setSearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('Todas as Províncias');
  const [showProvinceModal, setShowProvinceModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      let isActive = true;
      (async () => {
        try {
          const { data } = await api.get<any[]>('/jobs?personalized=true', {
            headers: { 'Cache-Control': 'no-cache' },
          });
          if (isActive) {
            setJobs(Array.isArray(data) ? data.map(normalizeJob) : []);
            setLoading(false);
          }
        } catch {
          if (isActive) setLoading(false);
        }
      })();
      return () => { isActive = false; };
    }, [])
  );

  const filtered = useMemo(() => jobs.filter((j) => {
    const matchesType = activeTab === 'Todos' || j.type === activeTab;
    const matchesSearch = j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase());
    
    let matchesProvince = selectedProvince === 'Todas as Províncias';
    if (!matchesProvince && j.location) {
      const loc = j.location.toLowerCase();
      // First check if the exact province name is in the location
      if (loc.includes(selectedProvince.toLowerCase())) {
        matchesProvince = true;
      } else {
        // If not, check if any of the known cities/keywords for this province are in the location
        const keywords = PROVINCE_KEYWORDS[selectedProvince] || [];
        matchesProvince = keywords.some(kw => loc.includes(kw));
      }
    }

    return matchesType && matchesSearch && matchesProvince;
  }), [activeTab, jobs, search, selectedProvince]);

  const openJobDetail = (job: any) => {
    navigation.navigate('JobDetail', { jobId: job.id });
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={isWideWeb ? styles.webPage : undefined}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Oportunidades</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: themeColors.card }]}>
          <Search color={themeColors.textMuted} size={20} />
          <TextInput style={[styles.searchInput, { color: themeColors.text }]} placeholder="Pesquisar oportunidades" placeholderTextColor={themeColors.textMuted} value={search} onChangeText={setSearch} />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color={themeColors.textMuted} />
            </TouchableOpacity>
          )}
        </View>
        <TouchableOpacity 
          style={[
            styles.filterBtn, 
            { backgroundColor: themeColors.card },
            selectedProvince !== 'Todas as Províncias' && { backgroundColor: themeColors.primary + '15', borderColor: themeColors.primary, borderWidth: 1.5 }
          ]} 
          onPress={() => setShowProvinceModal(true)}
        >
          <SlidersHorizontal size={20} color={selectedProvince !== 'Todas as Províncias' ? themeColors.primary : themeColors.text} />
        </TouchableOpacity>
      </View>

      <YouthPortalBanner style={styles.youthPortalBanner} />

      <View style={styles.activeFiltersContainer}>
        {activeTab !== 'Todos' && (
          <View style={[styles.activeBadge, { backgroundColor: themeColors.card, borderColor: themeColors.primary }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Briefcase size={12} color={themeColors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.activeBadgeText, { color: themeColors.primary }]}>{TAB_LABELS[activeTab]}</Text>
            </View>
            <TouchableOpacity onPress={() => setActiveTab('Todos')}>
              <X size={14} color={themeColors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {selectedProvince !== 'Todas as Províncias' && (
          <View style={[styles.activeBadge, { backgroundColor: themeColors.card, borderColor: themeColors.primary }]}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <MapPin size={12} color={themeColors.primary} style={{ marginRight: 6 }} />
              <Text style={[styles.activeBadgeText, { color: themeColors.primary }]}>{selectedProvince}</Text>
            </View>
            <TouchableOpacity onPress={() => setSelectedProvince('Todas as Províncias')}>
              <X size={14} color={themeColors.primary} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {loading ? (
        <ActivityIndicator color={themeColors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          key={isWideWeb ? 'jobs-grid' : 'jobs-list'}
          data={filtered}
          keyExtractor={(job) => String(job.id)}
          numColumns={isWideWeb ? 2 : 1}
          columnWrapperStyle={isWideWeb ? styles.webJobRow : undefined}
          showsVerticalScrollIndicator={false}
          style={styles.list}
          initialNumToRender={8}
          maxToRenderPerBatch={8}
          windowSize={7}
          removeClippedSubviews
          ListEmptyComponent={<Text style={[styles.empty, { color: themeColors.textMuted }]}>Nenhuma oportunidade encontrada</Text>}
          ListFooterComponent={<View style={{ height: bottomSafeSpace(insets.bottom, 20) }} />}
          renderItem={({ item: job }) => (
            <TouchableOpacity key={job.id} style={[styles.jobCard, isWideWeb && styles.webJobCard, { backgroundColor: themeColors.card }]} onPress={() => openJobDetail(job)}>
              {job.matchScore >= 20 && (
                <View style={[styles.recommendedRow, { backgroundColor: themeColors.primary + '12' }]}>
                  <Sparkles size={13} color={themeColors.primary} />
                  <Text style={[styles.recommendedText, { color: themeColors.primary }]}>Recomendado para si · {job.matchScore}% compatível</Text>
                </View>
              )}
              <View style={styles.jobHeader}>
                <View style={[styles.companyLogo, { backgroundColor: isDark ? '#334155' : '#E0E7FF' }]}>
                  <Text style={[styles.logoText, { color: themeColors.primary }]}>{job.company.charAt(0)}</Text>
                </View>
                <View style={styles.jobInfo}>
                  <Text style={[styles.jobTitle, { color: themeColors.text }]} numberOfLines={2}>{job.title}</Text>
                  <Text style={[styles.companyName, { color: themeColors.textMuted }]} numberOfLines={1}>{job.company}</Text>
                </View>
              </View>
              {job.matchReasons?.[0] ? <Text style={[styles.matchReason, { color: themeColors.textMuted }]}>{job.matchReasons[0]}</Text> : null}
              <View style={styles.detailsRow}>
                {job.location && (
                  <View style={[styles.badge, { backgroundColor: isDark ? '#1e293b' : themeColors.background }]}>
                    <MapPin size={11} color={themeColors.textMuted} />
                    <Text style={[styles.badgeText, { color: themeColors.textMuted }]} numberOfLines={1}>{job.location}</Text>
                  </View>
                )}
                <View style={[styles.badge, { backgroundColor: isDark ? '#1e293b' : themeColors.background }]}>
                  <Briefcase size={11} color={themeColors.textMuted} />
                  <Text style={[styles.badgeText, { color: themeColors.textMuted }]}>{TAB_LABELS[job.type] ?? job.type}</Text>
                </View>
                {job.applyUrl && (
                  <View style={[styles.badge, { backgroundColor: isDark ? '#1e1b4b' : '#EEF2FF' }]}>
                    <ExternalLink size={11} color={themeColors.primary} />
                    <Text style={[styles.badgeText, { color: themeColors.primary }]} numberOfLines={1}>{job.source}</Text>
                  </View>
                )}
              </View>
              <View style={[styles.footer, { borderTopColor: themeColors.border }]}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Clock size={12} color={themeColors.textMuted} />
                  <Text style={[styles.deadline, { color: themeColors.textMuted }]}>  Publicado a: {new Date(job.createdAt).toLocaleDateString('pt-PT')}</Text>
                </View>
                <TouchableOpacity style={styles.detailBtn} onPress={() => openJobDetail(job)}>
                  <Text style={[styles.detailBtnText, { color: themeColors.primary }]}>{job.applyUrl ? 'Candidatar-se' : 'Ver detalhes'}</Text>
                  {job.applyUrl ? <ExternalLink size={14} color={themeColors.primary} style={{ marginLeft: 4 }} /> : <ChevronRight size={14} color={themeColors.primary} />}
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        />
      )}
      </View>

      <Modal visible={showProvinceModal} transparent animationType="slide" onRequestClose={() => setShowProvinceModal(false)}>
        <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setShowProvinceModal(false)}>
          <TouchableOpacity
            style={[styles.modalSheet, { backgroundColor: themeColors.card, paddingBottom: bottomSafeSpace(insets.bottom, 20) }]}
            activeOpacity={1}
          >
            <View style={[styles.modalHandle, { backgroundColor: themeColors.border }]} />
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Filtros</Text>
            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 450 }}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Tipo de Oportunidade</Text>
              <View style={styles.filterChipsRow}>
                {TABS.map((tab) => (
                  <TouchableOpacity 
                    key={tab} 
                    style={[
                      styles.filterChip, 
                      { backgroundColor: isDark ? '#1e293b' : '#F8FAFC', borderColor: isDark ? '#334155' : '#E2E8F0' },
                      activeTab === tab && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
                    ]}
                    onPress={() => setActiveTab(tab)}
                  >
                    <Text style={[
                      styles.filterChipText, 
                      { color: themeColors.textMuted }, 
                      activeTab === tab && { color: '#fff', fontWeight: 'bold' }
                    ]}>
                      {TAB_LABELS[tab]}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={[styles.sectionTitle, { color: themeColors.text, marginTop: 16 }]}>Província</Text>
              {PROVINCES.map(prov => (
                <TouchableOpacity 
                  key={prov} 
                  style={[
                    styles.pwOption, 
                    { backgroundColor: isDark ? '#1e293b' : '#F8FAFC' },
                    selectedProvince === prov && { backgroundColor: themeColors.primary + '15', borderColor: themeColors.primary + '40', borderWidth: 1 }
                  ]}
                  onPress={() => { setSelectedProvince(prov); setShowProvinceModal(false); }}
                >
                  <MapPin size={18} color={selectedProvince === prov ? themeColors.primary : themeColors.textMuted} />
                  <Text style={[styles.pwOptionName, { color: themeColors.text }, selectedProvince === prov && { color: themeColors.primary, fontWeight: '700' }]}>{prov}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <TouchableOpacity style={[styles.modalClose, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]} onPress={() => setShowProvinceModal(false)}>
              <Text style={[styles.modalCloseText, { color: themeColors.textMuted }]}>Fechar</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webPage: { flex: 1, width: '100%', maxWidth: 1180, alignSelf: 'center', paddingTop: 20 },
  header: { padding: 24, paddingBottom: 12 },
  title: { fontSize: 28, fontWeight: 'bold' },
  searchRow: { flexDirection: 'row', alignItems: 'center', marginHorizontal: 24, marginBottom: 14, gap: 10 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 16, paddingHorizontal: 16, height: 50, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  searchInput: { flex: 1, marginLeft: 12, fontSize: 16 },
  filterBtn: { borderRadius: 16, width: 50, height: 50, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  youthPortalBanner: { marginHorizontal: 24, marginBottom: 14 },
  activeFiltersContainer: { flexDirection: 'row', flexWrap: 'wrap', marginHorizontal: 24, marginBottom: 14, gap: 8 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5, gap: 8 },
  activeBadgeText: { fontSize: 13, fontWeight: '700' },
  list: { paddingHorizontal: 24 },
  empty: { textAlign: 'center', marginTop: 40, fontSize: 16 },
  jobCard: { borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 },
  webJobRow: { gap: 16 },
  webJobCard: { flex: 1, minWidth: 0, maxWidth: '49.3%', borderRadius: 20, shadowOpacity: 0.07, shadowRadius: 14 },
  recommendedRow: { alignSelf: 'flex-start', flexDirection: 'row', alignItems: 'center', gap: 5, borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5, marginBottom: 12 },
  recommendedText: { fontSize: 11, fontWeight: '700' },
  matchReason: { fontSize: 12, marginTop: -4, marginBottom: 12 },
  jobHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 14 },
  companyLogo: { width: 48, height: 48, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  logoText: { fontSize: 20, fontWeight: 'bold' },
  jobInfo: { flex: 1 },
  jobTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  companyName: { fontSize: 13 },
  detailsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 14 },
  badge: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  badgeText: { fontSize: 11, marginLeft: 4, maxWidth: 130 },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 12 },
  deadline: { fontSize: 12 },
  detailBtn: { flexDirection: 'row', alignItems: 'center' },
  detailBtnText: { fontWeight: 'bold', fontSize: 13 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  sectionTitle: { fontSize: 14, fontWeight: '600', marginBottom: 10 },
  filterChipsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 8 },
  filterChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1 },
  filterChipText: { fontSize: 13, fontWeight: '500' },
  pwOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, paddingHorizontal: 16, borderRadius: 12, marginBottom: 8, gap: 12 },
  pwOptionName: { fontSize: 15, fontWeight: '500' },
  modalClose: { marginTop: 10, paddingVertical: 14, borderRadius: 30, alignItems: 'center' },
  modalCloseText: { fontWeight: '600', fontSize: 15 },
});
