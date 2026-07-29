import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Modal, Pressable, Image
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../context/ThemeContext';
import { useFocusEffect } from '@react-navigation/native';
import { Search, X, SlidersHorizontal, Heart, Star, Check, Lock } from 'lucide-react-native';
import api, { getPersistentCached } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CourseBokehBg from '../components/CourseBokehBg';
import CourseThumbnailImage from '../components/CourseThumbnailImage';
import { colors } from '../theme/colors';
import { Ionicons } from '@expo/vector-icons';
import { API_BASE as _API_BASE } from '../services/api';
import { bottomSafeSpace } from '../utils/safeArea';
import { useIsWideWeb } from '../utils/webViewport';

type StatusFilter = 'Todos' | 'Em Progresso' | 'Concluídos' | 'Favoritos';
const STATUS_TABS: StatusFilter[] = ['Todos', 'Em Progresso', 'Concluídos', 'Favoritos'];

const API_BASE = _API_BASE.replace('/api', '');

const TAP_SLOP = 12;

function visiblePublishedCourses(value: any) {
  return Array.isArray(value) ? value.filter((course) => course?.isPublished !== false) : [];
}

function getCourseLessonCount(course: any) {
  const count = course?._count?.lessons;
  return count === undefined || count === null ? null : Number(count);
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

function CourseCardPressable({
  style,
  disabled,
  onPress,
  children,
}: {
  style: any;
  disabled?: boolean;
  onPress: () => void;
  children: React.ReactNode;
}) {
  const touchStartRef = useRef({ x: 0, y: 0 });
  const movedRef = useRef(false);

  return (
    <Pressable
      style={style}
      onTouchStart={(event) => {
        const { pageX, pageY } = event.nativeEvent;
        touchStartRef.current = { x: pageX, y: pageY };
        movedRef.current = false;
      }}
      onTouchMove={(event) => {
        const { pageX, pageY } = event.nativeEvent;
        const dx = Math.abs(pageX - touchStartRef.current.x);
        const dy = Math.abs(pageY - touchStartRef.current.y);
        if (dx > TAP_SLOP || dy > TAP_SLOP) movedRef.current = true;
      }}
      onPress={() => {
        if (disabled || movedRef.current) return;
        onPress();
      }}
      android_disableSound
    >
      {children}
    </Pressable>
  );
}

export default function CoursesScreen({ navigation, route }: any) {
  const { colors: themeColors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const isWideWeb = useIsWideWeb(900);
  const [courses, setCourses] = useState<any[]>([]);
  const [pathways, setPathways] = useState<any[]>([]);
  const [pathwayCourseIds, setPathwayCourseIds] = useState<Set<string> | null>(null);
  const [enrollments, setEnrollments] = useState<Record<string, number>>({});
  const [completedCourseIds, setCompletedCourseIds] = useState<Set<string>>(new Set());
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [selectedPathway, setSelectedPathway] = useState<any | null>(null);
  const [statusTab, setStatusTab] = useState<StatusFilter>('Todos');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');

  const loadFavorites = async () => {
    try {
      const raw = await AsyncStorage.getItem('maza_favorites');
      if (raw) setFavorites(new Set(JSON.parse(raw)));
    } catch {}
  };

  const saveFavorites = async (favs: Set<string>) => {
    await AsyncStorage.setItem('maza_favorites', JSON.stringify([...favs]));
  };

  const toggleFavorite = async (courseId: string) => {
    const next = new Set(favorites);
    next.has(courseId) ? next.delete(courseId) : next.add(courseId);
    setFavorites(next);
    await saveFavorites(next);
  };

  const fetchAll = useCallback(async () => {
    try {
      const [coursesRes, pathwaysRes] = await Promise.all([
        getPersistentCached('/courses', 2 * 60 * 1000, (staleCourses) => {
          setCourses(visiblePublishedCourses(staleCourses));
          setLoading(false);
        }),
        getPersistentCached('/pathways', 2 * 60 * 1000, (stalePathways) => {
          setPathways(Array.isArray(stalePathways) ? stalePathways : []);
          setLoading(false);
        }),
      ]);
      setCourses(visiblePublishedCourses(coursesRes));
      setPathways(Array.isArray(pathwaysRes) ? pathwaysRes : []);

      try {
        const meRes = await api.get('/auth/me');
        const progMap: Record<string, number> = {};
        const completedSet = new Set<string>();
        (meRes.data.enrollments ?? []).forEach((e: any) => {
          progMap[e.courseId] = e.progress ?? 0;
          if (e.completedAt || (e.progress ?? 0) >= 100) completedSet.add(e.courseId);
        });
        setEnrollments(progMap);
        setCompletedCourseIds(completedSet);
      } catch {}
    } catch {
    } finally {
      setLoading(false);
      await loadFavorites();
    }
  }, []);

  useFocusEffect(useCallback(() => { fetchAll(); }, [fetchAll]));

  useEffect(() => {
    if (route.params?.pathwayId && pathways.length > 0) {
      const p = pathways.find(p => p.id === route.params.pathwayId);
      if (p && selectedPathway?.id !== p.id) {
        selectPathway(p);
      }
    }
  }, [route.params?.pathwayId, pathways]);

  const selectPathway = async (pathway: any | null) => {
    setShowFilterModal(false);
    if (!pathway) {
      setSelectedPathway(null);
      setPathwayCourseIds(null);
      return;
    }
    setSelectedPathway(pathway);
    const localIds = new Set<string>((pathway.courses ?? []).map((pc: any) => pc.courseId).filter(Boolean));
    if (localIds.size > 0) {
      setPathwayCourseIds(localIds);
      return;
    }
    try {
      const res = await api.get(`/pathways/${pathway.id}`);
      const ids = new Set<string>((res.data.courses ?? []).map((pc: any) => pc.courseId));
      setPathwayCourseIds(ids);
    } catch {
      setPathwayCourseIds(null);
    }
  };

  const filtered = useMemo(() => courses.filter((c) => {
    const lessonCount = getCourseLessonCount(c);
    const hasCourseContent = lessonCount === null || lessonCount > 0;
    const matchesSearch = (c.title || '').toLowerCase().includes((search || '').toLowerCase());
    const matchesPathway = !pathwayCourseIds || pathwayCourseIds.has(c.id);
    let matchesStatus = true;
    if (statusTab === 'Em Progresso') {
      const p = enrollments[c.id];
      matchesStatus = p !== undefined && p > 0 && p < 100;
    } else if (statusTab === 'Concluídos') {
      matchesStatus = (enrollments[c.id] ?? 0) >= 100;
    } else if (statusTab === 'Favoritos') {
      matchesStatus = favorites.has(c.id);
    }
    return hasCourseContent && matchesSearch && matchesPathway && matchesStatus;
  }), [completedCourseIds, courses, enrollments, favorites, pathwayCourseIds, search, statusTab]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: themeColors.background }]}>
      <View style={isWideWeb ? styles.webPage : undefined}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: themeColors.text }]}>Cursos</Text>
      </View>

      <View style={styles.searchRow}>
        <View style={[styles.searchBox, { backgroundColor: themeColors.card }]}>
          <Search color={themeColors.textMuted} size={18} />
          <TextInput
            style={[styles.searchInput, { color: themeColors.text }]}
            placeholder="Pesquisar cursos"
            placeholderTextColor={themeColors.textMuted}
            value={search}
            onChangeText={setSearch}
          />
          {search.length > 0 && (
            <TouchableOpacity onPress={() => setSearch('')}>
              <X size={16} color={themeColors.textMuted} />
            </TouchableOpacity>
          )}
        </View>

        <TouchableOpacity
          style={[styles.filterBtn, { backgroundColor: themeColors.card }]}
          onPress={() => setViewMode(prev => prev === 'grid' ? 'list' : 'grid')}
        >
          <Ionicons name={viewMode === 'grid' ? 'list-outline' : 'grid-outline'} size={20} color={themeColors.text} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterBtn,
            { backgroundColor: themeColors.card },
            selectedPathway && { backgroundColor: (PATHWAY_META[selectedPathway.name]?.color ?? themeColors.primary) + '18' },
          ]}
          onPress={() => setShowFilterModal(true)}
          accessibilityLabel="Filtrar cursos"
        >
          <SlidersHorizontal size={18} color={selectedPathway ? PATHWAY_META[selectedPathway.name]?.color ?? themeColors.primary : themeColors.text} />
        </TouchableOpacity>
      </View>

      {selectedPathway && (
        <View style={[styles.activeBadge, { backgroundColor: themeColors.card, borderColor: PATHWAY_META[selectedPathway.name]?.color ?? themeColors.primary }]}>
          <Text style={[styles.activeBadgeText, { color: PATHWAY_META[selectedPathway.name]?.color ?? themeColors.primary }]}>
            <Ionicons name={PATHWAY_META[selectedPathway.name]?.icon as any} size={12} color={PATHWAY_META[selectedPathway.name]?.color ?? themeColors.primary} /> {selectedPathway.name}
          </Text>
          <TouchableOpacity onPress={() => selectPathway(null)}>
            <X size={13} color={PATHWAY_META[selectedPathway.name]?.color ?? themeColors.primary} />
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.statusRow}>
        {STATUS_TABS.map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[
              styles.pill, 
              { backgroundColor: themeColors.card, borderColor: themeColors.border },
              statusTab === tab && { backgroundColor: themeColors.primary, borderColor: themeColors.primary }
            ]}
            onPress={() => setStatusTab(tab)}
            activeOpacity={0.75}
          >
            {tab === 'Favoritos' && (
              <Heart size={11} color={statusTab === tab ? '#fff' : themeColors.textMuted} fill={statusTab === tab ? '#fff' : 'none'} />
            )}
            <Text style={[styles.pillText, { color: themeColors.textMuted }, statusTab === tab && { color: '#fff' }]} numberOfLines={1}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator color={themeColors.primary} style={{ marginTop: 40 }} />
      ) : filtered.length === 0 ? (
        <View style={styles.emptyState}>
          <View style={styles.emptyEmoji}>
            {statusTab === 'Favoritos' ? <Ionicons name="heart-outline" size={48} color={themeColors.textMuted} /> : 
             statusTab === 'Em Progresso' ? <Ionicons name="book-outline" size={48} color={themeColors.textMuted} /> : 
             statusTab === 'Concluídos' ? <Ionicons name="trophy-outline" size={48} color={themeColors.textMuted} /> : 
             <Ionicons name="search-outline" size={48} color={themeColors.textMuted} />}
          </View>
          <Text style={[styles.emptyTitle, { color: themeColors.text }]}>
            {selectedPathway && pathwayCourseIds?.size === 0 ? 'Cursos em preparação' :
             statusTab === 'Favoritos' ? 'Sem favoritos ainda' :
             statusTab === 'Em Progresso' ? 'Nenhum curso em progresso' :
             statusTab === 'Concluídos' ? 'Nenhum curso concluído' : 'Nenhum curso encontrado'}
          </Text>
          <Text style={[styles.emptySubtitle, { color: themeColors.textMuted }]}>
            {selectedPathway && pathwayCourseIds?.size === 0 ? 'Esta jornada já pode ser selecionada. Os cursos estarão disponíveis em breve.' :
             statusTab === 'Favoritos' ? 'Toque no ❤️ de um curso para guardar.' :
             statusTab === 'Em Progresso' ? 'Comece um curso para o ver aqui.' :
             statusTab === 'Concluídos' ? 'Complete um curso para ganhar certificado.' : 'Tente outro termo ou jornada.'}
          </Text>
        </View>
      ) : (
        <ScrollView
          key={viewMode}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.gridContainer, { paddingBottom: bottomSafeSpace(insets.bottom, 24) }]}
        >
          <Text style={[styles.count, { color: themeColors.textMuted }]}>{filtered.length} curso{filtered.length !== 1 ? 's' : ''}</Text>
          <View style={viewMode === 'list' ? styles.list : styles.grid}>
            {filtered.map((course) => {
              const isFav = favorites.has(course.id);
              const progress = enrollments[course.id];
              const isLocked = !!(course.prerequisiteCourseId && !completedCourseIds.has(course.prerequisiteCourseId));
              const prereqTitle = isLocked
                ? courses.find((c) => c.id === course.prerequisiteCourseId)?.title ?? 'outro curso'
                : null;

              return (
                <CourseCardPressable
                  key={course.id}
                  style={[
                    styles.card,
                    { backgroundColor: themeColors.card }, 
                    isLocked && { opacity: 0.7 },
                    viewMode === 'list' && styles.cardList,
                    isWideWeb && viewMode === 'grid' && styles.webCard,
                    isWideWeb && viewMode === 'list' && styles.webCardList,
                    isWideWeb && viewMode === 'list' && { borderColor: themeColors.border },
                  ]}
                  disabled={isLocked}
                  onPress={() => {
                    navigation.navigate('CourseDetail', {
                      courseId: course.id,
                      title: course.title,
                      course: { ...course, isLocked, prerequisiteTitle: prereqTitle },
                    });
                  }}
                >
                  <View style={[
                    styles.cardImg, 
                    { backgroundColor: isDark ? '#1e293b' : '#EEF2FF' },
                    viewMode === 'list' && styles.cardImgList,
                    isWideWeb && viewMode === 'list' && styles.webCardImgList,
                  ]}>
                    <CourseThumbnailImage
                        courseId={course.id}
                        title={course.title}
                        thumbnail={course.thumbnail}
                        style={{ borderRadius: 12 }}
                      />
                    {isLocked ? (
                      <View style={[styles.favBtn, { backgroundColor: isDark ? '#334155' : '#F1F5F9', borderRadius: 20, padding: 4 }]}>
                        <Lock size={13} color={themeColors.textMuted} />
                      </View>
                    ) : (
                      <TouchableOpacity style={[styles.favBtn, { backgroundColor: themeColors.card }]} onPress={() => toggleFavorite(course.id)}>
                        <Heart size={13} color={isFav ? '#EF4444' : '#94A3B8'} fill={isFav ? '#EF4444' : 'none'} />
                      </TouchableOpacity>
                    )}
                  </View>

                  <View style={[styles.cardBody, isWideWeb && viewMode === 'list' && styles.webCardBodyList]}>
                    <View>
                      <Text
                        style={[
                          styles.cardCat,
                          { color: isDark ? '#a78bfa' : '#8B5CF6' },
                          isWideWeb && viewMode === 'list' && styles.webListCategory,
                        ]}
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {getCourseCategoryLabel(course)}
                      </Text>
                      <Text
                        style={[
                          styles.cardTitle,
                          { color: themeColors.text },
                          viewMode === 'list' && { minHeight: 0 },
                          isWideWeb && viewMode === 'list' && styles.webListTitle,
                        ]}
                        numberOfLines={2}
                      >
                        {course.title}
                      </Text>
                      <Text
                        style={[
                          styles.cardInstructor,
                          { color: themeColors.textMuted },
                          isWideWeb && viewMode === 'list' && styles.webListInstructor,
                        ]}
                        numberOfLines={1}
                      >
                        <Ionicons name="person-outline" size={isWideWeb && viewMode === 'list' ? 12 : 10} color={themeColors.textMuted} /> {course.instructor}
                      </Text>

                      {isLocked && (
                        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4, marginBottom: 7 }}>
                          <Lock size={11} color="#F59E0B" />
                          <Text style={{ fontSize: 10, color: isDark ? '#fbbf24' : '#B45309', flexShrink: 1 }} numberOfLines={1}>
                            Requer: {prereqTitle}
                          </Text>
                        </View>
                      )}

                      {!isLocked && progress !== undefined && (
                        <View style={[
                          styles.progressWrap,
                          viewMode === 'list' && { marginBottom: 4 },
                          isWideWeb && viewMode === 'list' && styles.webListProgressWrap,
                        ]}>
                          <View style={[
                            styles.progressTrack,
                            { backgroundColor: isDark ? '#334155' : '#E2E8F0' },
                            isWideWeb && viewMode === 'list' && styles.webListProgressTrack,
                          ]}>
                            <View style={[styles.progressBar, { width: `${Math.min(progress, 100)}%`, backgroundColor: progress >= 100 ? themeColors.success : themeColors.primary }]} />
                          </View>
                          <Text style={[
                            styles.progressLabel,
                            { color: progress >= 100 ? themeColors.success : themeColors.primary },
                            isWideWeb && viewMode === 'list' && styles.webListProgressLabel,
                          ]}>
                            {progress >= 100 ? <Ionicons name="checkmark-circle" size={isWideWeb && viewMode === 'list' ? 12 : 9} color={themeColors.success} /> : `${Math.round(progress)}%`}
                          </Text>
                        </View>
                      )}
                    </View>

                    <View style={[
                      styles.cardFooter,
                      { borderTopColor: themeColors.border },
                      viewMode === 'list' && { borderTopWidth: 0, paddingTop: 2 },
                      isWideWeb && viewMode === 'list' && styles.webListFooter,
                    ]}>
                      <Text style={[
                        styles.modules,
                        { color: themeColors.textMuted },
                        isWideWeb && viewMode === 'list' && styles.webListModules,
                      ]} numberOfLines={1}>
                        <Ionicons name="cube-outline" size={isWideWeb && viewMode === 'list' ? 12 : 10} color={themeColors.textMuted} /> {course._count?.modules ?? 0} {(course._count?.modules ?? 0) === 1 ? 'Módulo' : 'Módulos'}
                        {'  '}
                        <Ionicons name="document-text-outline" size={isWideWeb && viewMode === 'list' ? 12 : 10} color={themeColors.textMuted} /> {course._count?.lessons ?? 0} {(course._count?.lessons ?? 0) === 1 ? 'Aula' : 'Aulas'}
                      </Text>
                      <View style={styles.ratingRow}>
                        <Star color={themeColors.secondary} fill={themeColors.secondary} size={isWideWeb && viewMode === 'list' ? 13 : 11} />
                        <Text style={[
                          styles.rating,
                          { color: themeColors.text },
                          isWideWeb && viewMode === 'list' && styles.webListRating,
                        ]}>{course.rating}</Text>
                      </View>
                    </View>
                  </View>
                </CourseCardPressable>
              );
            })}
          </View>
        </ScrollView>
      )}
      </View>

      <Modal visible={showFilterModal} transparent animationType="slide" onRequestClose={() => setShowFilterModal(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowFilterModal(false)}>
          <Pressable
            style={[styles.modalSheet, { backgroundColor: themeColors.card, paddingBottom: bottomSafeSpace(insets.bottom, 20) }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={[styles.modalHandle, { backgroundColor: themeColors.border }]} />
            <Text style={[styles.modalTitle, { color: themeColors.text }]}>Filtrar por Jornada</Text>
            <Text style={[styles.modalSub, { color: themeColors.textMuted }]}>Selecione uma jornada para filtrar os cursos</Text>

            <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 420 }}>
              <TouchableOpacity
                style={[styles.pwOption, { backgroundColor: isDark ? '#1e293b' : '#F8FAFC' }, !selectedPathway && { backgroundColor: themeColors.primary + '15' }]}
                onPress={() => selectPathway(null)}
              >
                <Ionicons name="globe-outline" size={22} color={!selectedPathway ? themeColors.primary : themeColors.text} style={styles.pwOptionIcon} />
                <Text style={[styles.pwOptionName, { color: themeColors.text }, !selectedPathway && { color: themeColors.primary, fontWeight: '700' }]}>
                  Todas as Jornadas
                </Text>
                {!selectedPathway && <Check size={16} color={themeColors.primary} />}
              </TouchableOpacity>

              {pathways.map((pw) => {
                const meta = PATHWAY_META[pw.name] ?? { icon: '📚', color: themeColors.primary };
                const isSelected = selectedPathway?.id === pw.id;
                return (
                  <TouchableOpacity
                    key={pw.id}
                    style={[
                      styles.pwOption, 
                      { backgroundColor: isDark ? '#1e293b' : '#F8FAFC' },
                      isSelected && { backgroundColor: meta.color + '15', borderColor: meta.color + '40', borderWidth: 1 }
                    ]}
                    onPress={() => selectPathway(pw)}
                  >
                    <Ionicons name={meta.icon as any} size={22} color={meta.color} style={styles.pwOptionIcon} />
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.pwOptionName, { color: themeColors.text }, isSelected && { color: meta.color, fontWeight: '700' }]}>
                        {pw.name}
                      </Text>
                      {pw._count?.courses > 0 && (
                        <Text style={[styles.pwOptionCount, { color: themeColors.textMuted }]}>{pw._count.courses} curso{pw._count.courses !== 1 ? 's' : ''}</Text>
                      )}
                    </View>
                    {isSelected && <Check size={16} color={meta.color} />}
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            <TouchableOpacity style={[styles.modalClose, { backgroundColor: isDark ? '#334155' : '#F1F5F9' }]} onPress={() => setShowFilterModal(false)}>
              <Text style={[styles.modalCloseText, { color: themeColors.textMuted }]}>Fechar</Text>
            </TouchableOpacity>
          </Pressable>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  webPage: { flex: 1, width: '100%', maxWidth: 1200, alignSelf: 'center', paddingTop: 20 },
  header: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 8 },
  title: { fontSize: 26, fontWeight: 'bold' },
  searchRow: { flexDirection: 'row', alignItems: 'center', paddingHorizontal: 20, marginBottom: 10, gap: 8 },
  searchBox: { flex: 1, flexDirection: 'row', alignItems: 'center', borderRadius: 14, paddingHorizontal: 14, height: 46, shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 15 },
  filterBtn: { borderRadius: 14, width: 46, height: 46, justifyContent: 'center', alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  filterBtnIcon: { fontSize: 20 },
  activeBadge: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginHorizontal: 20, marginBottom: 10, paddingHorizontal: 12, paddingVertical: 7, borderRadius: 20, borderWidth: 1.5 },
  activeBadgeText: { fontSize: 12, fontWeight: '700', flex: 1 },
  statusRow: { flexDirection: 'row', paddingHorizontal: 16, gap: 6, marginBottom: 12, alignItems: 'center', justifyContent: 'center' },
  pill: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, height: 36, borderRadius: 18, borderWidth: 1.5 },
  pillText: { fontSize: 11, fontWeight: '600', lineHeight: 14 },
  gridContainer: { paddingHorizontal: 20 },
  count: { fontSize: 13, fontWeight: '500', marginBottom: 12 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 12 },
  list: { flexDirection: 'column', flexWrap: 'nowrap', justifyContent: 'flex-start', rowGap: 12, width: '100%' },
  card: { width: '48.5%', borderRadius: 16, padding: 10, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 8, elevation: 2 },
  webCard: { width: '23.8%', minWidth: 238, maxWidth: 276, borderRadius: 18, padding: 12, shadowOpacity: 0.07, shadowRadius: 14 },
  webCardList: { borderRadius: 18, padding: 14, minHeight: 144, borderWidth: 1, shadowOpacity: 0.06, shadowRadius: 16 },
  cardList: { width: '100%', maxWidth: '100%', alignSelf: 'stretch', flexDirection: 'row', padding: 10 },
  cardImg: { width: '100%', aspectRatio: 16 / 9, borderRadius: 12, marginBottom: 9, justifyContent: 'center', alignItems: 'center', position: 'relative', overflow: 'hidden' },
  cardImgList: { width: 112, height: 72, aspectRatio: undefined, marginBottom: 0, marginRight: 12, flexShrink: 0 },
  webCardImgList: { width: 184, height: 116, borderRadius: 14, marginRight: 18 },
  favBtn: { position: 'absolute', top: 6, right: 6, borderRadius: 12, padding: 5, elevation: 4, zIndex: 5 },
  cardBody: { flex: 1, justifyContent: 'space-between' },
  webCardBodyList: { minWidth: 0, paddingVertical: 1 },
  cardCat: { width: '100%', flexShrink: 1, fontSize: 10, fontWeight: 'bold', marginBottom: 3 },
  webListCategory: { fontSize: 11, lineHeight: 15, marginBottom: 4 },
  cardTitle: { fontSize: 12, fontWeight: 'bold', marginBottom: 4, minHeight: 32 },
  webListTitle: { fontSize: 16, lineHeight: 21, marginBottom: 5 },
  cardInstructor: { fontSize: 10, marginBottom: 7 },
  webListInstructor: { fontSize: 12, lineHeight: 16, marginBottom: 8 },
  progressWrap: { marginBottom: 7 },
  webListProgressWrap: { marginTop: 2, marginBottom: 6 },
  progressTrack: { height: 3, borderRadius: 2, overflow: 'hidden', marginBottom: 2 },
  webListProgressTrack: { height: 5, borderRadius: 3, marginBottom: 4 },
  progressBar: { height: '100%', borderRadius: 2 },
  progressLabel: { fontSize: 9, fontWeight: 'bold' },
  webListProgressLabel: { fontSize: 11, lineHeight: 14 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderTopWidth: 1, paddingTop: 7 },
  webListFooter: { minHeight: 20, paddingTop: 4 },
  modules: { fontSize: 10 },
  webListModules: { fontSize: 12, lineHeight: 16 },
  ratingRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  rating: { fontSize: 10, fontWeight: 'bold' },
  webListRating: { fontSize: 12 },
  emptyState: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 },
  emptyEmoji: { marginBottom: 12 },
  emptyTitle: { fontSize: 17, fontWeight: 'bold', marginBottom: 6, textAlign: 'center' },
  emptySubtitle: { fontSize: 13, textAlign: 'center', lineHeight: 20 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.4)', justifyContent: 'flex-end' },
  modalSheet: { borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, paddingBottom: 36 },
  modalHandle: { width: 40, height: 4, borderRadius: 2, alignSelf: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 4 },
  modalSub: { fontSize: 12, marginBottom: 14 },
  pwOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderRadius: 12, marginBottom: 6, gap: 10 },
  pwOptionIcon: { marginRight: 4 },
  pwOptionName: { fontSize: 13, fontWeight: '600' },
  pwOptionCount: { fontSize: 11, marginTop: 1 },
  modalClose: { marginTop: 10, paddingVertical: 14, borderRadius: 30, alignItems: 'center' },
  modalCloseText: { fontWeight: '600', fontSize: 15 },
});
