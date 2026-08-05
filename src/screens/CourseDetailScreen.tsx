import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, ImageBackground, Alert, Platform, RefreshControl, Share, useWindowDimensions
} from 'react-native';
import { useTheme } from '../context/ThemeContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { Award, BookOpen, Play, Lock, CheckCircle, FileText, Headphones, Globe, AlignLeft, ClipboardList, Download, MessageCircle } from 'lucide-react-native';
import api, { API_BASE as _API_BASE, getPersistentCached, refreshPersistentCached } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { trackActivity } from '../services/analytics';
import { downloadCertificatePDF } from '../utils/certificateGenerator';
import CourseBokehBg from '../components/CourseBokehBg';
import { Ionicons } from '@expo/vector-icons';
import CertificatePreview from '../components/CertificatePreview';
import { useIsWideWeb } from '../utils/webViewport';
import { getOfflineCourseSnapshot } from '../services/offlineCourses';
import CourseOfflineDownloadCard from '../components/CourseOfflineDownloadCard';

const API_BASE = _API_BASE.replace('/api', '');

/** Resolve thumbnail URL — backend stores relative (/uploads/…) or full http:// paths */
function resolveThumbnail(thumbnail: string | null | undefined): string | null {
  if (!thumbnail) return null;
  if (thumbnail.startsWith('http')) return thumbnail;
  return `${API_BASE}${thumbnail}`;
}

const CONTENT_ICONS: Record<string, any> = {
  VIDEO: Play,
  AUDIO: Headphones,
  PDF: FileText,
  HTML: Globe,
  TEXT: AlignLeft,
  QUIZ: ClipboardList,
};

const CONTENT_COLORS: Record<string, string> = {
  VIDEO: '#8B5CF6',
  AUDIO: '#EC4899',
  PDF: '#EF4444',
  HTML: '#F59E0B',
  TEXT: '#14B8A6',
  QUIZ: '#6366F1',
};

const CONTENT_LABELS: Record<string, string> = {
  VIDEO: 'Vídeo',
  AUDIO: 'Áudio',
  PDF: 'PDF',
  HTML: 'Atividade',
  TEXT: 'Texto',
  QUIZ: 'Quiz',
};

const LESSONS_BATCH_SIZE = 12;
const WEB_VERTICAL_PAN_STYLE = Platform.OS === 'web'
  ? ({ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' } as any)
  : null;

export default function CourseDetailScreen({ route, navigation }: any) {
  const { colors: themeColors, isDark } = useTheme();
  const { courseId } = route.params;
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const initialCourse = useMemo(() => {
    const passedCourse = route.params?.course;
    const source = passedCourse?.course ?? passedCourse ?? {};
    const title = source.title ?? route.params?.title;
    if (!passedCourse && !title) return null;
    return {
      id: source.id ?? passedCourse?.courseId ?? courseId,
      title: title ?? 'Curso',
      instructor: source.instructor ?? 'MAZA',
      description: source.description ?? '',
      thumbnail: source.thumbnail ?? null,
      category: null,
      categories: [],
      prerequisiteCourseId: source.prerequisiteCourseId ?? passedCourse?.prerequisiteCourseId ?? null,
      prerequisiteCourse: source.prerequisiteCourse ?? passedCourse?.prerequisiteCourse ?? null,
      prerequisiteTitle: source.prerequisiteTitle ?? passedCourse?.prerequisiteTitle ?? source.prerequisiteCourse?.title ?? null,
      isLocked: !!(source.isLocked ?? passedCourse?.isLocked ?? source.prerequisiteCourseId ?? passedCourse?.prerequisiteCourseId),
      rating: source.rating ?? 0,
      modules: Array.isArray(source.modules) ? source.modules : [],
      _count: source._count ?? {},
    };
  }, [courseId, route.params?.course, route.params?.title]);

  const [course, setCourse] = useState<any>(initialCourse);
  const [progress, setProgress] = useState<any>(null);
  const [loading, setLoading] = useState(!initialCourse);
  const [refreshing, setRefreshing] = useState(false);
  const [detailLoaded, setDetailLoaded] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, number>>({});
  const didFirstLoadRef = useRef(false);
  const lastFocusRefreshRef = useRef(0);

  const { width, height } = useWindowDimensions();
  const isWideWeb = useIsWideWeb(1024);
  const webContentPanelHeight = isWideWeb
    ? Math.max(360, Math.min(720, height - 390))
    : undefined;

  useEffect(() => {
    if (course?.title) navigation.setOptions({ title: course.title });
  }, [course?.title, navigation]);

  const handleBack = () => {
    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }
    navigation.navigate('Main', { screen: 'Cursos' });
  };

  const fetchData = useCallback(async (mode: 'initial' | 'manual' | 'background' = 'background') => {
    const showSpinner = mode === 'initial';
    if (showSpinner) setLoading(true);
    if (mode === 'manual') setRefreshing(true);
    try {
      const courseUrl = `/courses/${courseId}?lessonScope=unlocked`;
      const progressUrl = `/progress/course/${courseId}?lessonScope=unlocked`;
      const coursePromise = refreshPersistentCached(courseUrl, 10 * 60 * 1000)
        .then((freshCourse) => {
          setCourse(freshCourse);
          setDetailLoaded(true);
        })
        .catch(async () => {
          const offlineSnapshot = await getOfflineCourseSnapshot(courseId).catch(() => null);
          if (offlineSnapshot) {
            setCourse(offlineSnapshot);
            setDetailLoaded(true);
            return;
          }
          try {
            const cachedCourse = await getPersistentCached(courseUrl, 10 * 60 * 1000);
            if (cachedCourse) {
              setCourse(cachedCourse);
              setDetailLoaded(true);
            }
          } catch {}
        });

      const progressPromise = isAuthenticated
        ? api.get(progressUrl)
            .then((progressRes) => {
              setProgress(progressRes.data);
            })
            .catch(() => {
              if (mode !== 'background') setProgress(null);
            })
        : Promise.resolve().then(() => setProgress(null));

      if (showSpinner) {
        await coursePromise;
        setLoading(false);
      }

      await progressPromise;
    } catch {
      if (mode !== 'background') setProgress(null);
    }
    setDetailLoaded(true);
    setLoading(false);
    setRefreshing(false);
  }, [courseId, isAuthenticated]);

  useEffect(() => {
    didFirstLoadRef.current = false;
    setCourse(initialCourse);
    setProgress(null);
    setLoading(!initialCourse);
    setRefreshing(false);
    setDetailLoaded(false);
  }, [courseId, initialCourse]);

  useEffect(() => {
    if (isAuthenticated && courseId) trackActivity({ type: 'COURSE_OPEN', courseId });
  }, [courseId, isAuthenticated]);

  useFocusEffect(useCallback(() => {
    const firstLoad = !didFirstLoadRef.current;
    const showSpinner = firstLoad && !initialCourse;
    const now = Date.now();
    if (!firstLoad && now - lastFocusRefreshRef.current < 20000) return;
    didFirstLoadRef.current = true;
    lastFocusRefreshRef.current = now;
    fetchData(showSpinner ? 'initial' : 'background');
  }, [fetchData, initialCourse]));

  const getModuleProgress = (moduleId: string) =>
    progress?.modules?.find((m: any) => m.id === moduleId);

  const getLessonCompleted = (moduleId: string, lessonId: string) => {
    const mod = getModuleProgress(moduleId);
    return mod?.lessons?.find((l: any) => l.id === lessonId)?.isCompleted ?? false;
  };

  const moduleLessonsCount = course?.modules?.reduce(
    (a: number, m: any) => a + (m.lessonCount ?? m._count?.lessons ?? m.lessons?.length ?? 0),
    0
  ) ?? 0;
  const totalLessons = moduleLessonsCount || course?._count?.lessons || 0;
  const completedLessons = progress?.modules
    ? progress.modules.reduce(
        (a: number, m: any) => a + (m.lessons?.filter((l: any) => l.isCompleted).length ?? 0), 0
      )
    : course?.modules?.reduce(
        (a: number, m: any) => a + (m.lessons?.filter((l: any) => l.isCompleted).length ?? 0), 0
      ) ?? 0;
  const visibleVideoLessons = course?.modules?.flatMap((module: any) => module.lessons ?? [])
    .filter((lesson: any) => lesson.contentType === 'VIDEO') ?? [];
  const visibleVideoDurationSeconds = visibleVideoLessons.reduce(
    (total: number, lesson: any) => total + Math.max(0, Number(lesson.duration ?? 0) || 0),
    0
  );
  const visibleVideosWithDuration = visibleVideoLessons.filter(
    (lesson: any) => Number(lesson.duration ?? 0) > 0
  ).length;
  const totalDurationSeconds = Math.max(
    Number(course?.videoDurationSeconds ?? 0) || 0,
    visibleVideoDurationSeconds
  );
  const totalVideoLessons = Number(course?.videoLessonsCount ?? visibleVideoLessons.length) || 0;
  const videosWithDuration = Math.max(
    Number(course?.videoLessonsWithDuration ?? 0) || 0,
    visibleVideosWithDuration
  );
  const durationIsPartial = videosWithDuration > 0 && videosWithDuration < totalVideoLessons;
  const durationLabel = totalDurationSeconds > 0
    ? totalDurationSeconds >= 3600
      ? `${Math.floor(totalDurationSeconds / 3600)}h ${Math.round((totalDurationSeconds % 3600) / 60)}min${durationIsPartial ? '+' : ''}`
      : `${Math.max(1, Math.round(totalDurationSeconds / 60))} min${durationIsPartial ? '+' : ''}`
    : '—';

  const enrollmentProgress = progress?.enrollmentProgress ?? 0;
  const hasStarted = enrollmentProgress > 0 || completedLessons > 0;
  const impact = progress?.impact;
  const prerequisite = progress?.prerequisite;
  const prerequisiteTitle = prerequisite?.title ?? course?.prerequisiteTitle ?? course?.prerequisiteCourse?.title ?? 'o curso anterior';
  const courseLocked = prerequisite ? !!(prerequisite.required && !prerequisite.completed) : !!course?.isLocked || !!course?.prerequisiteCourseId;
  const hasLessons = totalLessons > 0;
  const detailsPending = !detailLoaded && !hasLessons;
  const requiresLogin = !isAuthenticated;
  const ctaDisabled = !requiresLogin && (courseLocked || detailsPending || !hasLessons);
  const baselinePending = !courseLocked && (impact
    ? !!impact.baselineRequired && !impact.baselineCompleted
    : course?.offlineAccess?.baselineCompleted === false);
  const lessonsComplete = hasLessons && (enrollmentProgress >= 100 || completedLessons >= totalLessons);
  const endlinePending = lessonsComplete && !!impact?.endlineRequired && !impact?.endlineCompleted;
  const isComplete = lessonsComplete && !endlinePending;
  const courseCategories = useMemo(() => {
    const categories = Array.isArray(course?.categories) && course.categories.length > 0
      ? course.categories
      : course?.category
      ? [course.category]
      : [];
    const seen = new Set<string>();
    return categories.filter((category: any) => {
      const key = category?.id ?? category?.name;
      if (!key || seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }, [course?.categories, course?.category]);

  const findFirstUncompletedLesson = () => {
    if (baselinePending) return null;
    const progressModules = progress?.modules ?? course?.modules ?? [];
    for (const mod of progressModules) {
      if (!mod.isUnlocked) continue;
      for (const lesson of mod.lessons ?? []) {
        if (!lesson.isCompleted) {
          let richLesson = lesson;
          if (course?.modules) {
            for (const cMod of course.modules) {
              const found = cMod.lessons?.find((l: any) => l.id === lesson.id);
              if (found) {
                richLesson = found;
                break;
              }
            }
          }
          return { lesson: richLesson, lessonId: richLesson.id, courseId };
        }
      }
    }
    return null;
  };

  const prefetchLessonId = useMemo(() => {
    const target = findFirstUncompletedLesson();
    return target?.lessonId ?? course?.modules?.[0]?.lessons?.[0]?.id ?? null;
  }, [baselinePending, course, progress]);

  useEffect(() => {
    if (!isAuthenticated || !prefetchLessonId) return;
    getPersistentCached(`/courses/lessons/${prefetchLessonId}`, 30 * 60 * 1000).catch(() => {});
  }, [isAuthenticated, prefetchLessonId]);

  const handleCTA = async () => {
    if (requiresLogin) {
      navigation.navigate('Login');
      return;
    }
    if (courseLocked) {
      Alert.alert('Curso bloqueado', `Complete ${prerequisiteTitle} para desbloquear este curso.`);
      return;
    }
    if (detailsPending) {
      Alert.alert('A carregar lições', 'Aguarde enquanto carregamos o conteúdo do curso.');
      return;
    }
    if (!hasLessons) {
      Alert.alert('Curso sem lições', 'Este curso ainda não tem lições disponíveis.');
      return;
    }
    if (baselinePending) {
      navigation.navigate('ImpactAssessment', { courseId, type: 'BASELINE', assessment: impact?.baseline });
      return;
    }
    if (endlinePending) {
      navigation.navigate('ImpactAssessment', { courseId, type: 'ENDLINE', assessment: impact?.endline });
      return;
    }
    if (isComplete) {
      setShowCertificate(true);
      return;
    }
    const target = findFirstUncompletedLesson();
    if (target) {
      navigation.navigate('LessonViewer', target);
      return;
    }
    if (completedLessons < totalLessons) {
      try {
        const fresh = await api.get(`/progress/course/${courseId}`);
        const freshProgress = fresh.data;
        for (const mod of freshProgress.modules ?? []) {
          if (!mod.isUnlocked) continue;
          for (const lesson of mod.lessons ?? []) {
            if (!lesson.isCompleted) {
              setProgress(freshProgress);
              let richLesson = lesson;
              if (course?.modules) {
                for (const cMod of course.modules) {
                  const found = cMod.lessons?.find((l: any) => l.id === lesson.id);
                  if (found) {
                    richLesson = found;
                    break;
                  }
                }
              }
              navigation.navigate('LessonViewer', { lesson: richLesson, lessonId: richLesson.id, courseId });
              return;
            }
          }
        }
        Alert.alert('Módulo Bloqueado', 'Complete os módulos anteriores para continuar.');
        return;
      } catch {}
    }
    
    if (isComplete) {
      setShowCertificate(true);
    } else {
      const firstLesson = course?.modules?.[0]?.lessons?.[0];
      if (firstLesson) navigation.navigate('LessonViewer', { lesson: firstLesson, lessonId: firstLesson.id, courseId });
    }
  };

  const handleShare = async () => {
    const url = `https://web.mazas.org/curso/${encodeURIComponent(String(courseId))}`;
    if (Platform.OS === 'web') {
      const webNavigator = globalThis.navigator as any;
      const shareData = {
        title: course?.title ?? 'Curso MAZA',
        text: `Veja o curso ${course?.title ?? ''} no Maza.`,
        url,
      };

      if (typeof webNavigator?.share === 'function') {
        try {
          await webNavigator.share(shareData);
          return;
        } catch (error: any) {
          if (error?.name === 'AbortError') return;
        }
      }

      let copied = false;
      try {
        await webNavigator?.clipboard?.writeText(url);
        copied = true;
      } catch {}
      Alert.alert(copied ? 'Link copiado' : 'Link do curso', copied ? 'O link deste curso foi copiado.' : url);
      return;
    }
    await Share.share({
      title: course?.title ?? 'Curso MAZA',
      message: `Veja o curso ${course?.title ?? ''} no MAZA: ${url}`,
      url,
    }).catch(() => {});
  };

  const ctaLabel = requiresLogin
    ? 'Entrar para estudar'
    : courseLocked
      ? 'Curso bloqueado'
    : detailsPending
      ? 'A carregar lições...'
    : !hasLessons
      ? 'Sem lições disponíveis'
      : baselinePending
        ? 'Fazer Avaliação Inicial'
        : endlinePending
          ? 'Fazer Avaliação Final'
          : isComplete
            ? 'Ver Certificado'
            : hasStarted
              ? 'Continuar'
              : 'Começar a Estudar';

  const certDate = progress?.certificate?.issuedAt
    ? new Date(progress.certificate.issuedAt).toLocaleDateString('pt-PT', { day: '2-digit', month: 'long', year: 'numeric' })
    : null;

  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.container, { backgroundColor: themeColors.background }]}>
      <Modal visible={showCertificate} animationType="slide" transparent>
        <View style={styles.certOverlay}>
          <CertificatePreview
            style={styles.certCardLandscape}
            studentName={user?.name || user?.phone || 'Aprendiz Demo'}
            courseTitle={course?.title ?? ''}
            instructor={course?.instructor ?? 'MAZA'}
            issuedAt={progress?.certificate?.issuedAt ?? new Date().toISOString()}
            courseId={courseId}
            certificateId={progress?.certificate?.id ?? ''}
          />
          <View style={styles.certLegacyHidden}>
            <View style={styles.certBorderOuter}>
              <View style={styles.certBorderInner}>
                
                <Text style={styles.certLogoText}>MAZA</Text>
                
                <Text style={styles.certTitleLarge}>CERTIFICADO</Text>
                <Text style={styles.certSubtitle}>De Aproveitamento e Excelência</Text>
                
                <Text style={styles.certPresentedTo}>Atribuído a</Text>
                <Text style={styles.certStudentName}>{user?.name || user?.phone || 'Aprendiz Demo'}</Text>
                
                <View style={styles.certDividerLine} />
                
                <Text style={styles.certCompletionText}>por ter concluído com distinção o curso de</Text>
                <Text style={styles.certCourseName}>{course?.title?.toUpperCase()}</Text>
                
                <View style={styles.certSignatureArea}>
                  <Text style={styles.certSignatureCursive}>Artur J. Mondlane</Text>
                  <View style={styles.certSignatureLine} />
                  <Text style={styles.certSignatureRole}>MINISTÉRIO DA EDUCAÇÃO</Text>
                </View>
                
                <Text style={styles.certFooterInfo}>
                  ID: MAZA-{progress?.certificate?.id?.substring(0,8).toUpperCase()} • EMITIDO A {certDate} • INICIATIVA MAZA & UNICEF MOÇAMBIQUE
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.certActionsRow}>
            <TouchableOpacity 
              style={[styles.certPrintBtn, generatingPDF && { opacity: 0.6 }]} 
              disabled={generatingPDF}
              onPress={async () => {
                if (!progress?.certificate) return;
                setGeneratingPDF(true);
                await downloadCertificatePDF({
                  studentName: user?.name || user?.phone || 'Estudante',
                  courseTitle: course?.title ?? '',
                  instructor: course?.instructor ?? 'MAZA',
                  issuedAt: progress.certificate.issuedAt,
                  courseId,
                  certificateId: progress.certificate.id,
                });
                setGeneratingPDF(false);
              }}
            >
              <Download size={18} color="#fff" />
              <Text style={styles.certPrintBtnText}>{generatingPDF ? 'A gerar PDF...' : 'Imprimir / Guardar em PDF'}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.certCloseBtn} onPress={() => setShowCertificate(false)}>
              <Text style={styles.certCloseBtnText}>Fechar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {loading ? (
        <View style={styles.loadingState}>
          <ActivityIndicator color={themeColors.primary} />
          <Text style={[styles.loadingText, { color: themeColors.textMuted }]}>A abrir o curso...</Text>
        </View>
      ) : course ? (
        <>
        {Platform.OS !== 'web' && (
          <View style={[styles.floatingCourseNav, { top: insets.top + 10 }]} pointerEvents="box-none">
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar" onPress={handleBack} style={styles.heroIconButton}>
              <Ionicons name="arrow-back" size={21} color="#fff" />
            </TouchableOpacity>
            <TouchableOpacity accessibilityRole="button" accessibilityLabel="Partilhar curso" onPress={handleShare} style={styles.heroIconButton}>
              <Ionicons name="share-outline" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
        )}
        <ScrollView 
          style={WEB_VERTICAL_PAN_STYLE}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[
            { paddingBottom: isWideWeb ? Math.max(insets.bottom, 24) : Math.max(insets.bottom, 24) + 96 },
            WEB_VERTICAL_PAN_STYLE,
          ]}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData('manual')} />}
        >
          <View style={isWideWeb ? styles.webHeroFrame : undefined}>
          {(() => {
            const thumbUri = resolveThumbnail(course.thumbnail);
            const heroContent = (
              <View style={[styles.heroOverlay, isWideWeb && styles.webHeroOverlay, { paddingTop: insets.top }]}>
                {Platform.OS === 'web' ? <View style={styles.heroActions}>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Voltar" onPress={handleBack} style={styles.heroIconButton}>
                    <Ionicons name="arrow-back" size={21} color="#fff" />
                  </TouchableOpacity>
                  <TouchableOpacity accessibilityRole="button" accessibilityLabel="Partilhar curso" onPress={handleShare} style={styles.heroIconButton}>
                    <Ionicons name="share-outline" size={20} color="#fff" />
                  </TouchableOpacity>
                </View> : <View style={styles.heroActionsSpacer} />}
                <View style={styles.heroCopy}>
                {courseCategories.length > 0 && (
                  <View style={styles.categoryRow}>
                    {courseCategories.map((category: any) => (
                      <View key={category.id ?? category.name} style={styles.categoryPill}>
                        <Text style={styles.category}>{category.icon ? `${category.icon} ` : ''}{category.name}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <Text style={[styles.heroTitle, isWideWeb && styles.webHeroTitle]}>{course.title}</Text>
                <Text style={styles.instructor}>
                  <Ionicons name="person-outline" size={14} color="rgba(255,255,255,0.85)" /> {course.instructor}
                  {hasLessons ? `  ·  ${totalLessons} ${totalLessons === 1 ? 'lição' : 'lições'}${durationLabel !== '—' ? `  ·  ${durationLabel}` : ''}  ·  ${course.rating > 0 ? `${course.rating.toFixed(1)} ★` : 'Sem avaliação'}` : ''}
                </Text>
                {!!course.description && <Text style={styles.description} numberOfLines={2}>{course.description}</Text>}
                </View>
              </View>
            );
            if (thumbUri) {
              return (
                <ImageBackground
                  source={{ uri: thumbUri }}
                  style={[styles.hero, isWideWeb && styles.webHero]}
                  imageStyle={isWideWeb ? styles.webHeroImage : undefined}
                  resizeMode="cover"
                >
                  {heroContent}
                </ImageBackground>
              );
            }
            return (
              <CourseBokehBg
                courseId={course.id}
                title={course.title}
                width={width}
                contentSized
                style={[{ width: '100%' }, isWideWeb && styles.webHero]}
              >
                {heroContent}
              </CourseBokehBg>
            );
          })()}
          </View>

          <View style={isWideWeb ? styles.webCourseBody : undefined}>
            <View style={isWideWeb ? styles.webCourseMain : undefined}>
          {hasLessons && (
            <View style={[styles.progressContainer, isWideWeb && styles.webPanel, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <View style={styles.progressRow}>
                <Text style={[styles.progressLabel, { color: themeColors.text }]}>Progresso do Curso</Text>
                <Text style={[styles.progressPercent, { color: themeColors.primary }, isComplete && { color: themeColors.success }]}>
                  {Math.round(enrollmentProgress)}%
                </Text>
              </View>
              <View style={[styles.progressTrack, { backgroundColor: isDark ? '#334155' : '#E2E8F0' }]}>
                <View style={[styles.progressFill,
                  { width: `${Math.min(enrollmentProgress, 100)}%`, backgroundColor: themeColors.primary },
                  isComplete && { backgroundColor: themeColors.success }
                ]} />
              </View>
              <Text style={[styles.progressSub, { color: themeColors.textMuted }]}>{completedLessons} de {totalLessons} lições concluídas</Text>
            </View>
          )}

          {isWideWeb && hasLessons && (
            <View style={[styles.webNextCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <Text style={[styles.webNextTitle, { color: themeColors.text }]}>
                {requiresLogin ? 'Pronto para começar?' : isComplete ? 'Curso concluído' : hasStarted ? 'Continue a aprender' : 'Comece este curso'}
              </Text>
              <Text style={[styles.webNextText, { color: themeColors.textMuted }]}>
                {requiresLogin
                  ? 'Inicie sessão para guardar o seu progresso e aceder às aulas.'
                  : isComplete
                    ? 'Parabéns! O seu certificado está pronto para consultar.'
                    : hasStarted
                      ? 'Retome a próxima aula disponível e continue o seu progresso.'
                      : 'Avance ao seu ritmo e acompanhe o progresso de cada módulo.'}
              </Text>
              <TouchableOpacity
                accessibilityRole="button"
                style={[
                  styles.webNextButton,
                  { backgroundColor: themeColors.primary },
                  isComplete && { backgroundColor: themeColors.success },
                  ctaDisabled && { backgroundColor: themeColors.textMuted },
                ]}
                onPress={handleCTA}
                disabled={ctaDisabled}
              >
                {courseLocked ? <Lock size={16} color="#fff" /> : isComplete ? <Award size={16} color="#fff" /> : <Play size={16} color="#fff" fill="#fff" />}
                <Text style={styles.webNextButtonText}>{ctaLabel}</Text>
              </TouchableOpacity>
            </View>
          )}

          {impact?.required && (baselinePending || endlinePending) && (
            <View style={[styles.impactCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <View style={styles.impactHeader}>
                <View style={[styles.impactIcon, { backgroundColor: themeColors.primary + '18' }]}>
                  <ClipboardList size={18} color={themeColors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.impactTitle, { color: themeColors.text }]}>Melhoria de aprendizagem</Text>
                  <Text style={[styles.impactSub, { color: themeColors.textMuted }]}>
                    Baseline e endline medem a melhoria neste curso.
                  </Text>
                </View>
                {impact.result?.impactPercent !== null && impact.result?.impactPercent !== undefined ? (
                  <Text style={[styles.impactScore, { color: themeColors.success }]}>{impact.result.impactPercent}%</Text>
                ) : null}
              </View>
              <View style={styles.impactSteps}>
                <Text style={[styles.impactStep, { color: impact.baselineCompleted ? themeColors.success : themeColors.textMuted }]}>
                  {impact.baselineCompleted ? '✓' : '1'} Inicial
                </Text>
                <Text style={[styles.impactStep, { color: impact.endlineCompleted ? themeColors.success : themeColors.textMuted }]}>
                  {impact.endlineCompleted ? '✓' : '2'} Final
                </Text>
              </View>
              {(baselinePending || endlinePending) && (
                <TouchableOpacity
                  style={[styles.impactActionBtn, { backgroundColor: themeColors.primary }]}
                  onPress={handleCTA}
                >
                  <BookOpen size={16} color="#fff" />
                  <Text style={styles.impactActionText}>
                    {baselinePending ? 'Fazer avaliação inicial' : 'Fazer avaliação final'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          )}

          {(courseLocked || (!hasLessons && detailLoaded)) && (
            <View style={[styles.lockNotice, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <View style={[styles.lockNoticeIcon, { backgroundColor: themeColors.textMuted + '18' }]}>
                <Lock size={18} color={themeColors.textMuted} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.lockNoticeTitle, { color: themeColors.text }]}>
                  {courseLocked ? 'Curso bloqueado' : 'Curso em preparação'}
                </Text>
                <Text style={[styles.lockNoticeText, { color: themeColors.textMuted }]}>
                  {courseLocked
                    ? `Complete ${prerequisiteTitle} para desbloquear este curso.`
                    : 'Este curso ainda não tem lições disponíveis.'}
                </Text>
              </View>
            </View>
          )}

          {hasLessons && (
            <View style={[styles.courseUtilityRow, isWideWeb && styles.webUtilityRow, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              {Platform.OS !== 'web' && <CourseOfflineDownloadCard course={course} variant="action" />}
              <TouchableOpacity
                accessibilityRole="button"
                accessibilityLabel="Abrir comunidade do curso"
                style={styles.courseUtilityItem}
                onPress={() => navigation.navigate('CourseForum', { courseId, courseTitle: course.title })}
              >
                <MessageCircle size={17} color={themeColors.primary} />
                <Text style={[styles.courseUtilityText, { color: themeColors.text }]}>Comunidade</Text>
                <Ionicons name="chevron-forward" size={15} color={themeColors.textMuted} />
              </TouchableOpacity>
            </View>
          )}
            </View>

          <View style={[
            styles.section,
            isWideWeb && styles.webLessonsSidebar,
            isWideWeb && { height: webContentPanelHeight },
            isWideWeb && { backgroundColor: themeColors.card, borderColor: themeColors.border },
          ]}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: themeColors.text }]} numberOfLines={1}>Conteúdo do Curso</Text>
              {!isWideWeb && <TouchableOpacity
                accessibilityRole="button"
                style={[
                  styles.sectionCourseAction,
                  { backgroundColor: themeColors.primary },
                  isComplete && { backgroundColor: themeColors.success },
                  ctaDisabled && { backgroundColor: themeColors.textMuted },
                ]}
                onPress={handleCTA}
                disabled={ctaDisabled}
              >
                {courseLocked ? <Lock size={15} color="#fff" /> : isComplete ? <Award size={15} color="#fff" /> : <Play size={15} color="#fff" fill="#fff" />}
                <Text style={styles.sectionCourseActionText} numberOfLines={1}>{ctaLabel}</Text>
              </TouchableOpacity>}
            </View>
            {detailsPending && (
              <View style={styles.lessonsLoading}>
                <ActivityIndicator size="small" color={themeColors.primary} />
                <Text style={[styles.emptyLessonsText, { color: themeColors.textMuted }]}>A carregar lições...</Text>
              </View>
            )}
            {!hasLessons && detailLoaded && (
              <Text style={[styles.emptyLessonsText, { color: themeColors.textMuted }]}>As lições serão adicionadas em breve.</Text>
            )}
            {(() => {
              const moduleList = (
                <View>
            {course.modules?.map((mod: any, idx: number) => {
              const modProgress = getModuleProgress(mod.id);
              const isUnlocked = !courseLocked && !baselinePending && (modProgress?.isUnlocked ?? mod.isUnlocked ?? (idx === 0));
              const isCompleted = modProgress?.isCompleted ?? mod.isCompleted ?? false;

              return (
                <View key={mod.id} style={[styles.moduleCard, isWideWeb && styles.webModuleCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }, !isUnlocked && styles.moduleCardLocked]}>
                  <View style={styles.moduleHeader}>
                    <View style={[styles.moduleNum, { backgroundColor: themeColors.primary }, isCompleted && { backgroundColor: themeColors.success }, !isUnlocked && { backgroundColor: themeColors.textMuted }]}>
                      {isCompleted ? <CheckCircle size={16} color="#fff" /> :
                       !isUnlocked ? <Lock size={16} color="#fff" /> :
                       <Text style={[styles.moduleNumText, { color: '#fff' }]}>{idx + 1}</Text>}
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.moduleTitle, { color: themeColors.text }, !isUnlocked && { color: themeColors.textMuted }]}>
                        {mod.title === '__FINAL_EXAM__' ? <><Ionicons name="school-outline" size={16} color={themeColors.text} /> Prova Final</> : mod.title}
                      </Text>
                      {!!mod.description && <Text style={[styles.moduleSub, { color: themeColors.textMuted }]}>{mod.description}</Text>}
                      {!isUnlocked && <Text style={[styles.lockHint, { color: themeColors.textMuted }]}><Ionicons name="lock-closed-outline" size={11} color={themeColors.textMuted}/> Complete o módulo anterior para desbloquear</Text>}
                    </View>
                  </View>

                  {!isUnlocked && (mod.lessonCount ?? mod._count?.lessons ?? 0) > 0 && (
                    <Text style={[styles.lockedLessonsCount, { color: themeColors.textMuted }]}>
                      {mod.lessonCount ?? mod._count?.lessons} lições bloqueadas
                    </Text>
                  )}

                  {(mod.lessons ?? []).slice(0, expandedModules[mod.id] ?? LESSONS_BATCH_SIZE).map((lesson: any) => {
                    const lessonDone = getLessonCompleted(mod.id, lesson.id) || !!lesson.isCompleted;
                    const Icon = CONTENT_ICONS[lesson.contentType] ?? Play;
                    const iconColor = CONTENT_COLORS[lesson.contentType] ?? themeColors.primary;

                    return (
                      <TouchableOpacity
                        key={lesson.id}
                        style={[styles.lessonRow, WEB_VERTICAL_PAN_STYLE, { borderTopColor: themeColors.border }, !isUnlocked && styles.lessonRowLocked]}
                        onPress={() => isUnlocked && navigation.navigate('LessonViewer', { lesson, lessonId: lesson.id, courseId })}
                        disabled={!isUnlocked}
                      >
                        <View style={[styles.lessonIcon, { backgroundColor: iconColor + '20' }]}>
                          <Icon size={14} color={iconColor} />
                        </View>
                      <View style={styles.lessonInfo}>
                        <Text style={[styles.lessonTitle, { color: themeColors.text }, !isUnlocked && { color: themeColors.textMuted }]} numberOfLines={1}>{lesson.title}</Text>
                        <Text style={[styles.lessonTypeText, { color: iconColor }]} numberOfLines={1}>{CONTENT_LABELS[lesson.contentType] ?? lesson.contentType}</Text>
                      </View>
                      <Text style={styles.lessonPoints}>+{lesson.points}pts</Text>
                        {lessonDone && <CheckCircle size={16} color={themeColors.success} style={{ marginLeft: 8 }} />}
                        {!isUnlocked && <Lock size={14} color={themeColors.textMuted} style={{ marginLeft: 4 }} />}
                      </TouchableOpacity>
                    );
                  })}
                  {(mod.lessons?.length ?? 0) > (expandedModules[mod.id] ?? LESSONS_BATCH_SIZE) && (
                    <TouchableOpacity
                      style={[styles.showMoreLessonsBtn, { borderTopColor: themeColors.border }]}
                      onPress={() => setExpandedModules((current) => ({
                        ...current,
                        [mod.id]: (current[mod.id] ?? LESSONS_BATCH_SIZE) + LESSONS_BATCH_SIZE,
                      }))}
                    >
                      <Text style={[styles.showMoreLessonsText, { color: themeColors.primary }]}>
                        Mostrar mais lições
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              );
            })}
                </View>
              );

              return isWideWeb ? (
                <ScrollView
                  style={styles.webLessonsScroll}
                  contentContainerStyle={styles.webLessonsScrollContent}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator
                >
                  {moduleList}
                </ScrollView>
              ) : moduleList;
            })()}
          </View>
          </View>

          <View style={{ height: Math.max(insets.bottom, 24) }} />
        </ScrollView>
        </>
      ) : (
        <Text style={[styles.error, { color: themeColors.textMuted }]}>Curso não encontrado</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  loadingState: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12 },
  loadingText: { fontSize: 14, fontWeight: '600' },
  hero: { width: '100%' },
  heroOverlay: { backgroundColor: 'rgba(5,12,24,0.58)' },
  webHeroFrame: { width: '100%', maxWidth: 1220, alignSelf: 'center', paddingHorizontal: 20, paddingTop: 18 },
  webHero: { minHeight: 292, borderRadius: 24, overflow: 'hidden' },
  webHeroImage: { borderRadius: 24 },
  webHeroOverlay: { minHeight: 292, justifyContent: 'space-between', borderRadius: 24 },
  webHeroTitle: { maxWidth: 760, fontSize: 38, lineHeight: 45, marginBottom: 10 },
  heroActions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 16, paddingTop: 10 },
  heroActionsSpacer: { height: 50 },
  floatingCourseNav: {
    position: 'absolute',
    left: 16,
    right: 16,
    zIndex: 20,
    elevation: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  heroIconButton: {
    width: 40, height: 40, borderRadius: 20, alignItems: 'center', justifyContent: 'center',
    backgroundColor: 'rgba(15,23,42,0.56)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.18)',
  },
  heroCopy: { paddingTop: 18, paddingBottom: 14 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 10, paddingHorizontal: 20 },
  categoryPill: { backgroundColor: 'rgba(15,23,42,0.42)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  category: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '700' },
  heroTitle: { fontSize: 25, lineHeight: 31, fontWeight: '800', color: '#fff', marginBottom: 7, paddingHorizontal: 20 },
  instructor: { color: 'rgba(255,255,255,0.88)', fontSize: 13, lineHeight: 19, marginBottom: 9, paddingHorizontal: 20 },
  description: { color: 'rgba(255,255,255,0.78)', fontSize: 13, lineHeight: 19, paddingHorizontal: 20 },
  progressContainer: { paddingHorizontal: 20, paddingTop: 18, paddingBottom: 16, borderBottomWidth: 1 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 14, fontWeight: '600' },
  progressPercent: { fontSize: 14, fontWeight: 'bold' },
  progressTrack: { height: 6, borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3 },
  courseUtilityRow: {
    minHeight: 48,
    flexDirection: 'row',
    borderBottomWidth: 1,
  },
  courseUtilityItem: {
    flex: 1,
    minWidth: 0,
    minHeight: 48,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    paddingHorizontal: 10,
  },
  courseUtilityText: { fontSize: 12.5, fontWeight: '700' },
  lockNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 4,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  lockNoticeIcon: { width: 40, height: 40, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  lockNoticeTitle: { fontSize: 14, fontWeight: '800', marginBottom: 2 },
  lockNoticeText: { fontSize: 12, lineHeight: 17 },
  lessonsLoading: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 8, marginBottom: 12 },
  emptyLessonsText: { fontSize: 13, marginTop: 8, marginBottom: 12, lineHeight: 19 },
  impactCard: { marginHorizontal: 20, marginTop: 12, marginBottom: 4, padding: 14, borderRadius: 16, borderWidth: 1 },
  impactHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  impactIcon: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  impactTitle: { fontSize: 14, fontWeight: '800' },
  impactSub: { fontSize: 12, marginTop: 2, lineHeight: 17 },
  impactScore: { fontSize: 18, fontWeight: '900' },
  impactSteps: { flexDirection: 'row', gap: 12, marginTop: 12 },
  impactStep: { fontSize: 12, fontWeight: '800' },
  impactActionBtn: {
    marginTop: 14,
    borderRadius: 16,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  impactActionText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  section: { paddingHorizontal: 20, paddingTop: 22, paddingBottom: 8 },
  sectionHeaderRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  sectionTitle: { flex: 1, minWidth: 0, fontSize: 18, fontWeight: '800' },
  sectionCourseAction: {
    minWidth: 136,
    maxWidth: 176,
    minHeight: 42,
    borderRadius: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
  },
  sectionCourseActionText: { color: '#fff', fontSize: 12.5, fontWeight: '800' },
  moduleCard: { borderRadius: 8, padding: 14, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
  lessonInfo: { flex: 1, minWidth: 0 },
  lessonTypeText: { fontSize: 10, fontWeight: '800', marginTop: 2, textTransform: 'uppercase' },
  moduleCardLocked: { opacity: 0.7 },
  moduleHeader: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 12 },
  moduleNum: { width: 34, height: 34, borderRadius: 17, justifyContent: 'center', alignItems: 'center', marginRight: 12, flexShrink: 0 },
  moduleNumText: { fontWeight: 'bold', fontSize: 14 },
  moduleTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 2 },
  moduleSub: { fontSize: 13, marginTop: 2 },
  lockHint: { fontSize: 11, fontStyle: 'italic', marginTop: 4 },
  lockedLessonsCount: { fontSize: 12, fontWeight: '700', paddingVertical: 10, paddingLeft: 38 },
  lessonRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingLeft: 8, borderTopWidth: 1 },
  lessonRowLocked: { opacity: 0.5 },
  lessonIcon: { width: 28, height: 28, borderRadius: 8, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  lessonTitle: { flex: 1, fontSize: 14, marginLeft: 0 },
  lessonPoints: { fontSize: 12, color: '#10B981', fontWeight: 'bold', marginLeft: 8 },
  showMoreLessonsBtn: { alignItems: 'center', paddingTop: 12, marginTop: 2, borderTopWidth: 1 },
  showMoreLessonsText: { fontSize: 13, fontWeight: '800' },
  enrollBtn: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginHorizontal: 24, paddingVertical: 16, borderRadius: 30, shadowOpacity: 0.4, shadowRadius: 10, elevation: 6 },
  enrollText: { color: '#fff', fontWeight: 'bold', fontSize: 18, marginLeft: 10 },
  progressSub: { fontSize: 12, marginTop: 6 },
  error: { textAlign: 'center', marginTop: 40 },
  webCourseBody: {
    width: '100%',
    maxWidth: 1180,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 24,
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  webCourseMain: {
    width: 350,
    flexShrink: 0,
    gap: 16,
  },
  webPanel: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  webUtilityRow: {
    borderWidth: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  webLessonsSidebar: {
    flex: 1,
    minWidth: 0,
    padding: 22,
    borderWidth: 1,
    borderRadius: 20,
    shadowColor: '#0F3550',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 26,
    overflow: 'hidden',
  },
  webLessonsScroll: { flex: 1, minHeight: 0 },
  webLessonsScrollContent: { paddingRight: 8, paddingBottom: 8 },
  webNextCard: {
    borderWidth: 1,
    borderRadius: 20,
    padding: 20,
  },
  webNextTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 6,
  },
  webNextText: {
    fontSize: 13,
    lineHeight: 19,
    marginBottom: 14,
  },
  webNextButton: {
    width: '100%',
    minHeight: 40,
    borderRadius: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  webNextButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '800',
  },
  webModuleCard: { borderWidth: 1, borderRadius: 14, padding: 16 },
  certOverlay: { flex: 1, backgroundColor: 'rgba(30, 41, 59, 0.95)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  certLegacyHidden: { display: 'none' },
  certCardLandscape: { width: '100%', maxWidth: 800, aspectRatio: 1.414, backgroundColor: '#fff', padding: 4, shadowColor: '#000', shadowOpacity: 0.3, shadowRadius: 30, elevation: 20, marginBottom: 24 },
  certBorderOuter: { flex: 1, borderColor: '#1CABE2', borderWidth: 2, padding: 2 },
  certBorderInner: { flex: 1, borderColor: '#1CABE2', borderWidth: 1, padding: 12, alignItems: 'center', position: 'relative' },
  certLogoText: { position: 'absolute', top: 12, left: 12, color: '#1CABE2', fontWeight: 'bold', fontSize: 12 },
  certTitleLarge: { fontSize: 20, fontWeight: '900', color: '#111827', letterSpacing: 2, marginTop: 16 },
  certSubtitle: { fontSize: 8, color: '#6B7280', letterSpacing: 1, textTransform: 'uppercase', marginTop: 2 },
  certPresentedTo: { fontSize: 9, color: '#4B5563', marginTop: 12 },
  certStudentName: { fontSize: 20, fontWeight: '800', color: '#1CABE2', fontStyle: 'italic', marginTop: 4 },
  certDividerLine: { width: '60%', height: 1, backgroundColor: '#D1D5DB', marginVertical: 8 },
  certCompletionText: { fontSize: 9, color: '#4B5563', marginBottom: 4 },
  certCourseName: { fontSize: 12, fontWeight: '900', color: '#111827', textTransform: 'uppercase', textAlign: 'center', paddingHorizontal: 12 },
  certSignatureArea: { position: 'absolute', bottom: 20, left: 12, width: 100 },
  certSignatureCursive: { fontFamily: 'serif', fontStyle: 'italic', fontSize: 14, color: '#111827', marginBottom: 2 },
  certSignatureLine: { width: '100%', height: 1, backgroundColor: '#6B7280', marginBottom: 2 },
  certSignatureRole: { fontSize: 6, fontWeight: 'bold', color: '#4B5563', letterSpacing: 1 },
  certFooterInfo: { position: 'absolute', bottom: 6, width: '100%', textAlign: 'center', fontSize: 6, color: '#9CA3AF', letterSpacing: 1 },
  certActionsRow: { flexDirection: 'row', gap: 12, alignItems: 'center' },
  certPrintBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#1CABE2', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8 },
  certPrintBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14, marginLeft: 8 },
  certCloseBtn: { backgroundColor: '#374151', paddingHorizontal: 24, paddingVertical: 14, borderRadius: 8 },
  certCloseBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 14 },
});
