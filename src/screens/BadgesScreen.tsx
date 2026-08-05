import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Modal, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Award, TrendingUp, Trophy, Lock, BookOpen, FileText, CalendarDays, Clock3, BriefcaseBusiness, ChevronRight } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import api, { getPersistentCached } from '../services/api';
import { colors } from '../theme/colors';
import CertificatePreview from '../components/CertificatePreview';
import { useIsWideWeb } from '../utils/webViewport';
import { LinearGradient } from 'expo-linear-gradient';

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

function formatMetricNumber(value: unknown) {
  return Number(value ?? 0).toLocaleString('pt-MZ', {
    maximumFractionDigits: 1,
  });
}

function formatMinutesPerDay(minutes: number) {
  if (!Number.isFinite(minutes) || minutes <= 0) return '0 min';
  if (minutes < 60) return `${Math.round(minutes)} min`;

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = Math.round(minutes % 60);
  return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
}

export default function BadgesScreen({ navigation }: any) {
  const { colors: themeColors, isDark } = useTheme();
  const { user, updateUser } = useAuth();
  const isWideWeb = useIsWideWeb(900);
  const [pathway, setPathway] = useState<any>(null);
  const [completedPathways, setCompletedPathways] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [startingAssessment, setStartingAssessment] = useState(false);
  const [certificates, setCertificates] = useState<any[]>([]);
  const [selectedCertificate, setSelectedCertificate] = useState<any | null>(null);
  const [careerSummary, setCareerSummary] = useState<any>(null);
  const [pathwayUnavailable, setPathwayUnavailable] = useState(false);

  const fetchPathwayData = useCallback(async () => {
    try {
      const [meRes, myData, completedData, certificatesData, careerData] = await Promise.all([
        api.get('/auth/me').catch(() => null),
        getPersistentCached<any>('/pathways/my', 5 * 60 * 1000).catch(() => undefined),
        getPersistentCached<any[]>('/pathways/completed', 5 * 60 * 1000).catch(() => undefined),
        getPersistentCached<any[]>('/certificates/my', 5 * 60 * 1000).catch(() => undefined),
        getPersistentCached<any>('/career-outcomes/me', 5 * 60 * 1000).catch(() => undefined),
      ]);
      if (meRes?.data && updateUser) {
        await updateUser(meRes.data);
      }
      setPathwayUnavailable(myData === undefined);
      if (myData !== undefined) setPathway(myData?.pathway ?? null);
      if (completedData !== undefined) setCompletedPathways(completedData || []);
      if (certificatesData !== undefined) setCertificates(certificatesData || []);
      if (careerData !== undefined) setCareerSummary(careerData ?? null);
    } catch (e) {
      console.log('Error fetching pathway in Gamification:', e);
    }
    setLoading(false);
  }, [updateUser]);

  useFocusEffect(
    useCallback(() => {
      fetchPathwayData();
    }, [fetchPathwayData])
  );

  const profile = user?.profile;
  const mazaImpact = Math.round(Number(user?.impact?.averageImpactPercent ?? 0));
  const points = profile?.totalPoints ?? 0;
  const courses = pathway?.courses ?? [];
  const isCurrentCompleted = courses.length > 0 && courses.every((pc: any) => pc.isCompleted && pc.progress >= 100);
  const progressFallback = user?.enrollments?.length
    ? user.enrollments.reduce((sum, enrollment) => sum + Number(enrollment.progress ?? 0), 0) / user.enrollments.length
    : courses.length
    ? courses.reduce((sum: number, pc: any) => sum + Number(pc.progress ?? 0), 0) / courses.length
    : 0;
  const totalDaysPlayed = Number(user?.monitoring?.totalDaysPlayed ?? 0);
  const minutesInsideApp = Number(user?.monitoring?.minutesInsideApp ?? 0);
  const minutesPerActiveDay = totalDaysPlayed > 0 ? minutesInsideApp / totalDaysPlayed : 0;
  const completionCount = Number(user?.monitoring?.completion ?? user?.monitoring?.completedCertificates ?? certificates.length ?? 0);
  const progressAverage = Number(user?.monitoring?.progress ?? progressFallback);
  const careerOutcomes = careerSummary?.outcomes ?? [];
  const careerCounts = {
    internships: careerOutcomes.filter((item: any) => item.type === 'INTERNSHIP').length,
    employment: careerOutcomes.filter((item: any) => item.type === 'EMPLOYMENT').length,
    selfEmployment: careerOutcomes.filter((item: any) => item.type === 'SELF_EMPLOYMENT').length,
  };
  const careerResultSummary = [
    careerCounts.internships > 0 ? `${careerCounts.internships} estágio${careerCounts.internships === 1 ? '' : 's'}` : null,
    careerCounts.employment > 0 ? `${careerCounts.employment} emprego${careerCounts.employment === 1 ? '' : 's'}` : null,
    careerCounts.selfEmployment > 0 ? `${careerCounts.selfEmployment} por conta própria` : null,
  ].filter(Boolean).join(' · ');

  const achievementStats = [
    {
      label: 'Melhoria',
      value: `${mazaImpact}%`,
      icon: TrendingUp,
      color: themeColors.success,
      bg: isDark ? '#064E3B' : '#DCFCE7',
    },
    {
      label: 'Pontos',
      value: formatMetricNumber(points),
      icon: Trophy,
      color: themeColors.secondary,
      bg: isDark ? '#713F12' : '#FEF3C7',
    },
    {
      label: totalDaysPlayed === 1 ? 'Dia ativo' : 'Dias ativos',
      value: formatMetricNumber(totalDaysPlayed),
      icon: CalendarDays,
      color: '#2563EB',
      bg: isDark ? '#1E3A8A' : '#DBEAFE',
    },
    {
      label: 'Min./dia',
      value: formatMinutesPerDay(minutesPerActiveDay),
      icon: Clock3,
      color: '#0EA5E9',
      bg: isDark ? '#164E63' : '#E0F2FE',
    },
    {
      label: completionCount === 1 ? 'Certificado' : 'Certificados',
      value: formatMetricNumber(completionCount),
      icon: Award,
      color: '#D97706',
      bg: isDark ? '#78350F' : '#FEF3C7',
    },
    {
      label: 'Progresso Geral',
      value: `${Math.round(progressAverage)}%`,
      icon: BookOpen,
      color: '#7C3AED',
      bg: isDark ? '#4C1D95' : '#EDE9FE',
    },
  ];

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
        <View style={isWideWeb ? styles.webPage : undefined}>
        {/* Header Hero */}
        <LinearGradient
          colors={[themeColors.primary, '#0284C7', '#E0F2FE']}
          locations={[0, 0.76, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.header}
        >
          <Image
            source={require('../../assets/maza-icon-branco.png')}
            style={styles.headerWatermark}
            resizeMode="contain"
          />
          <Text style={[styles.headerTitle, { color: '#fff' }]} numberOfLines={1} adjustsFontSizeToFit>As Suas Conquistas e Jornadas</Text>
          <Text style={[styles.headerSub, { color: 'rgba(255,255,255,0.94)' }]} numberOfLines={1}>Acompanhe o progresso das suas jornadas.</Text>
          
          <View style={styles.statsCard}>
            {achievementStats.map((stat) => {
              const Icon = stat.icon;
              return (
                <View key={stat.label} style={styles.statCol}>
                  <View style={styles.statTopRow}>
                    <View style={styles.statIcon}>
                      <Icon color="#FFFFFF" size={17} />
                    </View>
                    <Text style={styles.statValue} numberOfLines={1} adjustsFontSizeToFit>{stat.value}</Text>
                  </View>
                  <Text style={styles.statLabel} numberOfLines={1} adjustsFontSizeToFit>{stat.label}</Text>
                </View>
              );
            })}
          </View>
        </LinearGradient>

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
                    <View style={[styles.completedCardHeader, courses.length === 0 && styles.completedCardHeaderEmpty]}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.completedCardTitle} numberOfLines={2}>{pathway.name}</Text>
                        <Text style={styles.completedCardMeta}>
                          {courses.length > 0
                            ? `${completedCount}/${courses.length} curso${courses.length !== 1 ? 's' : ''} concluído${completedCount !== 1 ? 's' : ''}`
                            : 'Cursos em preparação'}
                        </Text>
                      </View>
                      {isCurrentCompleted ? (
                        <View style={styles.completedBadge}>
                          <Text style={styles.completedBadgeText}>✓ Concluída</Text>
                        </View>
                      ) : (
                        <View style={[styles.completedBadge, { backgroundColor: cardColors.accent }]}>
                          <Text style={styles.completedBadgeText}>{courses.length > 0 ? 'Em curso' : 'Por iniciar'}</Text>
                        </View>
                      )}
                    </View>

                    {courses.length > 0 && (
                      <>
                    {!isCurrentCompleted && nextCourse ? (
                      <View style={styles.journeyControlsRow}>
                        <TouchableOpacity
                          style={[styles.continueJourneyBtn, styles.continueJourneyBtnInline, { backgroundColor: cardColors.accent }]}
                          onPress={() => navigation.navigate('CourseDetail', {
                            courseId: nextCourse.courseId || nextCourse.id,
                            title: nextCourse.course?.title ?? nextCourse.title,
                            course: nextCourse.course ?? nextCourse,
                          })}
                        >
                          <BookOpen size={14} color="#fff" />
                          <Text style={styles.continueJourneyText} numberOfLines={1}>Continuar jornada</Text>
                        </TouchableOpacity>
                        <View style={[styles.nodeCurrent, styles.journeyCurrentNode, { backgroundColor: themeColors.secondary }]}>
                          <Award size={18} color="#fff" />
                        </View>
                      </View>
                    ) : (
                      <View style={[styles.pathMap, { marginVertical: 14 }]}>
                        {courses.slice(0, 5).map((pc: any, idx: number, arr: any[]) => {
                          const isCompleted = pc.isCompleted && pc.progress >= 100;
                          const isLocked = pc.isLocked;
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
                    )}

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
                              <Text style={styles.courseImpactBadge}>{courseImpact}% melhoria</Text>
                            )}
                            {!isLocked && <Text style={styles.completedCourseArrow}>›</Text>}
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                      </>
                    )}
                  </View>
                );
              })()}
            </View>
          </>
        ) : pathwayUnavailable || user?.profile?.assessmentDone ? (
          <View style={styles.emptyPathwaySection}>
            <View style={[styles.emptyPathwayCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <View style={[styles.emptyPathwayIcon, { backgroundColor: `${themeColors.primary}18` }]}>
                <BookOpen size={26} color={themeColors.primary} />
              </View>
              <Text style={[styles.emptyPathwayTitle, { color: themeColors.text }]}>Jornada indisponível offline</Text>
              <Text style={[styles.emptyPathwayText, { color: themeColors.textMuted }]}>
                A sua jornada não foi removida. Ligue-se à internet para atualizar estes dados.
              </Text>
            </View>
          </View>
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
                          <Text style={styles.courseImpactBadge}>{courseImpact}% melhoria</Text>
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

        <View style={styles.section}>
          <View style={styles.careerSectionHeader}>
            <Text style={[styles.sectionTitle, styles.careerSectionTitle, { color: themeColors.text }]}>Resultados Profissionais</Text>
            <TouchableOpacity style={styles.careerHeaderAction} onPress={() => navigation.navigate('CareerOutcomes')}>
              <Text style={[styles.careerHeaderActionText, { color: themeColors.primary }]}>Gerir</Text>
              <ChevronRight size={15} color={themeColors.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            style={[styles.careerCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('CareerOutcomes')}
          >
            <View style={styles.careerCardHeader}>
              <View style={[styles.careerIcon, { backgroundColor: `${themeColors.primary}18` }]}>
                <BriefcaseBusiness size={22} color={themeColors.primary} />
              </View>
              <View style={styles.careerCardCopy}>
                <Text style={[styles.careerCardTitle, { color: themeColors.text }]}>
                  {careerOutcomes.length > 0
                    ? `${careerOutcomes.length} Resultado${careerOutcomes.length === 1 ? '' : 's'} Registado${careerOutcomes.length === 1 ? '' : 's'}`
                    : 'Acompanhe a sua evolução profissional'}
                </Text>
                <Text style={[styles.careerCardSubtitle, { color: themeColors.textMuted }]} numberOfLines={1} adjustsFontSizeToFit>
                  {careerOutcomes.length > 0
                    ? careerResultSummary
                    : careerSummary?.dueMilestone
                      ? `Acompanhamento de ${careerSummary.dueMilestone} dias disponível`
                      : 'Registe a sua evolução profissional.'}
                </Text>
              </View>
              <ChevronRight size={19} color={themeColors.textMuted} />
            </View>
          </TouchableOpacity>
        </View>

        <View style={{ height: 40 }} />
        </View>
      </ScrollView>

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
  webPage: { width: '100%', maxWidth: 1180, alignSelf: 'center', paddingTop: 20, paddingBottom: 24 },
  header: { paddingHorizontal: 24, paddingTop: 44, paddingBottom: 20, overflow: 'hidden' },
  headerWatermark: {
    position: 'absolute',
    right: -42,
    bottom: -55,
    width: 210,
    height: 210,
    opacity: 0.1,
    transform: [{ rotate: '-10deg' }],
  },
  headerTitle: { fontSize: 21, fontWeight: '700', marginBottom: 5 },
  headerSub: { fontSize: 14, lineHeight: 19, fontWeight: '500' },
  statsCard: {
    paddingVertical: 4,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    alignItems: 'stretch',
    gap: 6,
    marginTop: 18,
  },
  statCol: { alignItems: 'center', justifyContent: 'center', width: '30%', minHeight: 46, paddingVertical: 1 },
  statTopRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5, maxWidth: '100%' },
  statIcon: { width: 19, height: 19, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  statValue: { color: '#FFFFFF', fontSize: 15, lineHeight: 18, fontWeight: '700', maxWidth: '72%' },
  statLabel: { color: 'rgba(255,255,255,0.78)', fontSize: 10, lineHeight: 13, fontWeight: '400', marginTop: 2, maxWidth: '100%' },
  section: { paddingHorizontal: 24, paddingTop: 12, paddingBottom: 4 },
  firstSection: { paddingHorizontal: 24, paddingTop: 20, paddingBottom: 8 },
  sectionTitle: { fontSize: 18, fontWeight: '700', marginBottom: 12 },
  emptyPathwaySection: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 8,
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
    borderRadius: 14,
    padding: 14,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 1,
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
  certificateTitle: { fontSize: 14, fontWeight: '600', marginBottom: 4 },
  certificateMeta: { fontSize: 12, marginBottom: 2 },
  certificateId: { fontSize: 11, fontFamily: 'monospace' },
  certificateArrow: { fontSize: 22, fontWeight: '300' },
  careerSectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  careerSectionTitle: { marginBottom: 0 },
  careerHeaderAction: { flexDirection: 'row', alignItems: 'center', gap: 2, minHeight: 32, paddingLeft: 10 },
  careerHeaderActionText: { fontSize: 12, fontWeight: '700' },
  careerCard: { borderWidth: 1, borderRadius: 16, overflow: 'hidden' },
  careerCardHeader: { flexDirection: 'row', alignItems: 'center', gap: 11, padding: 12 },
  careerIcon: { width: 40, height: 40, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  careerCardCopy: { flex: 1, minWidth: 0 },
  careerCardTitle: { fontSize: 14, lineHeight: 19, fontWeight: '700' },
  careerCardSubtitle: { fontSize: 11, lineHeight: 16, marginTop: 3 },
  pathCard: { borderRadius: 20, padding: 24 },
  pathTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
  pathMap: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  nodeCompleted: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  nodeText: { color: '#fff', fontWeight: 'bold' },
  lineCompleted: { flex: 1, maxWidth: 40, height: 4 },
  nodeCurrent: { width: 56, height: 56, borderRadius: 28, justifyContent: 'center', alignItems: 'center', borderWidth: 4, borderColor: 'rgba(255,255,255,0.3)' },
  lineLocked: { flex: 1, maxWidth: 40, height: 4 },
  nodeLocked: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  // ── Completed badge (shared between current and completed pathway cards) ──
  completedBadge: {
    backgroundColor: '#22C55E', borderRadius: 12,
    paddingHorizontal: 10, paddingVertical: 4,
    alignSelf: 'flex-start',
  },
  completedBadgeText: { color: '#fff', fontSize: 11, fontWeight: '700', letterSpacing: 0 },
  journeyControlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 16,
    marginVertical: 14,
  },
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
  continueJourneyBtnInline: { flex: 1, minWidth: 0, marginHorizontal: 0, marginTop: 0 },
  journeyCurrentNode: { width: 48, height: 48, borderRadius: 24, flexShrink: 0 },
  continueJourneyText: { color: '#fff', fontSize: 14, fontWeight: '700' },

  // ── Completed pathway card (premium redesign) ──
  completedPathCard: {
    borderRadius: 16,
    backgroundColor: '#111827',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 10,
    elevation: 4,
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
    padding: 16, paddingBottom: 0, gap: 12,
  },
  completedCardHeaderEmpty: { paddingBottom: 16 },
  completedCardTitle: {
    fontSize: 16, fontWeight: '700', color: '#FFFFFF',
    lineHeight: 22, marginBottom: 3, flex: 1,
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

  previewOverlay: { flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.95)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  previewCertificate: { width: '100%', maxWidth: 800, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 30, elevation: 20 },
  previewActions: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  previewClose: { backgroundColor: '#374151', paddingHorizontal: 22, paddingVertical: 14, borderRadius: 10 },
  previewCloseText: { color: '#fff', fontWeight: 'bold' }
});
