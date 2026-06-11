import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Modal, ImageBackground, Alert, Dimensions, RefreshControl
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

export default function CourseDetailScreen({ route, navigation }: any) {
  const { colors: themeColors, isDark } = useTheme();
  const { courseId } = route.params;
  const { user } = useAuth();
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

  const { width } = Dimensions.get('window');

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
          try {
            const cachedCourse = await getPersistentCached(courseUrl, 10 * 60 * 1000);
            if (cachedCourse) {
              setCourse(cachedCourse);
              setDetailLoaded(true);
            }
          } catch {}
        });

      const progressPromise = api.get(progressUrl)
        .then((progressRes) => {
          setProgress(progressRes.data);
        })
        .catch(() => {
          if (mode !== 'background') setProgress(null);
        });

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
  }, [courseId]);

  useEffect(() => {
    didFirstLoadRef.current = false;
    setCourse(initialCourse);
    setProgress(null);
    setLoading(!initialCourse);
    setRefreshing(false);
    setDetailLoaded(false);
  }, [courseId, initialCourse]);

  useEffect(() => {
    if (courseId) trackActivity({ type: 'COURSE_OPEN', courseId });
  }, [courseId]);

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
  const completedLessons = progress?.modules?.reduce(
    (a: number, m: any) => a + (m.lessons?.filter((l: any) => l.isCompleted).length ?? 0), 0
  ) ?? 0;

  const enrollmentProgress = progress?.enrollmentProgress ?? 0;
  const hasStarted = enrollmentProgress > 0 || completedLessons > 0;
  const impact = progress?.impact;
  const prerequisite = progress?.prerequisite;
  const prerequisiteTitle = prerequisite?.title ?? course?.prerequisiteTitle ?? course?.prerequisiteCourse?.title ?? 'o curso anterior';
  const courseLocked = prerequisite ? !!(prerequisite.required && !prerequisite.completed) : !!course?.isLocked || !!course?.prerequisiteCourseId;
  const hasLessons = totalLessons > 0;
  const detailsPending = !detailLoaded && !hasLessons;
  const ctaDisabled = courseLocked || detailsPending || !hasLessons;
  const baselinePending = !courseLocked && !!impact?.baselineRequired && !impact?.baselineCompleted;
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
    if (!progress?.modules) return null;
    for (const mod of progress.modules) {
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
    if (!prefetchLessonId) return;
    getPersistentCached(`/courses/lessons/${prefetchLessonId}`, 30 * 60 * 1000).catch(() => {});
  }, [prefetchLessonId]);

  const handleCTA = async () => {
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

  const ctaLabel = courseLocked
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
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: Math.max(insets.bottom, 24) + 96 }}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => fetchData('manual')} />}
        >
          {(() => {
            const thumbUri = resolveThumbnail(course.thumbnail);
            const heroContent = (
              <View style={[styles.heroOverlay, { paddingTop: insets.top }]}>
                <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                  <Text style={styles.backText}>← Voltar</Text>
                </TouchableOpacity>
                {courseCategories.length > 0 && (
                  <View style={styles.categoryRow}>
                    {courseCategories.map((category: any) => (
                      <View key={category.id ?? category.name} style={styles.categoryPill}>
                        <Text style={styles.category}>{category.icon ? `${category.icon} ` : ''}{category.name}</Text>
                      </View>
                    ))}
                  </View>
                )}
                <Text style={styles.heroTitle}>{course.title}</Text>
                <Text style={styles.instructor}><Ionicons name="person-outline" size={14} color="rgba(255,255,255,0.85)" /> {course.instructor}</Text>
                <Text style={styles.description}>{course.description}</Text>
              </View>
            );
            if (thumbUri) {
              return (
                <ImageBackground
                  source={{ uri: thumbUri }}
                  style={styles.hero}
                  imageStyle={{ resizeMode: 'cover' }}
                >
                  {heroContent}
                </ImageBackground>
              );
            }
            return (
              <CourseBokehBg courseId={course.id} title={course.title} width={width} height={220} style={{ width: '100%' }}>
                {heroContent}
              </CourseBokehBg>
            );
          })()}

          {hasLessons && progress && (
            <View style={[styles.progressContainer, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
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

          {impact?.required && (
            <View style={[styles.impactCard, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
              <View style={styles.impactHeader}>
                <View style={[styles.impactIcon, { backgroundColor: themeColors.primary + '18' }]}>
                  <ClipboardList size={18} color={themeColors.primary} />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.impactTitle, { color: themeColors.text }]}>Impacto de aprendizagem</Text>
                  <Text style={[styles.impactSub, { color: themeColors.textMuted }]}>
                    Baseline e endline medem a evolução neste curso.
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

          {hasLessons && (
          <View style={[styles.statsRow, { backgroundColor: themeColors.card, borderColor: themeColors.border }]}>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: themeColors.text }]}>{course._count?.enrollments ?? 0}</Text>
              <Text style={[styles.statLbl, { color: themeColors.textMuted }]}>Alunos</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: themeColors.text }]}>{totalLessons}</Text>
              <Text style={[styles.statLbl, { color: themeColors.textMuted }]}>Lições</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: themeColors.text }]}>
                {course.rating > 0 ? <><Ionicons name="star" size={16} color="#F59E0B" /> {course.rating.toFixed(1)}</> : '—'}
              </Text>
              <Text style={[styles.statLbl, { color: themeColors.textMuted }]}>Avaliação</Text>
            </View>
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
          <TouchableOpacity
            style={[styles.communityBtn, { backgroundColor: themeColors.primary + '12', borderColor: themeColors.primary + '40' }]}
            onPress={() => navigation.navigate('CourseForum', { courseId, courseTitle: course.title })}
          >
            <MessageCircle size={18} color={themeColors.primary} />
            <Text style={[styles.communityBtnText, { color: themeColors.primary }]}>Comunidade do Curso</Text>
          </TouchableOpacity>
          )}

          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: themeColors.text }]}>Conteúdo do Curso</Text>
            {detailsPending && (
              <View style={styles.lessonsLoading}>
                <ActivityIndicator size="small" color={themeColors.primary} />
                <Text style={[styles.emptyLessonsText, { color: themeColors.textMuted }]}>A carregar lições...</Text>
              </View>
            )}
            {!hasLessons && detailLoaded && (
              <Text style={[styles.emptyLessonsText, { color: themeColors.textMuted }]}>As lições serão adicionadas em breve.</Text>
            )}
            {course.modules?.map((mod: any, idx: number) => {
              const modProgress = getModuleProgress(mod.id);
              const isUnlocked = !courseLocked && !baselinePending && (modProgress?.isUnlocked ?? (idx === 0));
              const isCompleted = modProgress?.isCompleted ?? false;

              return (
                <View key={mod.id} style={[styles.moduleCard, { backgroundColor: themeColors.card }, !isUnlocked && styles.moduleCardLocked]}>
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
                      {mod.description && <Text style={[styles.moduleSub, { color: themeColors.textMuted }]}>{mod.description}</Text>}
                      {!isUnlocked && <Text style={[styles.lockHint, { color: themeColors.textMuted }]}><Ionicons name="lock-closed-outline" size={11} color={themeColors.textMuted}/> Complete o módulo anterior para desbloquear</Text>}
                    </View>
                  </View>

                  {!isUnlocked && (mod.lessonCount ?? mod._count?.lessons ?? 0) > 0 && (
                    <Text style={[styles.lockedLessonsCount, { color: themeColors.textMuted }]}>
                      {mod.lessonCount ?? mod._count?.lessons} lições bloqueadas
                    </Text>
                  )}

                  {(mod.lessons ?? []).slice(0, expandedModules[mod.id] ?? LESSONS_BATCH_SIZE).map((lesson: any) => {
                    const lessonDone = getLessonCompleted(mod.id, lesson.id);
                    const Icon = CONTENT_ICONS[lesson.contentType] ?? Play;
                    const iconColor = CONTENT_COLORS[lesson.contentType] ?? themeColors.primary;

                    return (
                      <TouchableOpacity
                        key={lesson.id}
                        style={[styles.lessonRow, { borderTopColor: themeColors.border }, !isUnlocked && styles.lessonRowLocked]}
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

          <TouchableOpacity
            style={[
              styles.enrollBtn,
              { backgroundColor: themeColors.primary, shadowColor: themeColors.primary },
              isComplete && { backgroundColor: themeColors.success, shadowColor: themeColors.success },
              ctaDisabled && { backgroundColor: themeColors.textMuted, shadowColor: themeColors.textMuted },
            ]}
            onPress={handleCTA}
          >
            {courseLocked ? <Lock size={20} color="#fff" /> : isComplete ? <Award size={20} color="#fff" /> : <BookOpen size={20} color="#fff" />}
            <Text style={[styles.enrollText, { color: '#fff' }]}>{ctaLabel}</Text>
          </TouchableOpacity>
          <View style={{ height: Math.max(insets.bottom, 24) }} />
        </ScrollView>
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
  backBtn: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  backText: { color: 'rgba(255,255,255,0.9)', fontSize: 16, fontWeight: '600' },
  hero: { minHeight: 220 },
  heroOverlay: { flex: 1, minHeight: 220, backgroundColor: 'rgba(0,0,0,0.48)', paddingBottom: 24 },
  categoryRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 8, paddingHorizontal: 24 },
  categoryPill: { backgroundColor: 'rgba(15,23,42,0.42)', borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4 },
  category: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '700' },
  heroTitle: { fontSize: 24, fontWeight: 'bold', color: '#fff', marginBottom: 8, paddingHorizontal: 24 },
  instructor: { color: 'rgba(255,255,255,0.85)', fontSize: 14, marginBottom: 12, paddingHorizontal: 24 },
  description: { color: 'rgba(255,255,255,0.75)', fontSize: 14, lineHeight: 22, paddingHorizontal: 24 },
  progressContainer: { padding: 20, borderBottomWidth: 1 },
  progressRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  progressLabel: { fontSize: 14, fontWeight: '600' },
  progressPercent: { fontSize: 14, fontWeight: 'bold' },
  progressTrack: { height: 8, borderRadius: 4, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  statsRow: { flexDirection: 'row', borderBottomWidth: 1 },
  statBox: { flex: 1, alignItems: 'center', paddingVertical: 16 },
  statNum: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  communityBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    marginHorizontal: 24, marginVertical: 12,
    borderRadius: 14, paddingVertical: 13, borderWidth: 1.5, gap: 8,
  },
  communityBtnText: { fontSize: 14, fontWeight: '700' },
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
  statLbl: { fontSize: 12 },
  section: { padding: 24 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  moduleCard: { borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOpacity: 0.03, shadowRadius: 5, elevation: 1 },
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
