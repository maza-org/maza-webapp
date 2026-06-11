import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FileText, Download, ChevronLeft, Award } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { downloadCertificatePDF } from '../utils/certificateGenerator';
import CertificatePreview from '../components/CertificatePreview';

export default function MyCertificatesScreen({ navigation }: any) {
  const { user } = useAuth();
  const { colors, isDark } = useTheme();
  const [certificates, setCertificates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState<string | null>(null);
  const [selectedCert, setSelectedCert] = useState<any | null>(null);

  useEffect(() => {
    (async () => {
      try {
        const res = await api.get('/certificates/my');
        setCertificates(res.data);
      } catch (e) {
        console.error('[Certificates] Error fetching:', e);
      }
      setLoading(false);
    })();
  }, []);

  const handleDownload = async (cert: any) => {
    setGenerating(cert.id);
    try {
      await downloadCertificatePDF({
        studentName: user?.name ?? user?.phone ?? 'Estudante',
        courseTitle: cert.course?.title ?? cert.courseName ?? 'Curso',
        instructor: cert.course?.instructor ?? '',
        issuedAt: cert.issuedAt ?? cert.createdAt ?? new Date().toISOString(),
        courseId: cert.courseId ?? cert.course?.id ?? '',
        certificateId: cert.id ?? '',
      });
    } catch (e) {
      Alert.alert('Erro', 'Não foi possível gerar o certificado.');
    }
    setGenerating(null);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <Modal visible={!!selectedCert} animationType="slide" transparent>
        <View style={styles.previewOverlay}>
          {selectedCert && (
            <>
              <CertificatePreview
                style={styles.previewCertificate}
                studentName={user?.name ?? user?.phone ?? 'Estudante'}
                courseTitle={selectedCert.course?.title ?? selectedCert.courseName ?? 'Curso'}
                instructor={selectedCert.course?.instructor ?? 'MAZA'}
                issuedAt={selectedCert.issuedAt ?? selectedCert.createdAt ?? new Date().toISOString()}
                courseId={selectedCert.courseId ?? selectedCert.course?.id ?? ''}
                certificateId={selectedCert.id ?? ''}
              />
              <View style={styles.previewActions}>
                <TouchableOpacity
                  style={[styles.previewDownload, { backgroundColor: colors.primary }]}
                  onPress={() => handleDownload(selectedCert)}
                  disabled={generating === selectedCert.id}
                >
                  {generating === selectedCert.id
                    ? <ActivityIndicator size="small" color="#FFF" />
                    : <Download size={18} color="#FFF" />}
                  <Text style={styles.previewDownloadText}>{generating === selectedCert.id ? 'A gerar PDF...' : 'Guardar PDF'}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.previewClose} onPress={() => setSelectedCert(null)}>
                  <Text style={styles.previewCloseText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>

      <View style={[styles.header, { borderBottomColor: colors.border }]}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} activeOpacity={0.7}>
          <ChevronLeft size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: colors.text }]}>Os meus Certificados</Text>
      </View>

      {loading ? (
        <ActivityIndicator color={colors.primary} style={{ marginTop: 40 }} />
      ) : certificates.length === 0 ? (
        <View style={styles.empty}>
          <Award size={56} color={colors.textMuted} />
          <Text style={[styles.emptyTitle, { color: colors.text }]}>Sem certificados ainda</Text>
          <Text style={[styles.emptySub, { color: colors.textMuted }]}>Complete um curso para ganhar o seu primeiro certificado.</Text>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: 24, paddingBottom: 60 }}>
          {certificates.map((cert) => (
            <TouchableOpacity
              key={cert.id}
              style={[styles.card, { backgroundColor: colors.card }]}
              onPress={() => setSelectedCert(cert)}
              activeOpacity={0.82}
            >
              <View style={[styles.cardIcon, { backgroundColor: colors.primary + '18' }]}>
                <FileText size={28} color={colors.primary} />
              </View>
              <View style={styles.cardBody}>
                <Text style={[styles.cardCourse, { color: colors.text }]} numberOfLines={2}>{cert.course?.title ?? cert.courseName ?? 'Curso'}</Text>
                <Text style={[styles.cardDate, { color: colors.textMuted }]}>
                  Emitido em {new Date(cert.issuedAt ?? cert.createdAt).toLocaleDateString('pt-PT')}
                </Text>
                <Text style={[styles.cardId, { color: colors.textMuted }]}>ID: MAZA-{cert.id?.slice(0, 8).toUpperCase()}</Text>
              </View>
              <TouchableOpacity
                style={[styles.dlBtn, { backgroundColor: colors.primary }]}
                onPress={(event: any) => {
                  event?.stopPropagation?.();
                  handleDownload(cert);
                }}
                disabled={generating === cert.id}
                activeOpacity={0.8}
              >
                {generating === cert.id
                  ? <ActivityIndicator size="small" color="#FFF" />
                  : <Download size={16} color="#FFF" />}
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  previewOverlay: { flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.95)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  previewCertificate: { width: '100%', maxWidth: 800, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 30, elevation: 20 },
  previewActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  previewDownload: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 22, paddingVertical: 14, borderRadius: 10 },
  previewDownloadText: { color: '#fff', fontWeight: 'bold', marginLeft: 8 },
  previewClose: { backgroundColor: '#374151', paddingHorizontal: 22, paddingVertical: 14, borderRadius: 10 },
  previewCloseText: { color: '#fff', fontWeight: 'bold' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 20, paddingBottom: 12, borderBottomWidth: 1 },
  backBtn: { marginRight: 12, padding: 4 },
  title: { fontSize: 22, fontWeight: 'bold' },
  empty: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 16, marginBottom: 8 },
  emptySub: { fontSize: 14, textAlign: 'center', lineHeight: 20 },
  card: {
    flexDirection: 'row', alignItems: 'center',
    borderRadius: 16, padding: 16,
    marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardIcon: {
    width: 52, height: 52, borderRadius: 14,
    justifyContent: 'center', alignItems: 'center', marginRight: 14, flexShrink: 0,
  },
  cardBody: { flex: 1, marginRight: 10 },
  cardCourse: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  cardDate: { fontSize: 12, marginBottom: 2 },
  cardId: { fontSize: 11, fontFamily: 'monospace' },
  dlBtn: {
    width: 38, height: 38, borderRadius: 12,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
});
