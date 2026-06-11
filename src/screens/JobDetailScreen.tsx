import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { colors } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MapPin, Briefcase, Calendar, Users, ExternalLink } from 'lucide-react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../services/api';
import { decodeHtmlEntities } from '../utils/text';

const TYPE_LABELS: Record<string, string> = { EMPLOYMENT: 'Vaga de Emprego', INTERNSHIP: 'Estágio', CHALLENGE: 'Desafio', GIG: 'Trabalho Freelance' };
const DESCRIPTION_FALLBACKS = new Set(['Ver detalhes no site oficial.', 'Ver detalhes no site original.']);

const formatDate = (date?: string | null) => date ? new Date(date).toLocaleDateString('pt-PT') : null;
const cleanText = (value: unknown) => decodeHtmlEntities(value).replace(/\n{3,}/g, '\n\n').trim();
const getApplicationCount = (job: any) => job?.applicationClicks ?? job?._count?.applications ?? 0;

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

  const description = cleanText(job?.description);
  const hasUsefulDescription = description && !DESCRIPTION_FALLBACKS.has(description);
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
            <Text style={styles.jobTitle}>{cleanText(job.title)}</Text>
            <Text style={styles.companyName}>{cleanText(job.company)}</Text>
            <View style={styles.typeBadge}>
              <Text style={styles.typeText}>{TYPE_LABELS[job.type] ?? job.type}</Text>
            </View>
          </View>

          <View style={styles.metaGrid}>
            {job.location && <View style={styles.metaItem}><MapPin size={18} color={colors.primary} /><Text style={styles.metaText}>{cleanText(job.location)}</Text></View>}
            <View style={styles.metaItem}><Users size={18} color={colors.primary} /><Text style={styles.metaText}>{getApplicationCount(job)} candidaturas</Text></View>
            {job.createdAt && <View style={styles.metaItem}><Calendar size={18} color={colors.primary} /><Text style={styles.metaText}>Publicado: {formatDate(job.createdAt)}</Text></View>}
            {job.deadline && <View style={styles.metaItem}><Calendar size={18} color={colors.primary} /><Text style={styles.metaText}>Prazo: {formatDate(job.deadline)}</Text></View>}
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Descrição</Text>
            <Text style={styles.description}>
              {hasUsefulDescription ? description : 'Resumo ainda não disponível. Abra o site oficial para ver todos os detalhes da candidatura.'}
            </Text>
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
  backBtn: { padding: 20, paddingBottom: 0 },
  backText: { color: colors.primary, fontSize: 16 },
  hero: { alignItems: 'center', padding: 32, backgroundColor: colors.white, borderBottomWidth: 1, borderColor: colors.border },
  logoLarge: { width: 72, height: 72, backgroundColor: '#E0E7FF', borderRadius: 20, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  logoText: { fontSize: 32, fontWeight: 'bold', color: colors.primary },
  jobTitle: { fontSize: 22, fontWeight: 'bold', color: colors.text, textAlign: 'center', marginBottom: 6 },
  companyName: { fontSize: 15, color: colors.textMuted, marginBottom: 12 },
  typeBadge: { backgroundColor: '#EEF2FF', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  typeText: { color: '#5D5FEF', fontWeight: 'bold', fontSize: 13 },
  metaGrid: { flexDirection: 'row', flexWrap: 'wrap', padding: 16, gap: 12, backgroundColor: colors.white, borderBottomWidth: 1, borderColor: colors.border },
  metaItem: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.background, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 12 },
  metaText: { fontSize: 13, color: colors.text, marginLeft: 6, fontWeight: '500' },
  section: { padding: 24 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: colors.text, marginBottom: 12 },
  description: { fontSize: 15, color: colors.text, lineHeight: 24, opacity: 0.8 },
  applyBtn: { backgroundColor: colors.primary, marginHorizontal: 24, paddingVertical: 16, borderRadius: 30, alignItems: 'center', shadowColor: colors.primary, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  applyBtnDisabled: { backgroundColor: colors.success },
  applyText: { color: colors.white, fontWeight: 'bold', fontSize: 18 },
  error: { textAlign: 'center', color: colors.textMuted, marginTop: 40 }
});
