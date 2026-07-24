import React, { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image, useWindowDimensions } from 'react-native';
import { colors } from '../theme/colors';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Award, Bell, Lock, ChevronRight, CheckCircle2, Bot, CalendarDays, Clock3, BriefcaseBusiness } from 'lucide-react-native';
import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import Svg, { Circle } from 'react-native-svg';
import { LinearGradient } from 'expo-linear-gradient';
import api, { getPersistentCached } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import CourseBokehBg from '../components/CourseBokehBg';
import CourseThumbnailImage from '../components/CourseThumbnailImage';
import { API_BASE as _API_BASE } from '../services/api';
import { useIsWideWeb } from '../utils/webViewport';
import { flushOfflineQueue } from '../services/offlineQueue';

const API_BASE = _API_BASE.replace('/api', '');

function visiblePublishedCourses(value: any) {
  return Array.isArray(value) ? value.filter((course) => {
    const lessonCount = course?._count?.lessons;
    return course?.isPublished !== false && (lessonCount === undefined || lessonCount === null || lessonCount > 0);
  }) : [];
}

function getCourseCategoryLabel(course: any) {
  const categories = Array.isArray(course?.categories) && course.categories.length > 0
    ? course.categories
    : course?.category
    ? [course.category]
    : [];
  return categories
    .map((category: any) => category?.name)
    .filter(Boolean)
    .join(' · ');
}

const PATHWAY_META: Record<string, { icon: string; color: string }> = {
  'Agronegócio': { icon: 'leaf-outline', color: '#22C55E' },
  'Alterações Climáticas e Competências Verdes': { icon: 'earth-outline', color: '#3B82F6' },
  'Competências Digitais': { icon: 'laptop-outline', color: '#8B5CF6' },
  'Competências Fundamentais': { icon: 'library-outline', color: '#F59E0B' },
  'Competências para a Vida': { icon: 'star-outline', color: '#EC4899' },
  'Competências Técnicas Digitais': { icon: 'cog-outline', color: '#6366F1' },
  'Competências Verdes': { icon: 'leaf-outline', color: '#10B981' },
  'Competências Vocacionais': { icon: 'build-outline', color: '#F97316' },
  'Educação Financeira': { icon: 'cash-outline', color: '#EF4444' },
  'Empregabilidade': { icon: 'briefcase-outline', color: '#14B8A6' },
  'Informação sobre Proteção': { icon: 'shield-checkmark-outline', color: '#0EA5E9' },
  'Modelos Inteligência Artificial': { icon: 'hardware-chip-outline', color: '#A855F7' },
};

function normalizeName(value: string) {
  return String(value ?? '').normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function getPathwayMeta(name?: string | null) {
  const normalized = normalizeName(name ?? '');
  return Object.entries(PATHWAY_META).find(([label]) => normalizeName(label) === normalized)?.[1] ?? {
    icon: 'library-outline',
    color: colors.primary,
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

export default function HomeScreen({ navigation }: any) {
  const { width } = useWindowDimensions();
  const { user, updateUser, logout } = useAuth();
  const { colors: themeColors, isDark } = useTheme();
  const [pathway, setPathway] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [careerDueMilestone, setCareerDueMilestone] = useState<number | null>(null);
  const storyCheckStarted = useRef(false);

  useEffect(() => {
    if (!user?.id || storyCheckStarted.current) return;
    storyCheckStarted.current = true;

    const openStoryOnFirstAccess = async () => {
      const storageKey = `maza_how_it_works_seen:${user.id}`;
      const alreadySeen = await AsyncStorage.getItem(storageKey);
      if (alreadySeen) return;

      await AsyncStorage.setItem(storageKey, 'true');
      navigation.navigate('HowItWorksStory');
    };

    openStoryOnFirstAccess().catch(() => {});
  }, [navigation, user?.id]);

  const fetchHomeData = useCallback(async () => {
    try {
      await flushOfflineQueue().catch(() => {});
      const meRes = await api.get('/auth/me').catch((error) => error?.response ?? null);
      if (meRes?.status === 401 || meRes?.status === 404) {
        await logout();
        return;
      }
      if (meRes?.data) {
        updateUser(meRes.data);
      }

      const [myRes, coursesRes, careerRes] = await Promise.all([
        api.get('/pathways/my').catch(() => null),
        getPersistentCached('/courses', 2 * 60 * 1000, (staleCourses) => {
          setCourses(visiblePublishedCourses(staleCourses));
          setLoading(false);
        }).catch(() => null),
        api.get('/career-outcomes/me').catch(() => null),
      ]);

      getPersistentCached('/jobs', 10 * 60 * 1000).catch(() => {});
      getPersistentCached('/pathways', 10 * 60 * 1000).catch(() => {});

      if (myRes?.data?.pathway) {
        setPathway(myRes.data.pathway);
      } else {
        setPathway(null);
      }
      if (Array.isArray(coursesRes)) {
        setCourses(visiblePublishedCourses(coursesRes));
      }
      setCareerDueMilestone(careerRes?.data?.dueMilestone ?? null);
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  }, [logout, updateUser]);

  // Refresh stats every time the user comes back to the home screen
  useFocusEffect(
    useCallback(() => {
      fetchHomeData();
    }, [fetchHomeData])
  );

  const enrolledProgress = user?.enrollments?.length
    ? user.enrollments.reduce((sum, enrollment) => sum + Number(enrollment.progress ?? 0), 0) / user.enrollments.length
    : 0;
  const monitoring = user?.monitoring;
  const totalDaysPlayed = Number(monitoring?.totalDaysPlayed ?? 0);
  const minutesInsideApp = Number(monitoring?.minutesInsideApp ?? 0);
  const minutesPerActiveDay = totalDaysPlayed > 0 ? minutesInsideApp / totalDaysPlayed : 0;
  const completionCount = Number(monitoring?.completion ?? monitoring?.completedCertificates ?? 0);
  const progressAverage = Number(monitoring?.progress ?? enrolledProgress);
  const progressPercent = Math.max(0, Math.min(100, Math.round(progressAverage)));
  const pathwayMeta = pathway ? getPathwayMeta(pathway.name) : null;
  const pathwayCourses: any[] = pathway?.courses ?? [];
  const useWebShell = useIsWideWeb(900);
  const useCourseGrid = useWebShell || width >= 760;

  const handleCoursePress = (pc: any) => {
    if (pc.isLocked) return; // Do nothing if locked
    const course = pc.course ?? pc;
    navigation.navigate('CourseDetail', {
      courseId: pc.courseId || pc.id,
      title: pc.title || pc.course?.title,
      course: {
        ...course,
        isLocked: !!pc.isLocked,
        prerequisiteCourseId: pc.prerequisiteCourseId ?? course.prerequisiteCourseId,
      },
    });
  };

  const recentCourses = useMemo(() => [...courses].sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime()).slice(0, 5), [courses]);
  const popularCourses = useMemo(() => [...courses].sort((a, b) => (b._count?.enrollments || 0) - (a._count?.enrollments || 0)).slice(0, 5), [courses]);

  const renderHorizontalCourseList = (title: string, data: any[]) => (
    <View style={styles.horizontalSection}>
      <View style={[styles.sectionHeader, { paddingHorizontal: 20 }]}>
        <Text style={[styles.sectionTitle, { color: themeColors.text }]}>{title}</Text>
        <TouchableOpacity onPress={() => navigation.navigate('Cursos')}>
          <Text style={[styles.seeAll, { color: themeColors.primary }]}>Ver todos →</Text>
        </TouchableOpacity>
      </View>
      <ScrollView
        horizontal={!useCourseGrid}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={useCourseGrid ? styles.tabletCourseGrid : styles.horizontalScrollContent}
      >
        {data.map((course) => (
          <TouchableOpacity
            key={course.id}
            style={[styles.horizontalCourseCard, useCourseGrid && styles.tabletCourseCard, { backgroundColor: themeColors.card }]}
            onPress={() => navigation.navigate('CourseDetail', { courseId: course.id, title: course.title, course })}
          >
            <View style={[styles.cardImg, { overflow: 'hidden', backgroundColor: isDark ? '#334155' : '#F1F5F9' }]}>
              <CourseThumbnailImage
                courseId={course.id}
                title={course.title}
                thumbnail={course.thumbnail}
                style={{ borderRadius: 12 }}
              />
            </View>
            <Text
              style={[styles.cardCat, { color: themeColors.primary }]}
              numberOfLines={1}
              ellipsizeMode="tail"
            >
              {getCourseCategoryLabel(course)}
            </Text>
            <Text style={[styles.horizontalCourseTitle, { color: themeColors.text }]} numberOfLines={2}>{course.title}</Text>
            <View style={{ flex: 1 }} />
            <Text style={[styles.instructorText, { color: themeColors.textMuted }]} numberOfLines={1}><Ionicons name="person-outline" size={11} color={themeColors.textMuted} /> {course.instructor}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={useWebShell ? styles.webPage : undefined}>
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={[styles.greeting, { color: themeColors.textMuted }]}>Olá, {user?.name?.split(' ')[0] ?? 'Bem-vindo'} <Ionicons name="hand-right-outline" size={16} color={themeColors.textMuted} /></Text>
            <Text style={[styles.greetingBold, { color: themeColors.text }]}>O que quer aprender hoje?</Text>
          </View>
          <TouchableOpacity 
            style={[styles.notificationBtn, { backgroundColor: themeColors.card }]}
            onPress={() => navigation.navigate('NotificationsInbox')}
          >
            <Bell color={themeColors.text} size={24} />
          </TouchableOpacity>
        </View>

        {/* User evolution */}
        <LinearGradient
          colors={isDark
            ? [themeColors.card, themeColors.card, '#0C4A6E']
            : [themeColors.card, themeColors.card, '#E0F2FE']}
          locations={[0, 0.64, 1]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.evolutionCard, useWebShell && styles.webEvolutionCard, { borderColor: themeColors.border }]}
        >
          <Image
            source={require('../../assets/maza-icon-branco.png')}
            style={styles.evolutionWatermark}
            resizeMode="contain"
          />
          <View style={styles.evolutionMain}>
            <View style={styles.progressRingWrap} accessibilityLabel={`Progresso geral: ${progressPercent}%`}>
              <Svg width={108} height={108} viewBox="0 0 108 108">
                <Circle cx="54" cy="54" r="43" fill="none" stroke={isDark ? '#334155' : '#E2E8F0'} strokeWidth="9" />
                <Circle
                  cx="54"
                  cy="54"
                  r="43"
                  fill="none"
                  stroke={themeColors.primary}
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={`${2 * Math.PI * 43} ${2 * Math.PI * 43}`}
                  strokeDashoffset={2 * Math.PI * 43 * (1 - progressPercent / 100)}
                  transform="rotate(-90 54 54)"
                />
              </Svg>
              <View style={styles.progressRingCenter} pointerEvents="none">
                <Text style={[styles.progressRingValue, { color: themeColors.text }]}>{progressPercent}%</Text>
                <Text style={[styles.progressRingLabel, { color: themeColors.textMuted }]}>Progresso{`\n`}Geral</Text>
              </View>
            </View>

            <View style={[styles.rhythmStats, { borderLeftColor: isDark ? 'rgba(125,211,252,0.35)' : 'rgba(14,165,233,0.22)' }]}>
              <View style={styles.rhythmRow}>
                <View style={styles.rhythmIcon}>
                  <CalendarDays size={19} color="#2563EB" />
                </View>
                <View style={styles.rhythmText}>
                  <Text style={[styles.rhythmValue, { color: themeColors.text }]}>{formatMetricNumber(totalDaysPlayed)}</Text>
                  <Text style={[styles.rhythmLabel, { color: themeColors.textMuted }]}>{totalDaysPlayed === 1 ? 'Dia ativo' : 'Dias ativos'}</Text>
                </View>
              </View>
              <View style={styles.rhythmRow}>
                <View style={styles.rhythmIcon}>
                  <Clock3 size={19} color="#0284C7" />
                </View>
                <View style={styles.rhythmText}>
                  <Text style={[styles.rhythmValue, { color: themeColors.text }]}>{formatMinutesPerDay(minutesPerActiveDay)}</Text>
                  <Text style={[styles.rhythmLabel, { color: themeColors.textMuted }]}>Média diária</Text>
                </View>
              </View>
              <View style={styles.rhythmRow}>
                <View style={styles.rhythmIcon}>
                  <Award size={19} color="#0369A1" />
                </View>
                <View style={styles.rhythmText}>
                  <Text style={[styles.rhythmValue, { color: themeColors.text }]}>{formatMetricNumber(completionCount)}</Text>
                  <Text style={[styles.rhythmLabel, { color: themeColors.textMuted }]}>{completionCount === 1 ? 'Certificado' : 'Certificados'}</Text>
                </View>
              </View>
            </View>
          </View>
        </LinearGradient>

        {careerDueMilestone ? (
          <TouchableOpacity
            style={[styles.careerBanner, { backgroundColor: themeColors.card, borderColor: themeColors.primary }]}
            onPress={() => navigation.navigate('CareerOutcomes')}
            activeOpacity={0.82}
          >
            <View style={[styles.careerBannerIcon, { backgroundColor: themeColors.primary + '15' }]}>
              <BriefcaseBusiness size={20} color={themeColors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[styles.careerBannerTitle, { color: themeColors.text }]}>Como evoluiu profissionalmente?</Text>
              <Text style={[styles.careerBannerText, { color: themeColors.textMuted }]}>Acompanhamento de {careerDueMilestone} dias · leva menos de 1 minuto</Text>
            </View>
            <ChevronRight size={18} color={themeColors.primary} />
          </TouchableOpacity>
        ) : null}

        {loading ? (
          <ActivityIndicator color={themeColors.primary} style={{ marginTop: 40 }} />
        ) : pathway ? (
          /* My pathway section */
          <View style={styles.section}>
            {/* Pathway banner */}
            <View style={[styles.pathwayBanner, { backgroundColor: themeColors.card, borderLeftColor: pathwayMeta!.color }]}>
              <Ionicons name={pathwayMeta!.icon as any ?? 'library-outline'} size={28} color={pathwayMeta!.color} />
              <View style={{ flex: 1 }}>
                <Text style={[styles.pathwayBannerLabel, { color: themeColors.textMuted }]}>A minha jornada</Text>
                <Text style={[styles.pathwayBannerName, { color: pathwayMeta!.color }]}>
                  {pathway.name}
                </Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Cursos', { pathwayId: pathway.id })}>
                <Text style={[styles.seeAll, { color: pathwayMeta!.color }]}>Ver tudo →</Text>
              </TouchableOpacity>
            </View>

            {/* Course list */}
            {pathwayCourses.map((pc: any, idx: number) => {
              const locked = pc.isLocked;
              const progress = pc.progress ?? 0;
              const completed = pc.isCompleted && progress >= 100;
              const impactPercent =
                typeof pc.impact?.impactPercent === 'number'
                  ? Math.max(0, Math.round(pc.impact.impactPercent))
                  : null;

              return (
                <TouchableOpacity
                  key={pc.id ?? idx}
                  style={[
                    styles.pathwayCourseCard, 
                    { backgroundColor: themeColors.card },
                    locked && { backgroundColor: isDark ? '#1e293b' : '#F8FAFC', opacity: 0.75 }
                  ]}
                  onPress={() => handleCoursePress(pc)}
                  activeOpacity={locked ? 1 : 0.85}
                >
                  {/* Order badge */}
                  <View style={[styles.orderBadge, {
                    backgroundColor: locked ? (isDark ? '#334155' : '#E2E8F0') : completed ? '#22C55E' : pathwayMeta!.color,
                  }]}>
                    {completed
                      ? <CheckCircle2 size={14} color="#fff" />
                      : locked
                        ? <Lock size={12} color="#94A3B8" />
                        : <Text style={styles.orderNum}>{idx + 1}</Text>
                    }
                  </View>

                  {/* Course info */}
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.pathwayCourseTitle, { color: themeColors.text }, locked && { color: themeColors.textMuted }]} numberOfLines={1}>
                      {pc.course?.title ?? 'Curso'}
                    </Text>

                    {/* Progress bar for enrolled & not locked */}
                    {!locked && progress > 0 && (
                      <View style={[styles.progressTrack, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                        <View style={[styles.progressBar, {
                          width: `${Math.min(progress, 100)}%` as any,
                          backgroundColor: completed ? '#22C55E' : pathwayMeta!.color,
                        }]} />
                      </View>
                    )}

                    {locked && (
                      <Text style={[styles.lockedHint, { color: themeColors.textMuted }]}>
                        <Ionicons name="lock-closed-outline" size={11} color={themeColors.textMuted} /> Conclua o curso anterior para desbloquear
                      </Text>
                    )}
                    {completed && (
                      <Text style={styles.completedHint}>
                        <Ionicons name="checkmark-circle" size={11} color="#22C55E" /> Concluído
                        {impactPercent !== null ? ` • ${impactPercent}% melhoria` : ''}
                      </Text>
                    )}
                    {!locked && !completed && progress > 0 && (
                      <Text style={[styles.progressHint, { color: pathwayMeta!.color }]}>
                        Continuar • {Math.round(progress)}% concluído
                      </Text>
                    )}
                  </View>

                  {!locked && <ChevronRight size={16} color={themeColors.textMuted} />}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : null}

        {popularCourses.length > 0 && renderHorizontalCourseList('Cursos Populares', popularCourses)}

        {/* Jobs Promotion Card */}
        <View style={[styles.jobsPromoCard, { backgroundColor: isDark ? themeColors.card : '#EEF2FF', borderColor: isDark ? themeColors.border : '#E0E7FF' }]}>
          <View style={styles.jobsPromoContent}>
            <Text style={[styles.jobsPromoTitle, { color: isDark ? themeColors.text : '#1E3A8A' }]}>Explorar oportunidades</Text>
            <Text style={[styles.jobsPromoText, { color: themeColors.textMuted }]}>Encontre vagas de emprego, estágios e oportunidades de crescimento profissional na sua área.</Text>
            <TouchableOpacity 
              style={[styles.jobsPromoBtn, { backgroundColor: themeColors.primary }]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Oportunidades')}
            >
              <Text style={styles.jobsPromoBtnText}>Ver oportunidades</Text>
            </TouchableOpacity>
          </View>
          <Image 
            source={require('../../assets/happy_professional.png')} 
            style={styles.jobsPromoImage}
            resizeMode="cover"
          />
        </View>

        {recentCourses.length > 0 && renderHorizontalCourseList('Cursos Recentes', recentCourses)}

        {/* MazaBot Promo Card */}
        <View style={[styles.botPromoCard, { backgroundColor: themeColors.card }]}>
          <View style={styles.botPromoContent}>
            <Text style={[styles.botPromoTitle, { color: themeColors.text }]}>Personalizar Experiência</Text>
            <Text style={[styles.botPromoText, { color: themeColors.textMuted }]}>Descubra o que combina consigo. Responda perguntas rápidas para melhorar as suas recomendações.</Text>
            <TouchableOpacity 
              style={[styles.botPromoBtn, { backgroundColor: '#8B5CF6' }]}
              activeOpacity={0.8}
              onPress={() => navigation.navigate('BotAssessment')}
            >
              <Text style={styles.botPromoBtnText}>Começar Agora</Text>
            </TouchableOpacity>
          </View>
          <View style={[styles.botPromoIconContainer, { backgroundColor: isDark ? '#2e1065' : '#EDE9FE' }]}>
            <Bot size={56} color="#8B5CF6" strokeWidth={1.5} />
          </View>
        </View>

        <View style={{ height: 40 }} />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  webPage: { width: '100%', maxWidth: 1100, alignSelf: 'center', paddingTop: 8 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 24, paddingBottom: 10 },
  greeting: { fontSize: 16, color: colors.textMuted },
  greetingBold: { fontSize: 22, color: colors.text, fontWeight: 'bold' },
  notificationBtn: { backgroundColor: colors.white, padding: 12, borderRadius: 20, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 },
  careerBanner: { marginHorizontal: 20, marginBottom: 16, borderWidth: 1, borderRadius: 14, padding: 13, flexDirection: 'row', alignItems: 'center', gap: 11 },
  careerBannerIcon: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  careerBannerTitle: { fontSize: 14, fontWeight: '700', marginBottom: 3 },
  careerBannerText: { fontSize: 11.5, lineHeight: 16 },
  evolutionCard: {
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 18,
    borderWidth: 1,
    borderRadius: 8,
    overflow: 'hidden',
    shadowColor: '#0369A1',
    shadowOpacity: 0.2,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 2,
  },
  webEvolutionCard: { width: '65%', minWidth: 600, maxWidth: 720, alignSelf: 'center' },
  evolutionWatermark: {
    position: 'absolute',
    right: -34,
    bottom: -46,
    width: 176,
    height: 176,
    opacity: 0.08,
    tintColor: '#0284C7',
    transform: [{ rotate: '-10deg' }],
  },
  evolutionMain: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, paddingVertical: 14 },
  progressRingWrap: { width: 124, alignItems: 'center', justifyContent: 'center' },
  progressRingCenter: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  progressRingValue: { color: '#FFFFFF', fontSize: 24, lineHeight: 27, fontWeight: '700' },
  progressRingLabel: { width: 78, color: 'rgba(255,255,255,0.82)', textAlign: 'center', fontSize: 11, lineHeight: 13, fontWeight: '600', marginTop: 1 },
  rhythmStats: { flex: 1, minWidth: 0, marginLeft: 8, paddingLeft: 16, borderLeftWidth: 1, borderLeftColor: 'rgba(255,255,255,0.32)', gap: 9 },
  rhythmRow: { flexDirection: 'row', alignItems: 'center' },
  rhythmIcon: { width: 24, height: 32, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  rhythmText: { flex: 1, minWidth: 0, marginLeft: 10 },
  rhythmValue: { color: '#FFFFFF', fontSize: 15, lineHeight: 18, fontWeight: '700' },
  rhythmLabel: { color: 'rgba(255,255,255,0.78)', fontSize: 11, marginTop: 1 },

  section: { paddingHorizontal: 20, marginTop: 4 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: colors.text },
  seeAll: { color: colors.primary, fontWeight: '600', fontSize: 13 },

  // Pathway banner
  pathwayBanner: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white,
    borderRadius: 16, padding: 14, marginBottom: 12, gap: 12,
    borderLeftWidth: 4,
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2,
  },
  pathwayBannerEmoji: { fontSize: 28 },
  pathwayBannerLabel: { fontSize: 11, color: colors.textMuted, fontWeight: '600', textTransform: 'uppercase' },
  pathwayBannerName: { fontSize: 15, fontWeight: 'bold', lineHeight: 20 },

  // Pathway course cards
  pathwayCourseCard: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: colors.white, borderRadius: 14, padding: 14, marginBottom: 8,
    shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 6, elevation: 1,
  },
  pathwayCourseCardLocked: { backgroundColor: '#F8FAFC', opacity: 0.75 },
  orderBadge: {
    width: 32, height: 32, borderRadius: 16,
    justifyContent: 'center', alignItems: 'center', flexShrink: 0,
  },
  orderNum: { color: '#fff', fontWeight: 'bold', fontSize: 13 },
  pathwayCourseTitle: { fontSize: 14, fontWeight: '600', color: colors.text, marginBottom: 3 },
  lockedText: { color: colors.textMuted },
  lockedHint: { fontSize: 11, color: '#94A3B8', marginTop: 2 },
  completedHint: { fontSize: 11, color: '#22C55E', fontWeight: '600', marginTop: 2 },
  progressHint: { fontSize: 11, fontWeight: '600', marginTop: 2 },
  progressTrack: { height: 3, backgroundColor: '#E2E8F0', borderRadius: 2, marginTop: 5, overflow: 'hidden' },
  progressBar: { height: '100%', borderRadius: 2 },

  // Generic course cards (now horizontal)
  horizontalSection: { marginTop: 8, marginBottom: 12 },
  horizontalScrollContent: { paddingHorizontal: 20, gap: 12, paddingBottom: 4 },
  tabletCourseGrid: { paddingHorizontal: 20, gap: 12, paddingBottom: 4, flexDirection: 'row', flexWrap: 'wrap' },
  horizontalCourseCard: { 
    width: 126, minHeight: 164, backgroundColor: colors.white, borderRadius: 14, padding: 8, 
    shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 10, elevation: 2 
  },
  tabletCourseCard: { width: '23.5%', minWidth: 150 },
  cardImg: { width: '100%', aspectRatio: 16 / 9, backgroundColor: '#F1F5F9', borderRadius: 10, marginBottom: 9, position: 'relative', overflow: 'hidden' },
  cardCat: { width: '100%', flexShrink: 1, fontSize: 10, fontWeight: 'bold', color: colors.primary, marginBottom: 4, textTransform: 'uppercase' },
  horizontalCourseTitle: { fontSize: 12, fontWeight: '700', color: colors.text, marginBottom: 4, lineHeight: 16, minHeight: 32 },
  instructorText: { fontSize: 11, color: colors.textMuted },

  // Jobs Promo Card
  jobsPromoCard: {
    backgroundColor: '#EEF2FF',
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E7FF',
    minHeight: 126,
  },
  jobsPromoContent: {
    flex: 1,
    padding: 16,
    justifyContent: 'center',
    minWidth: 0,
  },
  jobsPromoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E3A8A',
    marginBottom: 6,
  },
  jobsPromoText: {
    fontSize: 13,
    color: '#475569',
    lineHeight: 18,
    marginBottom: 12,
  },
  jobsPromoBtn: {
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  jobsPromoBtnText: {
    color: '#fff',
    fontSize: 13,
    fontWeight: 'bold',
  },
  jobsPromoImage: {
    width: 112,
    height: 126,
  },
  botPromoCard: {
    backgroundColor: '#F8FAFC',
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 20,
    borderRadius: 20,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3,
  },
  botPromoContent: { flex: 1, padding: 20 },
  botPromoTitle: { fontSize: 18, fontWeight: 'bold', color: '#1E293B', marginBottom: 6 },
  botPromoText: { fontSize: 13, color: '#475569', lineHeight: 18, marginBottom: 16 },
  botPromoBtn: { backgroundColor: '#8B5CF6', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 12, alignSelf: 'flex-start' },
  botPromoBtnText: { color: colors.white, fontWeight: 'bold', fontSize: 13 },
  botPromoIconContainer: { width: 100, justifyContent: 'center', alignItems: 'center', backgroundColor: '#EDE9FE', borderTopRightRadius: 20, borderBottomRightRadius: 20 },
});

