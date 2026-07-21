import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { colors } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Briefcase, Calendar, Users, ExternalLink } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { decodeHtmlEntities } from '../utils/text';

const TYPE_LABELS: Record<string, string> = { EMPLOYMENT: 'Emprego', INTERNSHIP: 'Estágio', CHALLENGE: 'Desafio', GIG: 'Freelance', Vagas: 'Vaga' };
const DESCRIPTION_FALLBACKS = new Set(['Ver detalhes no site oficial.', 'Ver detalhes no site original.']);
const DETAIL_LABELS = ['Entidade', 'Local', 'Categoria', 'Publicado', 'Expira'];

const formatDate = (date?: string | null) => date ? new Date(date).toLocaleDateString('pt-PT') : null;
const cleanText = (value: unknown) => decodeHtmlEntities(value).replace(/\n{3,}/g, '\n\n').trim();
const getApplicationCount = (job: any) => job?.applicationClicks ?? job?._count?.applications ?? 0;
const displayCompanyName = (value: unknown) => {
  const company = cleanText(value);
  return !company || /an[oó]nima/i.test(company) ? 'Empresa não identificada' : company;
};

function formatJobDescription(job: any) {
  const rawDescription = cleanText(job?.description);
  const normalized = DETAIL_LABELS.reduce(
    (text, label) => text.replace(new RegExp(`\\s+${label}\\s*:`, 'gi'), `\n${label}:`),
    rawDescription,
  );
  const details: Record<string, string> = {};
  const prose: string[] = [];

  normalized.split(/\n+/).map((line) => line.trim()).filter(Boolean).forEach((line) => {
    const match = line.match(/^(Entidade|Local|Categoria|Publicado|Expira)\s*:\s*(.+)$/i);
    if (match) {
      details[match[1].toLowerCase()] = match[2].trim();
    } else {
      prose.push(line);
    }
  });

  const joinedProse = prose.join(' ').trim();
  const isBoilerplate = /encontra mais vagas|emprego\.co\.mz|está a recrutar\s*:/i.test(joinedProse);
  const hasUsefulDescription = joinedProse && !DESCRIPTION_FALLBACKS.has(joinedProse);
  const company = cleanText(job?.company);
  const title = cleanText(job?.title);
  const location = cleanText(job?.location);
  const subject = company && !/an[oó]nima/i.test(company) ? company : 'Esta organização';
  const fallback = `${subject} procura profissionais para a função de ${title}${location ? `, em ${location}` : ''}.`;

  return {
    paragraphs: isBoilerplate || !hasUsefulDescription ? [fallback] : prose,
    category: details.categoria,
  };
}

export default function JobDetailScreen({ route, navigation }: any) {
  const { jobId } = route.params;
  const [job, setJob] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get(`/jobs/${jobId}`);
        setJob(res.data);
      } catch {}
      setLoading(false);
    })();
  }, [jobId]);

  const completeApply = async () => {
    setApplying(true);

    if (job?.applyUrl) {
      setApplied(true);
      setJob((prev: any) => prev ? { ...prev, applicationClicks: getApplicationCount(prev) + 1 } : prev);
      const registerClick = api.post(`/jobs/${jobId}/apply`)
        .then((res) => {
          if (res.data?.job) setJob(res.data.job);
          else if (typeof res.data?.applicationClicks === 'number') {
            setJob((prev: any) => prev ? { ...prev, applicationClicks: res.data.applicationClicks } : prev);
          }
        })
        .catch(() => {});
      try {
        await Linking.openURL(job.applyUrl);
      } catch (err) {
        Alert.alert('Erro', 'Não foi possível abrir o link externo. Tente novamente.');
      } finally {
        registerClick.catch(() => {});
        setApplying(false);
      }
      return;
    }

    try {
      const res = await api.post(`/jobs/${jobId}/apply`);
      setApplied(true);
      if (res.data?.job) setJob(res.data.job);
      Alert.alert('Candidatura enviada!', 'A sua candidatura foi registada com sucesso. Boa sorte!');
    } catch (err: any) {
      const msg = err?.response?.data?.error;
      if (msg === 'Already applied') {
        setApplied(true);
        Alert.alert('Já candidatou-se', 'Já enviou a sua candidatura para esta oportunidade.');
      } else {
        Alert.alert('Erro', 'Não foi possível registar a candidatura. Tente novamente.');
      }
    } finally {
      setApplying(false);
    }
  };

  const handleApply = async () => {
    await completeApply();
  };

  const formattedDescription = formatJobDescription(job);
  return (
    <SafeAreaView style={styles.container}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : job ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.hero}>
            <View style={styles.logoLarge}><Text style={styles.logoText}>{cleanText(job.company).charAt(0)}</Text></View>
            <View style={styles.heroContent}>
              <Text style={styles.jobTitle}>{cleanText(job.title)}</Text>
              <Text style={styles.companyName}>{displayCompanyName(job.company)}</Text>
              <View style={styles.typeBadge}>
                <Text style={styles.typeText}>{TYPE_LABELS[job.type] ?? job.type}</Text>
              </View>
            </View>
          </View>

          <View style={styles.metaGrid}>
            {job.location && <View style={styles.metaItem}><MapPin size={18} color={colors.primary} /><Text style={styles.metaText}>{cleanText(job.location)}</Text></View>}
            <View style={styles.metaItem}><Users size={18} color={colors.primary} /><Text style={styles.metaText}>{getApplicationCount(job)} candidaturas</Text></View>
            {job.createdAt && <View style={styles.metaItem}><Calendar size={18} color={colors.primary} /><Text style={styles.metaText}>Publicado: {formatDate(job.createdAt)}</Text></View>}
            {job.deadline && <View style={styles.metaItem}><Calendar size={18} color={colors.primary} /><Text style={styles.metaText}>Prazo: {formatDate(job.deadline)}</Text></View>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sobre a oportunidade</Text>
            {formattedDescription.paragraphs.map((paragraph, index) => (
              <Text key={`${index}-${paragraph.slice(0, 24)}`} style={styles.description}>{paragraph}</Text>
            ))}
            {formattedDescription.category ? (
              <View style={styles.detailRow}>
                <Text style={styles.detailLabel}>Área</Text>
                <Text style={styles.detailValue}>{formattedDescription.category}</Text>
              </View>
            ) : null}
            {job.applyUrl ? (
              <Text style={styles.sourceNote}>Os requisitos completos estão disponíveis no site oficial.</Text>
            ) : null}
          </View>

          <TouchableOpacity style={[styles.applyBtn, (applied || applying) && !job?.applyUrl && styles.applyBtnDisabled]} onPress={handleApply} disabled={(applied || applying) && !job?.applyUrl}>
            {applying ? <ActivityIndicator color={colors.white} /> : (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                {applied && !job?.applyUrl ? <Ionicons name="checkmark-circle" size={20} color={colors.white} /> : null}
                <Text style={styles.applyText}>
                  {job?.applyUrl ? 'Candidatar-se no Site Oficial' : (applied ? 'Candidatura Enviada' : 'Candidatar-me')}
                </Text>
                {job?.applyUrl && <ExternalLink size={18} color={colors.white} />}
              </View>
            )}
          </TouchableOpacity>
          <View style={{ height: 40 }} />
        </ScrollView>
      ) : (
        <Text style={styles.error}>Oportunidade não encontrada</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  backBtn: { paddingHorizontal: 18, paddingTop: 12, paddingBottom: 8 },
  backText: { color: colors.primary, fontSize: 14, fontWeight: '600' },
  hero: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 16,
    padding: 16,
    backgroundColor: colors.white,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: colors.border,
  },
  heroContent: { flex: 1, minWidth: 0 },
  logoLarge: { width: 56, height: 56, backgroundColor: '#E0E7FF', borderRadius: 14, justifyContent: 'center', alignItems: 'center', marginRight: 14 },
  logoText: { fontSize: 24, fontWeight: '700', color: colors.primary },
  jobTitle: { fontSize: 18, lineHeight: 23, fontWeight: '700', color: colors.text, marginBottom: 3 },
  companyName: { fontSize: 13, color: colors.textMuted, marginBottom: 8 },
  typeBadge: { alignSelf: 'flex-start', backgroundColor: '#EEF2FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  typeText: { color: '#4F46E5', fontWeight: '600', fontSize: 11 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, paddingVertical: 14, gap: 8 },
  metaItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, paddingHorizontal: 10, paddingVertical: 7, borderRadius: 10, borderWidth: 1, borderColor: colors.border },
  metaText: { fontSize: 12, color: colors.text, marginLeft: 5, fontWeight: '500' },
  section: { marginHorizontal: 16, padding: 18, backgroundColor: colors.white, borderRadius: 16, borderWidth: 1, borderColor: colors.border },
  sectionTitle: { fontSize: 17, fontWeight: '700', color: colors.text, marginBottom: 10 },
  description: { fontSize: 14, color: colors.text, lineHeight: 21, marginBottom: 10, opacity: 0.82 },
  detailRow: { flexDirection: 'row', alignItems: 'flex-start', paddingTop: 10, marginTop: 2, borderTopWidth: 1, borderTopColor: colors.border },
  detailLabel: { width: 68, fontSize: 12, fontWeight: '600', color: colors.textMuted },
  detailValue: { flex: 1, fontSize: 12, color: colors.text, lineHeight: 18 },
  sourceNote: { fontSize: 12, lineHeight: 18, color: colors.textMuted, marginTop: 10 },
  applyBtn: { backgroundColor: colors.primary, marginHorizontal: 16, marginTop: 16, paddingVertical: 14, borderRadius: 14, alignItems: 'center', shadowColor: colors.primary, shadowOpacity: 0.2, shadowRadius: 8, elevation: 3 },
  applyBtnDisabled: { backgroundColor: colors.success },
  applyText: { color: colors.white, fontWeight: '700', fontSize: 15 },
  error: { textAlign: 'center', color: colors.textMuted, marginTop: 40 }
});
