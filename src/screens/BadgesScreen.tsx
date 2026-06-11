import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, TrendingUp, Trophy, Lock, BookOpen, FileText } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import api from '../services/api';
import { colors } from '../theme/colors';
import CertificatePreview from '../components/CertificatePreview';

// ── Palette of rich, dark card backgrounds (one per pathway) ─────────────────
const CARD_PALETTE = [
  '#0F172A', // deep navy
  '#1A0533', // deep purple
  '#002B36', // deep teal
  '#1A1000', // deep amber
  '#001A12', // deep emerald
  '#1A0010', // deep rose
  '#0A1A2E', // midnight blue
  '#1A1500', // deep gold
];

const ACCENT_PALETTE = [
  '#3B82F6', // blue
  '#8B5CF6', // purple
  '#06B6D4', // cyan
  '#F59E0B', // amber
  '#10B981', // emerald
  '#EC4899', // rose
  '#6366F1', // indigo
  '#EAB308', // yellow
];

function getPathwayCardColors(pathwayId: string, pathwayColor?: string | null) {
  // Hash the ID to pick a deterministic palette entry
  let hash = 0;
  for (let i = 0; i < pathwayId.length; i++) {
    hash = (hash * 31 + pathwayId.charCodeAt(i)) >>> 0;
  }
  const idx = hash % CARD_PALETTE.length;
  return {
    bg: CARD_PALETTE[idx],
    accent: pathwayColor || ACCENT_PALETTE[idx],
  };
}

export default function BadgesScreen({ navigation }: any) {
  const { colors: themeColors, isDark } = useTheme();
  const { user, updateUser } = useAuth();
  const [pathway, setPathway] = useState<any>(null);
  const [allPathways, setAllPathways] = useState<any[]>([]);
  const [completedPathways, setCompletedPathways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [unlockModalVisible, setUnlockModalVisible] = useState(false);
  const [selectedPathway, setSelectedPathway] = useState<any>(null);
  const [unlocking, setUnlocking] = useState(false);
  const [startingAssessment, setStartingAssessment] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<any | null>(null);

  const fetchPathwayData = useCallback(async () => {
    try {
      const [myRes, allRes, completedRes, certificatesRes] = await Promise.all([
        api.get('/pathways/my').catch(() => ({ data: { pathway: null } })),
        api.get('/pathways'),
        api.get('/pathways/completed').catch(() => ({ data: [] })),
        api.get('/certificates/my').catch(() => ({ data: [] })),
      ]);
      setPathway(myRes.data?.pathway);
      setAllPathways(allRes.data || []);
      setCompletedPathways(completedRes.data || []);
      setCertificates(certificatesRes.data || []);
    } catch (e) {
      console.log('Error fetching pathway in Gamification:', e);
    }
    setLoading(false);
  }, []);

  useFocusEffect(
    useCallback(() => {
      fetchPathwayData();
    }, [fetchPathwayData])
  );

  const profile = user?.profile;
  const mazaImpact = user?.impact?.averageImpactPercent ?? 0;
  const points = profile?.totalPoints ?? 0;
  const courses = pathway?.courses ?? [];
  const isCurrentCompleted = courses.length > 0 && courses.every((pc: any) => pc.isCompleted && pc.progress >= 100);

  const numCompleted = completedPathways.length + (isCurrentCompleted ? 1 : 0);
  const ranking = numCompleted >= 2 ? 'Colosso' : numCompleted === 1 ? 'Maza' : 'Calouro';
  const rankingColor = numCompleted >= 2 ? '#F59E0B' : numCompleted === 1 ? '#94A3B8' : '#D97706'; 

  const availablePathways = allPathways.filter((p) => 
    p.id !== pathway?.id && !completedPathways.some(cp => cp.id === p.id)
  );

  const startSelfAssessment = async () => {
    setStartingAssessment(true);
    try {
      const res = await api.post('/bot/reset');
      if (res.data.user && updateUser) {
        await updateUser(res.data.user);
      }
      navigation.navigate('BotAssessment');
    } catch (e) {
      console.error('Failed to start assessment:', e);
      navigation.navigate('BotAssessment');
    } finally {
      setStartingAssessment(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header Hero */}
        <View style={[styles.header, { backgroundColor: themeColors.primary }]}>
          <Text style={[styles.headerTitle, { color: '#fff' }]} numberOfLines={1} adjustsFontSizeToFit>As Suas Conquistas e Jornadas</Text>
          <Text style={[styles.headerSub, { color: 'rgba(255,255,255,0.8)' }]} numberOfLines={1} adjustsFontSizeToFit>Acompanhe o seu progresso e alcance novos níveis!</Text>
          
          <View style={[styles.statsCard, { backgroundColor: themeColors.card }]}>
            <View style={styles.statCol}>
              <TrendingUp color={themeColors.success} size={32} />
              <Text style={[styles.statValue, { color: themeColors.text }]}>{mazaImpact}%</Text>
              <Text style={[styles.statLabel, { color: themeColors.textMuted }]}>Impactado</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
            <View style={styles.statCol}>
              <Award color={themeColors.secondary} size={32} />
              <Text style={[styles.statValue, { color: themeColors.text }]}>{points}</Text>
              <Text style={[styles.statLabel, { color: themeColors.textMuted }]}>Pontos</Text>
            </View>
            <View style={[styles.divider, { backgroundColor: themeColors.border }]} />
            <View style={styles.statCol}>
              <Trophy color={rankingColor} size={32} />
              <Text style={[styles.statValue, { color: themeColors.text }]}>{ranking}</Text>
              <Text style={[styles.statLabel, { color: themeColors.textMuted }]}>Nível</Text>
            </View>
          </View>
        </View>

        {loading ? (
          <ActivityIndicator color={themeColors.primary} style={{ marginTop: 40 }} />
        ) : pathway ? (
          <>
            {/* Current Path — premium card with courses inside */}
            <View style={styles.firstSection}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Jornada Atual</Text>
              {(() => {
                const completedCount = courses.filter((pc: any) => pc.isCompleted && pc.progress >= 100).length;
                const nextCourse = courses.find((pc: any) => !pc.isLocked && !(pc.isCompleted && pc.progress >= 100));
                const cardColors = getPathwayCardColors(pathway.id, pathway.color);
                return (
                  <View style={[styles.completedPathCard, { backgroundColor: cardColors.bg }]}>
                    {/* MAZA watermark */}
                    <Image
                      source={require('../../assets/maza-icon-branco.png')}
                      style={styles.cardWatermark}
                      resizeMode="contain"
                    />
                    {/* Top accent strip */}
                    <View style={[styles.completedCardAccent, { backgroundColor: isCurrentCompleted ? '#22C55E' : cardColors.accent }]} />

                    {/* Header row */}
                    <View style={styles.completedCardHeader}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.completedCardTitle} numberOfLines={2}>{pathway.name}</Text>
                        <Text style={styles.completedCardMeta}>
                          {completedCount}/{courses.length} curso{courses.length !== 1 ? 's' : ''} concluído{completedCount !== 1 ? 's' : ''}
                        </Text>
                      </View>
                      {isCurrentCompleted ? (
                        <View style={styles.completedBadge}>
                          <Text style={styles.completedBadgeText}>✓ Concluída</Text>
                        </View>
                      ) : (
                        <View style={[styles.completedBadge, { backgroundColor: cardColors.accent }]}>
                          <Text style={styles.completedBadgeText}>Em curso</Text>
                        </View>
                      )}
                    </View>

                    {!isCurrentCompleted && nextCourse && (
                      <TouchableOpacity
                        style={[styles.continueJourneyBtn, { backgroundColor: cardColors.accent }]}
                        onPress={() => navigation.navigate('CourseDetail', {
                          courseId: nextCourse.courseId || nextCourse.id,
                          title: nextCourse.course?.title ?? nextCourse.title,
                          course: nextCourse.course ?? nextCourse,
                        })}
                      >
                        <BookOpen size={14} color="#fff" />
                        <Text style={styles.continueJourneyText}>Continuar jornada</Text>
                      </TouchableOpacity>
                    )}

                    {/* Node progress map */}
                    <View style={[styles.pathMap, { marginVertical: 16 }]}>
                      {courses.slice(0, 5).map((pc: any, idx: number, arr: any[]) => {
                        const isCompleted = pc.isCompleted && pc.progress >= 100;
                        const isLocked = pc.isLocked;
                        const courseImpact = pc.impact?.impactPercent;
                        const isCurrent = !isLocked && !isCompleted;
                        return (
                          <React.Fragment key={pc.id || idx}>
                            {isCompleted ? (
                              <View style={[styles.nodeCompleted, { backgroundColor: '#22C55E' }]}><Text style={styles.nodeText}>✓</Text></View>
                            ) : isCurrent ? (
                              <View style={[styles.nodeCurrent, { backgroundColor: themeColors.secondary }]}><Award size={18} color="#fff" /></View>
                            ) : (
                              <View style={[styles.nodeLocked, { backgroundColor: 'rgba(255,255,255,0.1)' }]}><Lock size={14} color="rgba(255,255,255,0.4)" /></View>
                            )}
                            {idx < arr.length - 1 && (
                              isCompleted
                                ? <View style={[styles.lineCompleted, { backgroundColor: '#22C55E', flex: 1, maxWidth: 32 }]} />
                                : <View style={[styles.lineLocked, { backgroundColor: 'rgba(255,255,255,0.2)', flex: 1, maxWidth: 32 }]} />
                            )}
                          </React.Fragment>
                        );
                      })}
                    </View>

                    {/* Course list inside the card */}
                    <View style={styles.completedCourseList}>
                      {courses.map((pc: any, idx: number) => {
                        const isCompleted = pc.isCompleted && pc.progress >= 100;
                        const isLocked = pc.isLocked;
                        const courseImpact = pc.impact?.impactPercent;
                        return (
                          <TouchableOpacity
                            key={pc.id || idx}
                            disabled={isLocked}
                            style={[
                              styles.completedCourseRow,
                              idx < courses.length - 1 && styles.completedCourseRowBorder,
                              isLocked && { opacity: 0.45 },
                            ]}
                            onPress={() => navigation.navigate('CourseDetail', { courseId: pc.courseId || pc.id, title: pc.course?.title, course: pc.course ?? pc })}
                          >
                            <View style={[
                              styles.completedCourseCheck,
                              isCompleted && { backgroundColor: 'rgba(34,197,94,0.15)', borderColor: '#22C55E' },
                              isLocked && { backgroundColor: 'rgba(255,255,255,0.05)', borderColor: 'rgba(255,255,255,0.2)' },
                              !isCompleted && !isLocked && { backgroundColor: `${themeColors.primary}20`, borderColor: themeColors.primary },
                            ]}>
                              {isLocked
                                ? <Lock size={11} color="rgba(255,255,255,0.4)" />
                                : isCompleted
                                  ? <Text style={{ color: '#22C55E', fontSize: 12, fontWeight: '900' }}>✓</Text>
                                  : <BookOpen size={11} color={themeColors.primary} />
                              }
                            </View>
                            <Text style={styles.completedCourseTitle} numberOfLines={1}>
                              {pc.course?.title || 'Curso'}
                            </Text>
                            {courseImpact !== null && courseImpact !== undefined && (
                              <Text style={styles.courseImpactBadge}>{courseImpact}% impacto</Text>
                            )}
                            {!isLocked && <Text style={styles.completedCourseArrow}>›</Text>}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>
                );
              })()}
            </View>
          </>
        ) : (
          <View style={styles.emptyPathwaySection}>
            <View style={[styles.emptyPathwayCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <View style={[styles.emptyPathwayIcon, { backgroundColor: `${themeColors.primary}18` }]}>
                <BookOpen size={26} color={themeColors.primary} />
              </View>
              <Text style={[styles.emptyPathwayTitle, { color: themeColors.text }]}>Ainda não tem uma jornada definida</Text>
              <Text style={[styles.emptyPathwayText, { color: themeColors.textMuted }]}>
                Faça o self-assessment para receber uma recomendação de aprendizagem adequada ao seu perfil.
              </Text>
              <TouchableOpacity
                style={[styles.emptyPathwayButton, { backgroundColor: themeColors.primary }, startingAssessment && { opacity: 0.7 }]}
                activeOpacity={0.85}
                disabled={startingAssessment}
                onPress={startSelfAssessment}
              >
                {startingAssessment ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.emptyPathwayButtonText}>Fazer self-assessment</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}


        {/* ── Completed Pathways ── */}
        {completedPathways.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Jornadas Concluídas 🏆</Text>
            {completedPathways.map((p) => {
              const pColors = getPathwayCardColors(p.id, p.color);
              return (
              <View key={p.id} style={[styles.completedPathCard, { backgroundColor: pColors.bg }]}>
                {/* MAZA watermark */}
                <Image
                  source={require('../../assets/maza-icon-branco.png')}
                  style={styles.cardWatermark}
                  resizeMode="contain"
                />
                {/* Top accent strip */}
                <View style={[styles.completedCardAccent, { backgroundColor: pColors.accent }]} />

                {/* Header row */}
                <View style={styles.completedCardHeader}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.completedCardTitle} numberOfLines={2}>{p.name}</Text>
                    <Text style={styles.completedCardMeta}>
                      {p.courses.length} curso{p.courses.length !== 1 ? 's' : ''} concluídos
                    </Text>
                  </View>
                  <View style={styles.completedBadge}>
                    <Text style={styles.completedBadgeText}>✓ Concluída</Text>
                  </View>
                </View>

                {/* Node progress map */}
                <View style={[styles.pathMap, { marginVertical: 16 }]}>
                  {p.courses.slice(0, 5).map((pc: any, idx: number, arr: any[]) => (
                    <React.Fragment key={pc.id || idx}>
                      <View style={[styles.nodeCompleted, { backgroundColor: '#22C55E' }]}>
                        <Text style={styles.nodeText}>✓</Text>
                      </View>
                      {idx < arr.length - 1 && (
                        <View style={[styles.lineCompleted, { backgroundColor: '#22C55E', flex: 1, maxWidth: 32 }]} />
                      )}
                    </React.Fragment>
                  ))}
                </View>

                {/* Course list as clean rows */}
                <View style={styles.completedCourseList}>
                  {p.courses.map((pc: any, idx: number) => {
                    const courseImpact = pc.impact?.impactPercent;
                    return (
                      <TouchableOpacity
                        key={pc.courseId}
                        style={[
                          styles.completedCourseRow,
                          idx < p.courses.length - 1 && styles.completedCourseRowBorder,
                        ]}
                        onPress={() => navigation.navigate('CourseDetail', { courseId: pc.courseId, title: pc.course?.title, course: pc.course ?? pc })}
                      >
                        <View style={styles.completedCourseCheck}>
                          <Text style={{ color: '#22C55E', fontSize: 12, fontWeight: '900' }}>✓</Text>
                        </View>
                        <Text style={styles.completedCourseTitle} numberOfLines={1}>
                          {pc.course?.title || 'Curso'}
                        </Text>
                        {courseImpact !== null && courseImpact !== undefined && (
                          <Text style={styles.courseImpactBadge}>{courseImpact}% impacto</Text>
                        )}
                        <Text style={styles.completedCourseArrow}>›</Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
              );
            })}
          </View>
        )}

        {certificates.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Certificados Conquistados</Text>
            <View style={styles.certificatesGrid}>
              {certificates.map((cert) => (
                <TouchableOpacity
                  key={cert.id}
                  style={[styles.certificateCard, { backgroundColor: themeColors.card }]}
                  activeOpacity={0.85}
                  onPress={() => setSelectedCertificate(cert)}
                >
                  <View style={[styles.certificateIconWrap, { backgroundColor: `${themeColors.primary}18` }]}>
                    <FileText size={24} color={themeColors.primary} />
                  </View>
                  <View style={styles.certificateBody}>
                    <Text style={[styles.certificateTitle, { color: themeColors.text }]} numberOfLines={2}>
                      {cert.course?.title ?? cert.courseName ?? 'Curso'}
                    </Text>
                    <Text style={[styles.certificateMeta, { color: themeColors.textMuted }]}>
                      Emitido em {new Date(cert.issuedAt ?? cert.createdAt).toLocaleDateString('pt-PT')}
                    </Text>
                    <Text style={[styles.certificateId, { color: themeColors.textMuted }]}>
                      ID: MAZA-{cert.id?.slice(0, 8).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.certificateArrow, { color: themeColors.textMuted }]}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* Other Pathways */}
        {availablePathways.length > 0 && (
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Outras Jornadas Disponíveis</Text>
            {availablePathways.map((p) => (
              <TouchableOpacity 
                key={p.id}
                style={[styles.challengeCard, { backgroundColor: isDark ? '#1e293b' : themeColors.background, borderColor: themeColors.border, borderWidth: 1 }]}
                onPress={() => {
                  setSelectedPathway(p);
                  setUnlockModalVisible(true);
                }}
              >
                <View style={[styles.challengeIconBg, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
                  <Lock color={themeColors.textMuted} />
                </View>
                <View style={styles.challengeInfo}>
                  <Text style={[styles.cTitle, { color: themeColors.textMuted }]} numberOfLines={2}>{p.name}</Text>
                  <Text style={[styles.cPoints, { color: themeColors.textMuted }]}>Toque para desbloquear</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
        
        <View style={{ height: 40 }} />
      </ScrollView>

      {/* Custom Unlock Modal */}
      <Modal visible={unlockModalVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: themeColors.card }]}>
            <View style={[styles.modalIconBg, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
              <Lock color={themeColors.primary} size={32} />
            </View>
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Desbloquear Jornada</Text>
            <Text style={[styles.modalMessage, { color: themeColors.textMuted }]}>
              Deseja explorar a jornada "{selectedPathway?.name}"? Ao desbloquear uma nova jornada, será encaminhado para atualizar o seu perfil.
            </Text>
            
            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={[styles.modalConfirmBtn, { backgroundColor: themeColors.primary }, unlocking && { opacity: 0.7 }]}
                disabled={unlocking}
                onPress={async () => {
                  setUnlocking(true);
                  try {
                    // Reset the current assessment
                    const res = await api.post('/bot/reset');
                    if (res.data.user && updateUser) {
                      await updateUser(res.data.user);
                    }
                    setUnlockModalVisible(false);
                    // Navigate to bot assessment
                    navigation.navigate('BotAssessment');
                  } catch (e) {
                    console.error('Failed to reset assessment:', e);
                  } finally {
                    setUnlocking(false);
                  }
                }}
              >
                {unlocking ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.modalConfirmText}>Sim, ir para avaliação</Text>
                )}
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.modalCancelBtn} onPress={() => setUnlockModalVisible(false)}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      <Modal visible={!!selectedCertificate} animationType="slide" transparent>
        <View style={styles.previewOverlay}>
          {selectedCertificate && (
            <>
              <CertificatePreview
                style={styles.previewCertificate}
                studentName={user?.name ?? user?.phone ?? 'Estudante'}
                courseTitle={selectedCertificate.course?.title ?? selectedCertificate.courseName ?? 'Curso'}
                instructor={selectedCertificate.course?.instructor ?? 'MAZA'}
                issuedAt={selectedCertificate.issuedAt ?? selectedCertificate.createdAt ?? new Date().toISOString()}
                courseId={selectedCertificate.courseId ?? selectedCertificate.course?.id ?? ''}
                certificateId={selectedCertificate.id ?? ''}
              />
              <View style={styles.previewActions}>
                <TouchableOpacity style={styles.previewClose} onPress={() => setSelectedCertificate(null)}>
                  <Text style={styles.previewCloseText}>Fechar</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 24, paddingTop: 60, paddingBottom: 90 },
  headerTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 6 },
  headerSub: { fontSize: 14, marginBottom: 24 },
  statsCard: { borderRadius: 20, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 20, elevation: 10, position: 'absolute', bottom: -40, left: 24, right: 24 },
  statCol: { alignItems: 'center', flex: 1 },
  statValue: { fontSize: 18, fontWeight: 'bold', marginTop: 8 },
  statLabel: { fontSize: 12, marginTop: 4 },
  divider: { width: 1, height: 40 },
  section: { padding: 24, paddingTop: 20 },
  firstSection: { padding: 24, paddingTop: 60 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  emptyPathwaySection: {
    paddingHorizontal: 24,
    paddingTop: 76,
    paddingBottom: 18,
  },
  emptyPathwayCard: {
    borderRadius: 20,
    padding: 22,
    alignItems: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
  },
  emptyPathwayIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyPathwayTitle: {
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 8,
  },
  emptyPathwayText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
    marginBottom: 18,
  },
  emptyPathwayButton: {
    width: '100%',
    minHeight: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyPathwayButtonText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '800',
  },
  certificatesGrid: { gap: 12 },
  certificateCard: {
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  certificateIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
    flexShrink: 0,
  },
  certificateBody: { flex: 1, marginRight: 8 },
  certificateTitle: { fontSize: 14, fontWeight: 'bold', marginBottom: 4 },
  certificateMeta: { fontSize: 12, marginBottom: 2 },
  certificateId: { fontSize: 11, fontFamily: 'monospace' },
  certificateArrow: { fontSize: 22, fontWeight: '300' },
  pathCard: { borderRadius: 20, padding: 24 },
  pathTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  pathMap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  nodeCompleted: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  nodeText: { color: '#fff', fontWeight: 'bold' },
  lineCompleted: { flex: 1, maxWidth: 40, height: 4 },
  nodeCurrent: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)' },
  lineLocked: { flex: 1, maxWidth: 40, height: 4 },
  nodeLocked: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  challengeCard: { borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  challengeLocked: { opacity: 0.7, borderWidth: 1 },
  challengeIconBg: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  challengeInfo: { flex: 1 },
  cTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 4 },
  cPoints: { fontSize: 14, fontWeight: 'bold' },

  // ── Completed badge (shared between current and completed pathway cards) ──
  completedBadge: {
    backgroundColor: '#22C55E', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  completedBadgeText: { color: '#fff', fontSize: 11, fontWeight: '800', letterSpacing: 0.3 },
  continueJourneyBtn: {
    marginHorizontal: 20,
    marginTop: 14,
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  continueJourneyText: { color: '#fff', fontSize: 14, fontWeight: '800' },

  // ── Completed pathway card (premium redesign) ──
  completedPathCard: {
    borderRadius: 20,
    backgroundColor: '#111827',
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  cardWatermark: {
    position: 'absolute',
    right: -20,
    bottom: -20,
    width: 160,
    height: 160,
    opacity: 0.07,
    transform: [{ rotate: '-10deg' }],
  },
  completedCardAccent: {
    height: 4,
    backgroundColor: '#22C55E',
    width: '100%',
  },
  completedCardHeader: {
    flexDirection: 'row', alignItems: 'flex-start',
    justifyContent: 'space-between',
    padding: 20, paddingBottom: 0, gap: 12,
  },
  completedCardTitle: {
    fontSize: 17, fontWeight: '800', color: '#FFFFFF',
    lineHeight: 24, marginBottom: 4, flex: 1,
  },
  completedCardMeta: {
    fontSize: 13, color: 'rgba(255,255,255,0.45)', fontWeight: '500',
  },
  completedCourseList: {
    marginHorizontal: 16, marginBottom: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 14, overflow: 'hidden',
  },
  completedCourseRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 13, paddingHorizontal: 14, gap: 12,
  },
  completedCourseRowBorder: {
    borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  completedCourseCheck: {
    width: 24, height: 24, borderRadius: 12,
    backgroundColor: 'rgba(34,197,94,0.15)',
    borderWidth: 1.5, borderColor: '#22C55E',
    justifyContent: 'center', alignItems: 'center',
  },
  completedCourseTitle: {
    flex: 1, fontSize: 14, fontWeight: '600',
    color: 'rgba(255,255,255,0.85)',
  },
  courseImpactBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#7DD3FC',
    backgroundColor: 'rgba(14,165,233,0.14)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
    overflow: 'hidden',
  },
  completedCourseArrow: {
    fontSize: 18, color: 'rgba(255,255,255,0.3)', fontWeight: '300',
  },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 24 },
  modalCard: { width: '100%', maxWidth: 400, borderRadius: 24, padding: 32, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 20, elevation: 12 },
  modalIconBg: { width: 64, height: 64, borderRadius: 32, justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 22, fontWeight: 'bold', marginBottom: 12, textAlign: 'center' },
  modalMessage: { fontSize: 15, textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  modalActions: { flexDirection: 'column', gap: 12, width: '100%', marginTop: 8 },
  modalConfirmBtn: { width: '100%', paddingVertical: 16, borderRadius: 12, alignItems: 'center' },
  modalConfirmText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
  modalCancelBtn: { width: '100%', paddingVertical: 14, borderRadius: 12, backgroundColor: 'transparent', alignItems: 'center' },
  modalCancelText: { color: '#64748B', fontWeight: 'bold', fontSize: 15 },
  previewOverlay: { flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.95)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  previewCertificate: { width: '100%', maxWidth: 800, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 30, elevation: 20 },
  previewActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  previewClose: { backgroundColor: '#374151', paddingHorizontal: 22, paddingVertical: 14, borderRadius: 10 },
  previewCloseText: { color: '#fff', fontWeight: 'bold' }
});
